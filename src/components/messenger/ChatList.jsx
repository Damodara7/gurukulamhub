'use client'
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  Avatar,
  TextField,
  InputAdornment,
  CircularProgress,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  useMediaQuery,
  alpha,
  Divider,
  Chip,
  Tabs,
  Tab,
} from '@mui/material'
import { 
  Search as SearchIcon, 
  Group as GroupIcon, 
  Person as PersonIcon, 
  Send as SendIcon
} from '@mui/icons-material'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { format, isToday, isYesterday } from 'date-fns'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { toast } from 'react-toastify'
import { stringToColor } from '@/utils/stringToColor'
import * as ChatEncryption from '@/utils/chatEncryption'

// Helper function to get avatar background color with contrast adjustment (same as in chat pages)
const getAvatarBackgroundColor = (inputString) => {
  if (!inputString) return null
  let color = stringToColor(inputString)
  
  const hex = color.replace('#', '')
  let r = parseInt(hex.substr(0, 2), 16)
  let g = parseInt(hex.substr(2, 2), 16)
  let b = parseInt(hex.substr(4, 2), 16)
  
  const getLuminance = (r, g, b) => {
    const [rs, gs, bs] = [r, g, b].map(val => {
      val = val / 255
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
  }
  
  let luminance = getLuminance(r, g, b)
  
  let attempts = 0
  while (luminance > 0.4 && attempts < 10) {
    r = Math.max(0, Math.floor(r * 0.7))
    g = Math.max(0, Math.floor(g * 0.7))
    b = Math.max(0, Math.floor(b * 0.7))
    luminance = getLuminance(r, g, b)
    attempts++
  }
  
  const maxChannel = Math.max(r, g, b)
  if (maxChannel < 80) {
    const boost = 80 / maxChannel
    r = Math.min(255, Math.floor(r * boost))
    g = Math.min(255, Math.floor(g * boost))
    b = Math.min(255, Math.floor(b * boost))
  }
  
  color = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
  
  return color
}

// Helper function to normalize chatId for comparison (decode and sort emails)
const normalizeChatIdForComparison = (id) => {
  if (!id) return id
  try {
    let decoded = id
    // Try decoding multiple times (handles URL encoding)
    for (let i = 0; i < 3; i++) {
      try {
        const testDecode = decodeURIComponent(decoded)
        if (testDecode === decoded) break // No more decoding needed
        decoded = testDecode
      } catch (e) {
        break // Can't decode further
      }
    }
    const [email1, email2] = decoded.split('_')
    if (!email1 || !email2) return decoded // Invalid format
    // Sort emails to ensure consistent format
    const sorted = [email1.toLowerCase().trim(), email2.toLowerCase().trim()].sort()
    return `${sorted[0]}_${sorted[1]}`
  } catch (e) {
    return id // Return original if normalization fails
  }
}

const ChatList = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isDarkMode = theme.palette.mode === 'dark'
  const { data: session } = useSession()
  const router = useRouter()

  const [chats, setChats] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchDialogOpen, setSearchDialogOpen] = useState(false)
  const [searchEmail, setSearchEmail] = useState('')
  const [searching, setSearching] = useState(false)
  const [searchResult, setSearchResult] = useState(null)
  const [activeTab, setActiveTab] = useState(0) // 0: All, 1: Individual, 2: Groups, 3: Classroom groups, 4: Unread

  // Calculate counts for each tab
  const tabCounts = useMemo(() => {
    const allCount = chats.length
    const individualCount = chats.filter(chat => chat.type === 'individual').length
    const classroomGroupsCount = chats.filter(chat => chat.type === 'group' && chat.groupType === 'classroom').length
    const groupsCount = chats.filter(chat => chat.type === 'group' && chat.groupType==='normal').length
    const unreadCount = chats.filter(chat => (chat.unreadCount || 0) > 0).length
    
    return {
      all: allCount,
      individual: individualCount,
      classroomGroups: classroomGroupsCount,
      groups: groupsCount,
      unread: unreadCount
    }
  }, [chats])

  // Refs
  const messengerSocketRef = useRef(null)
  const hasFetchedRef = useRef(false)
  const isFetchingRef = useRef(false)

  // Fetch chats from backend
  const fetchChats = useCallback(async (silent = false) => {
    if (!session?.user?.email) return
    if (isFetchingRef.current) return

    try {
      isFetchingRef.current = true
      if (!silent) {
        setLoading(true)
      }

      const result = await RestApi.get(API_URLS.v0.MESSENGER_COMBINED_CHATS)

      if (result?.status === 'success') {
        // Decrypt last messages for each chat
        const fetchedChats = await Promise.all(
          (result.result || []).map(async (chat) => {
            let decryptedLastMessage = chat.lastMessage
            if (chat.lastMessage?.message) {
              try {
                if (chat.type === 'individual') {
                  // Use the exact same approach as IndividualChatPage for consistency
                  const originalMessage = chat.lastMessage.message
                  try {
                    const decrypted = await ChatEncryption.decryptIfEncrypted(
                      originalMessage,
                      (encrypted) => ChatEncryption.decryptIndividualMessage(encrypted, chat.id)
                    )
                    if (decrypted !== originalMessage) {
                      decryptedLastMessage = { ...chat.lastMessage, message: decrypted }
                      console.log('[ChatList] ✓ Successfully decrypted last message for chat:', chat.id, 'decrypted preview:', decrypted.substring(0, 50))
                    }
                  } catch (error) {
                    console.warn('[ChatList] Failed to decrypt last message:', error, 'chatId:', chat.id)
                    // Keep original message if decryption fails
                  }
                } else if (chat.type === 'group') {
                  // Always try to decrypt - decryptGroupMessage will auto-derive key if needed
                  const decrypted = await ChatEncryption.decryptGroupMessage(
                    chat.lastMessage.message,
                    chat.id
                  )
                  // Only update if decryption succeeded (message changed)
                  if (decrypted !== chat.lastMessage.message) {
                    decryptedLastMessage = { ...chat.lastMessage, message: decrypted }
                    console.log('[ChatList] Successfully decrypted last group message for group:', chat.id)
                  } else {
                    // If message looks encrypted but didn't decrypt, log for debugging
                    if (ChatEncryption.isEncrypted(chat.lastMessage.message)) {
                      console.warn('[ChatList] Group message appears encrypted but decryption returned same value for group:', chat.id)
                    }
                  }
                }
              } catch (error) {
                console.error('[ChatList] Failed to decrypt last message:', error, 'chatId:', chat.id, 'error details:', {
                  message: error?.message,
                  stack: error?.stack
                })
                // Keep original message if decryption fails
              }
            }
            
            return {
              ...chat,
              lastMessage: decryptedLastMessage,
              unreadCount: typeof chat.unreadCount === 'number' ? chat.unreadCount : 0,
              avatarColor: chat.avatarColor || (chat.type === 'individual' 
                ? getAvatarBackgroundColor(chat.email || 'user')
                : getAvatarBackgroundColor(chat.name || 'group'))
            }
          })
        )

        setChats(fetchedChats)
      }
    } catch (error) {
      console.error('Error fetching chats:', error)
    } finally {
      isFetchingRef.current = false
      if (!silent) {
        setLoading(false)
      }
    }
  }, [session?.user?.email, theme.palette.primary.main])

  // Initial fetch - only once
  useEffect(() => {
    if (session?.user?.email && !hasFetchedRef.current) {
      hasFetchedRef.current = true
      fetchChats()
    }
  }, [session?.user?.email, fetchChats])

  // Re-decrypt all last messages after a delay to ensure keys are ready (only once after initial load)
  const hasRedecryptedRef = useRef(false)
  useEffect(() => {
    if (chats.length === 0 || hasRedecryptedRef.current) return

    const redecryptLastMessages = async () => {
      console.log('[ChatList] Re-decrypting last messages for all chats, chat count:', chats.length)
      
      const updatedChats = await Promise.all(
        chats.map(async (chat) => {
          if (!chat.lastMessage?.message) return chat
          
          try {
            if (chat.type === 'individual') {
              const originalMessage = chat.lastMessage.message
              const decrypted = await ChatEncryption.decryptIfEncrypted(
                originalMessage,
                (encrypted) => ChatEncryption.decryptIndividualMessage(encrypted, chat.id)
              )
              
              if (decrypted !== originalMessage) {
                console.log('[ChatList] Re-decryption succeeded for chat:', chat.id, 'decrypted preview:', decrypted.substring(0, 50))
                return {
                  ...chat,
                  lastMessage: { ...chat.lastMessage, message: decrypted }
                }
              }
            } else if (chat.type === 'group') {
              const originalMessage = chat.lastMessage.message
              const decrypted = await ChatEncryption.decryptIfEncrypted(
                originalMessage,
                (encrypted) => ChatEncryption.decryptGroupMessage(encrypted, chat.id)
              )
              
              if (decrypted !== originalMessage) {
                console.log('[ChatList] Re-decryption succeeded for group:', chat.id)
                return {
                  ...chat,
                  lastMessage: { ...chat.lastMessage, message: decrypted }
                }
              }
            }
          } catch (error) {
            console.warn('[ChatList] Re-decryption failed for chat:', chat.id, error)
          }
          
          return chat
        })
      )
      
      // Check if any messages were actually decrypted
      const hasChanges = updatedChats.some((updated, index) => 
        updated.lastMessage?.message !== chats[index].lastMessage?.message
      )
      
      if (hasChanges) {
        console.log('[ChatList] Updating chats with re-decrypted last messages')
        setChats(updatedChats)
        hasRedecryptedRef.current = true
      }
    }

    // Delay to ensure encryption keys are ready
    const timeoutId = setTimeout(redecryptLastMessages, 2000)
    return () => clearTimeout(timeoutId)
  }, [chats.length]) // Only run when chat count changes (after initial load)

  // WebSocket connection for real-time updates
  useEffect(() => {
    if (!session?.user?.email) return
    if (messengerSocketRef.current) return // Already connected

    const wsUrl = typeof window !== 'undefined'
      ? `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/api/ws/messenger`
      : ''

    if (!wsUrl) return

    const ws = new WebSocket(wsUrl)

    ws.onopen = () => {
      console.log('[WS] ChatList connected to messenger')
      messengerSocketRef.current = ws
    }

    ws.onmessage = async event => {
      try {
        const msg = JSON.parse(event.data)

        // Individual chat message
        if (msg.type === 'individualChatMessage') {
          const { chatId, data: message } = msg
          const isFromCurrentUser = message.senderEmail === session.user.email
          const isDeletedForUser = message.deletedFor?.some(d => d.userEmail === session.user.email)
          const isRead = message.readBy?.some(reader => reader.userEmail === session.user.email)
          
          // Normalize chatId for comparison and decryption
          const normalizedChatId = normalizeChatIdForComparison(chatId)
          
          // Decrypt message - use same approach as IndividualChatPage for consistency
          let decryptedMessageText = message.message
          if (message.message) {
            try {
              const decrypted = await ChatEncryption.decryptIfEncrypted(
                message.message,
                (encrypted) => ChatEncryption.decryptIndividualMessage(encrypted, normalizedChatId)
              )
              if (decrypted !== message.message) {
                decryptedMessageText = decrypted
              }
            } catch (error) {
              console.warn('[ChatList] Failed to decrypt individual message:', error)
              // Keep original message if decryption fails
            }
          }
          
          // Message is unread if:
          // 1. Not from current user
          // 2. Not deleted for current user
          // 3. Not deleted for everyone
          // 4. Not already read by current user
          const isUnread = !isFromCurrentUser &&
            !isDeletedForUser &&
            !message.deletedForEveryone &&
            !isRead

          setChats(prev => {
            // Find chat by normalized chatId (try both original and normalized)
            let chatFound = false
            const updated = prev.map(c => {
              if (c.type !== 'individual') return c
              
              // Match by normalized chatId
              const normalizedCId = normalizeChatIdForComparison(c.id)
              const matches = normalizedCId === normalizedChatId || c.id === chatId || c.id === normalizedChatId
              
              if (matches) {
                chatFound = true
                // Update unread count: increment if unread, keep same if from current user
                let newUnreadCount = c.unreadCount || 0
                if (isUnread) {
                  newUnreadCount = newUnreadCount + 1
                }
                // If from current user, unread count stays the same (their own message doesn't count as unread)

                return {
                  ...c,
                  lastMessage: {
                    _id: message._id,
                    message: decryptedMessageText,
                    senderEmail: message.senderEmail,
                    createdAt: message.createdAt,
                    isEdited: message.isEdited,
                    deletedForEveryone: message.deletedForEveryone
                  },
                  // Update lastMessageTimestamp for sorting (even if message is cleared later)
                  lastMessageTimestamp: message.createdAt,
                  unreadCount: newUnreadCount
                }
              }
              return c
            })
            
            // If chat not found, silently refetch to get the updated list
            // This handles new chats or chats that weren't loaded yet
            // IMPORTANT: For senders, the chat should exist, so if not found, refetch to get correct lastMessage
            if (!chatFound) {
              console.log('[ChatList] Chat not found for message update, refetching. chatId:', normalizedChatId, 'sender:', message.senderEmail)
              if (!isFetchingRef.current) {
                // Use a longer delay to ensure backend has processed the message
                setTimeout(() => fetchChats(true), 300)
              }
              return prev
            }

            // ALWAYS sort by actual last message time (most recent first) - regardless of sender/receiver/read/unread
            // Use lastMessageTimestamp for sorting (actual timestamp even if cleared)
            return updated.sort((a, b) => {
              const timeA = a.lastMessageTimestamp ? new Date(a.lastMessageTimestamp).getTime() : 
                            (a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0)
              const timeB = b.lastMessageTimestamp ? new Date(b.lastMessageTimestamp).getTime() : 
                            (b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0)
              
              // Most recent first
              if (timeA > 0 && timeB > 0) return timeB - timeA
              // Chats with messages come before chats without messages
              if (timeA > 0 && timeB === 0) return -1
              if (timeA === 0 && timeB > 0) return 1
              // If both have no messages, maintain order
              return 0
            })
          })
        }
        // Individual chat message update (read status, edit, delete)
        else if (msg.type === 'individualChatMessageUpdate') {
          const { chatId, data: updatedMessage } = msg
          const isRead = updatedMessage.readBy?.some(reader => reader.userEmail === session.user.email)
          const isFromOtherUser = updatedMessage.senderEmail !== session.user.email
          const isDeletedForUser = updatedMessage.deletedFor?.some(d => d.userEmail === session.user.email)

          // Normalize chatId for comparison
          const normalizedChatId = normalizeChatIdForComparison(chatId)

          // Decrypt message - use same approach as IndividualChatPage for consistency
          let decryptedMessageText = updatedMessage.message
          if (updatedMessage.message) {
            (async () => {
              try {
                const decrypted = await ChatEncryption.decryptIfEncrypted(
                  updatedMessage.message,
                  (encrypted) => ChatEncryption.decryptIndividualMessage(encrypted, normalizedChatId)
                )
                if (decrypted !== updatedMessage.message) {
                  decryptedMessageText = decrypted
                  // Update the chat with decrypted message
                  setChats(prev => {
                    return prev.map(c => {
                      const normalizedCId = normalizeChatIdForComparison(c.id)
                      const matches = normalizedCId === normalizedChatId || c.id === chatId || c.id === normalizedChatId
                      if (matches && c.type === 'individual' && c.lastMessage?._id === updatedMessage._id) {
                        return {
                          ...c,
                          lastMessage: { ...c.lastMessage, message: decrypted }
                        }
                      }
                      return c
                    })
                  })
                }
              } catch (error) {
                console.warn('[ChatList] Failed to decrypt updated individual message:', error)
              }
            })()
          }

          setChats(prev => {
            const updated = prev.map(c => {
              // Match by normalized chatId
              const normalizedCId = normalizeChatIdForComparison(c.id)
              const matches = normalizedCId === normalizedChatId || c.id === chatId || c.id === normalizedChatId
              
              if (matches && c.type === 'individual') {
                // If message was deleted for user and it's the last message, set lastMessage to null
                // But keep lastMessageTimestamp for sorting
                if (isDeletedForUser && c.lastMessage?._id === updatedMessage._id) {
                  // If this was the last message and it's now deleted for user, remove it
                  // This handles the case when chat is cleared
                  // Keep lastMessageTimestamp so the chat stays in its sorted position
                  return {
                    ...c,
                    lastMessage: null,
                    // Keep lastMessageTimestamp for sorting (don't reset it)
                    unreadCount: 0 // Unread count should be 0 when chat is cleared
                  }
                }

                const updatedLastMessage = c.lastMessage?._id === updatedMessage._id
                  ? { ...c.lastMessage, ...updatedMessage, message: decryptedMessageText || updatedMessage.message }
                  : c.lastMessage

                // If message was marked as read and it's from another user, decrement unread count
                // Only decrement if this is the last message (to avoid incorrect counts)
                let newUnreadCount = c.unreadCount || 0
                if (isRead && isFromOtherUser && c.lastMessage?._id === updatedMessage._id && newUnreadCount > 0) {
                  newUnreadCount = Math.max(0, newUnreadCount - 1)
                }

                return {
                  ...c,
                  lastMessage: updatedLastMessage,
                  unreadCount: newUnreadCount
                }
              }
              return c
            })

            // ALWAYS re-sort after update to maintain correct order by most recent message
            // Use lastMessageTimestamp for sorting (actual timestamp even if cleared)
            return updated.sort((a, b) => {
              const timeA = a.lastMessageTimestamp ? new Date(a.lastMessageTimestamp).getTime() : 
                            (a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0)
              const timeB = b.lastMessageTimestamp ? new Date(b.lastMessageTimestamp).getTime() : 
                            (b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0)
              
              // Most recent first
              if (timeA > 0 && timeB > 0) return timeB - timeA
              // Chats with messages come before chats without messages
              if (timeA > 0 && timeB === 0) return -1
              if (timeA === 0 && timeB > 0) return 1
              // If both have no messages, maintain order
              return 0
            })
          })
        }
        // Individual chat unread count update
        else if (msg.type === 'individualChatUnreadCount') {
          const { chatId, data: { unreadCount } } = msg
          
          // Normalize chatId for comparison
          const normalizedChatId = normalizeChatIdForComparison(chatId)
          
          setChats(prev => prev.map(c => {
            // Match by normalized chatId
            const normalizedCId = normalizeChatIdForComparison(c.id)
            const matches = normalizedCId === normalizedChatId || c.id === chatId || c.id === normalizedChatId
            
            if (matches && c.type === 'individual') {
              return { ...c, unreadCount: unreadCount !== undefined ? unreadCount : c.unreadCount }
            }
            return c
          }))
        }
        // Group chat message
        else if (msg.type === 'groupChatMessage') {
          const { groupId, data: message } = msg
          const isDeletedForUser = message.deletedFor?.some(d => d.userEmail === session.user.email)
          if (isDeletedForUser) return

          const isFromCurrentUser = message.senderEmail === session.user.email
          const isRead = message.readBy?.some(reader => reader.userEmail === session.user.email)
          const isPendingOrRejected = (message.approvalStatus === 'pending' || message.approvalStatus === 'rejected')
          // For others: do not show pending/rejected as last message; keep previous last message
          const skipAsLastMessage = !isFromCurrentUser && isPendingOrRejected

          // Decrypt message - always try to decrypt (decryptGroupMessage will auto-derive key if needed)
          let decryptedMessageText = message.message
          if (message.message) {
            try {
              const decrypted = await ChatEncryption.decryptGroupMessage(
                message.message,
                groupId
              )
              if (decrypted !== message.message) {
                decryptedMessageText = decrypted
              }
            } catch (error) {
              console.warn('[ChatList] Failed to decrypt group message:', error)
              // Keep original message if decryption fails
            }
          }
          
          // Message is unread if:
          // 1. Not from current user
          // 2. Not deleted for everyone
          // 3. Not already read by current user
          const isUnread = !isFromCurrentUser &&
            !message.deletedForEveryone &&
            !isRead

          setChats(prev => {
            const chatExists = prev.some(c => c.id === groupId && c.type === 'group')
            if (!chatExists) {
              // If chat doesn't exist, we might need to fetch chats again
              // But for now, just return prev to avoid errors
              return prev
            }

            const updated = prev.map(c => {
              if (c.id === groupId && c.type === 'group') {
                // Update unread count: increment if unread, keep same if from current user
                let newUnreadCount = c.unreadCount || 0
                if (isUnread) {
                  newUnreadCount = newUnreadCount + 1
                }
                // If from current user, unread count stays the same (their own message doesn't count as unread)

                // For others: do not set pending/rejected as last message; keep previous (but still bump timestamp for sort order)
                if (skipAsLastMessage) {
                  return {
                    ...c,
                    lastMessage: c.lastMessage,
                    lastMessageTimestamp: message.createdAt,
                    unreadCount: newUnreadCount
                  }
                }

                return {
                  ...c,
                  lastMessage: {
                    _id: message._id,
                    message: decryptedMessageText,
                    senderEmail: message.senderEmail,
                    createdAt: message.createdAt,
                    isEdited: message.isEdited,
                    deletedForEveryone: message.deletedForEveryone,
                    approvalStatus: message.approvalStatus
                  },
                  // Update lastMessageTimestamp for sorting (even if message is cleared later)
                  lastMessageTimestamp: message.createdAt,
                  unreadCount: newUnreadCount
                }
              }
              return c
            })

            // ALWAYS sort by actual last message time (most recent first) - regardless of sender/receiver/read/unread
            // Use lastMessageTimestamp for sorting (actual timestamp even if cleared)
            return updated.sort((a, b) => {
              const timeA = a.lastMessageTimestamp ? new Date(a.lastMessageTimestamp).getTime() : 
                            (a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0)
              const timeB = b.lastMessageTimestamp ? new Date(b.lastMessageTimestamp).getTime() : 
                            (b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0)
              
              // Most recent first
              if (timeA > 0 && timeB > 0) return timeB - timeA
              // Chats with messages come before chats without messages
              if (timeA > 0 && timeB === 0) return -1
              if (timeA === 0 && timeB > 0) return 1
              // If both have no messages, maintain order
              return 0
            })
          })
        }
        // Group chat message update (read status, edit, delete)
        else if (msg.type === 'groupChatMessageUpdate') {
          const { groupId, data: updatedMessage } = msg
          const isDeletedForUser = updatedMessage.deletedFor?.some(d => d.userEmail === session.user.email)
          const isRead = updatedMessage.readBy?.some(reader => reader.userEmail === session.user.email)
          const isFromOtherUser = updatedMessage.senderEmail !== session.user.email

          // Decrypt message - always try to decrypt (decryptGroupMessage will auto-derive key if needed)
          let decryptedMessageText = updatedMessage.message
          if (updatedMessage.message) {
            (async () => {
              try {
                const decrypted = await ChatEncryption.decryptGroupMessage(
                  updatedMessage.message,
                  groupId
                )
                if (decrypted !== updatedMessage.message) {
                  decryptedMessageText = decrypted
                  // Update the chat with decrypted message
                  setChats(prev => {
                    return prev.map(c => {
                      if (c.id === groupId && c.type === 'group' && c.lastMessage?._id === updatedMessage._id) {
                        return {
                          ...c,
                          lastMessage: { ...c.lastMessage, message: decrypted }
                        }
                      }
                      return c
                    })
                  })
                }
              } catch (error) {
                console.warn('[ChatList] Failed to decrypt updated group message:', error)
              }
            })()
          }

          setChats(prev => {
            const updated = prev.map(c => {
              if (c.id === groupId && c.type === 'group') {
                if (isDeletedForUser && c.lastMessage?._id === updatedMessage._id) {
                  return { ...c, lastMessage: null }
                }

                // If this was our lastMessage and it became rejected and we're not the sender, clear lastMessage (others don't show rejected)
                const isRejected = updatedMessage.approvalStatus === 'rejected'
                if (c.lastMessage?._id === updatedMessage._id && isRejected && isFromOtherUser) {
                  return { ...c, lastMessage: null }
                }

                const updatedLastMessage = c.lastMessage?._id === updatedMessage._id
                  ? { ...c.lastMessage, ...updatedMessage, message: decryptedMessageText || updatedMessage.message, approvalStatus: updatedMessage.approvalStatus }
                  : c.lastMessage

                // If message was marked as read and it's from another user, decrement unread count
                let newUnreadCount = c.unreadCount || 0
                if (isRead && isFromOtherUser && c.lastMessage?._id === updatedMessage._id && newUnreadCount > 0) {
                  newUnreadCount = Math.max(0, newUnreadCount - 1)
                }

                return {
                  ...c,
                  lastMessage: updatedLastMessage,
                  unreadCount: newUnreadCount
                }
              }
              return c
            })

            // ALWAYS re-sort after update to maintain correct order by most recent message
            // Use lastMessageTimestamp for sorting (actual timestamp even if cleared)
            return updated.sort((a, b) => {
              const timeA = a.lastMessageTimestamp ? new Date(a.lastMessageTimestamp).getTime() : 
                            (a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0)
              const timeB = b.lastMessageTimestamp ? new Date(b.lastMessageTimestamp).getTime() : 
                            (b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0)
              
              // Most recent first
              if (timeA > 0 && timeB > 0) return timeB - timeA
              // Chats with messages come before chats without messages
              if (timeA > 0 && timeB === 0) return -1
              if (timeA === 0 && timeB > 0) return 1
              // If both have no messages, maintain order
              return 0
            })
          })
        }
        // Individual chat deleted - remove from list
        else if (msg.type === 'individualChatDeleted') {
          const { chatId, userEmail } = msg
          // Only remove if it's for the current user
          if (userEmail === session.user.email) {
            const normalizedChatId = normalizeChatIdForComparison(chatId)
            setChats(prev => prev.filter(c => {
              if (c.type !== 'individual') return true
              const normalizedCId = normalizeChatIdForComparison(c.id)
              return normalizedCId !== normalizedChatId && c.id !== chatId && c.id !== normalizedChatId
            }))
          }
        }
        // Groups list update - refetch silently
        else if (msg.type === 'groupsListUpdate') {
          if (!isFetchingRef.current) {
            fetchChats(true)
          }
        }
      } catch (e) {
        console.error('[WS] ChatList error parsing message', e)
      }
    }

    ws.onerror = err => {
      console.error('[WS] ChatList messenger error', err)
    }

    ws.onclose = () => {
      console.log('[WS] ChatList messenger connection closed')
      messengerSocketRef.current = null
    }

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close()
      }
      messengerSocketRef.current = null
    }
  }, [session?.user?.email, fetchChats])

  // Sort and filter chats
  const sortedAndFilteredChats = useMemo(() => {
    // First, sort chats by actual last message time (most recent first)
    // Use lastMessageTimestamp (actual timestamp even if cleared) for sorting
    let sorted = [...chats].sort((a, b) => {
      const timeA = a.lastMessageTimestamp ? new Date(a.lastMessageTimestamp).getTime() : 
                    (a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0)
      const timeB = b.lastMessageTimestamp ? new Date(b.lastMessageTimestamp).getTime() : 
                    (b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0)
      
      // Chats with messages come first, sorted by most recent
      if (timeA > 0 && timeB > 0) return timeB - timeA
      if (timeA > 0 && timeB === 0) return -1
      if (timeA === 0 && timeB > 0) return 1
      return 0
    })

    // Filter by active tab
    if (activeTab === 1) {
      sorted = sorted.filter(chat => chat.type === 'individual')
    } else if (activeTab === 2) {
      sorted = sorted.filter(chat => chat.type === 'group' && chat.groupType==='normal')
    } else if (activeTab === 3) {
      sorted = sorted.filter(chat => chat.type === 'group' && chat.groupType === 'classroom')
    } else if (activeTab === 4) {
      sorted = sorted.filter(chat => (chat.unreadCount || 0) > 0)
    }
    // activeTab === 0 means "All", so no filtering needed

    // Then filter by search query if provided
    if (!searchQuery.trim()) return sorted

    const query = searchQuery.toLowerCase()
    return sorted.filter(
      chat =>
        chat.name.toLowerCase().includes(query) ||
        (chat.email && chat.email.toLowerCase().includes(query)) ||
        (chat.lastMessage && chat.lastMessage.message?.toLowerCase().includes(query))
    )
  }, [chats, searchQuery, activeTab])

  // Format last message time
  const formatLastMessageTime = timestamp => {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    if (isToday(date)) {
      return format(date, 'h:mm a')
    } else if (isYesterday(date)) {
      return 'Yesterday'
    } else {
      return format(date, 'MMM d')
    }
  }

  // Handle chat click
  const handleChatClick = useCallback((chat) => {
    if (!chat || !chat.id) return

    const path = chat.type === 'individual'
      ? `/messanger/${encodeURIComponent(chat.id)}`
      : `/messanger/group/${chat.id}`

    router.push(path)
  }, [router])

  // Handle search user by email
  const handleSearchUser = async () => {
    if (!searchEmail.trim()) {
      toast.error('Please enter an email address')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(searchEmail.trim())) {
      toast.error('Please enter a valid email address')
      return
    }

    setSearching(true)
    try {
      const result = await RestApi.get(
        `${API_URLS.v0.USERS_INDIVIDUAL_CHAT_SEARCH}?email=${encodeURIComponent(searchEmail.trim())}`
      )

      if (result?.status === 'success') {
        setSearchResult(result.result)
      } else {
        toast.error(result?.message || 'User not found')
        setSearchResult(null)
      }
    } catch (error) {
      console.error('Error searching user:', error)
      toast.error('Failed to search user')
      setSearchResult(null)
    } finally {
      setSearching(false)
    }
  }

  // Handle start new chat
  const handleStartChat = () => {
    if (!searchResult) return

    const emails = [session.user.email, searchResult.email].sort()
    const chatId = `${emails[0]}_${emails[1]}`

    setSearchDialogOpen(false)
    setSearchEmail('')
    setSearchResult(null)
    router.push(`/messanger/${chatId}`)
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', p: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: theme.palette.background.default }}>
      {/* Header */}
      <Box
        sx={{
          borderBottom: `1px solid ${alpha(theme.palette.divider, isDarkMode ? 0.12 : 0.08)}`,
          bgcolor: theme.palette.background.paper
        }}
      >
        <Box
          sx={{
            p: { xs: 2, sm: 3 },
            pb: { xs: 1.5, sm: 2 }
          }}
        >
          <Stack direction='row' alignItems='center' justifyContent='space-between' spacing={2} sx={{ mb: 2 }}>
            <Typography variant='h5' fontWeight={700} sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
              Messages
            </Typography>
            <Button
              variant='contained'
              color='primary'
              component='label'
              startIcon={<PersonIcon />}
              onClick={() => setSearchDialogOpen(true)}
              size={isMobile ? 'small' : 'medium'}
              sx={{ textTransform: 'none', color: 'white' }}
            >
              New Chat
            </Button>
          </Stack>

          <TextField
            fullWidth
            placeholder='Search chats...'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            size='small'
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <SearchIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              )
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: isDarkMode ? alpha(theme.palette.background.paper, 0.6) : 'white'
              }
            }}
          />
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: { xs: 2, sm: 3 } }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{
              minHeight: 48,
              '& .MuiTab-root': {
                minHeight: 48,
                textTransform: 'none',
                fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                fontWeight: 500,
                px: { xs: 1.5, sm: 2 }
              },
              '& .Mui-selected': {
                fontWeight: 600
              }
            }}
          >
            <Tab label={`All (${tabCounts.all})`} />
            <Tab label={`Individual chats (${tabCounts.individual})`} />
            <Tab label={`Groups (${tabCounts.groups})`} />
            <Tab label={`Classroom groups (${tabCounts.classroomGroups})`} />
            <Tab label={`Unread (${tabCounts.unread})`} />
          </Tabs>
        </Box>
      </Box>

      {/* Chat List */}
      <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {sortedAndFilteredChats.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant='body2' color='text.secondary'>
              {searchQuery 
                ? 'No chats found' 
                : activeTab === 1 
                  ? 'No individual chats yet' 
                  : activeTab === 2 
                    ? 'No groups yet' 
                    : activeTab === 3 
                      ? 'No classroom groups yet' 
                      : activeTab === 4 
                        ? 'No unread messages' 
                        : 'No chats yet. Start a new conversation!'}
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {sortedAndFilteredChats.map((chat, index) => (
              <React.Fragment key={chat.id}>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => handleChatClick(chat)}
                    sx={{
                      px: { xs: 2, sm: 3 },
                      py: 2,
                      '&:hover': {
                        bgcolor: isDarkMode
                          ? alpha(theme.palette.primary.main, 0.1)
                          : alpha(theme.palette.primary.main, 0.05)
                      }
                    }}
                  >
                    <ListItemAvatar>
                      {chat.type === 'individual' ? (
                        <Avatar
                          sx={{
                            bgcolor: chat.avatarColor,
                            color: 'white',
                            fontWeight: 700,
                            width: { xs: 48, sm: 56 },
                            height: { xs: 48, sm: 56 }
                          }}
                        >
                          {chat.avatar}
                        </Avatar>
                      ) : (
                        <Avatar
                          sx={{
                            bgcolor: chat.avatarColor,
                            color: 'white',
                            width: { xs: 48, sm: 56 },
                            height: { xs: 48, sm: 56 }
                          }}
                        >
                          <GroupIcon />
                        </Avatar>
                      )}
                    </ListItemAvatar>
                    <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                      <Stack
                        direction='row'
                        alignItems='flex-start'
                        justifyContent='space-between'
                        spacing={1}
                        sx={{ width: '100%', minWidth: 0 }}
                      >
                        <Stack sx={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                          <Typography
                            variant='subtitle1'
                            fontWeight={chat.unreadCount > 0 ? 700 : 600}
                            sx={{
                              fontSize: { xs: '0.9rem', sm: '1rem' },
                              color: 'text.primary',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              minWidth: 0
                            }}
                          >
                            {chat.name}
                          </Typography>
                          <Stack 
                            direction='row' 
                            alignItems='center' 
                            spacing={1} 
                            sx={{ 
                              mt: 0.25, 
                              width: '100%',
                              minWidth: 0,
                              overflow: 'hidden'
                            }}
                          >
                            {chat.type === 'group' && chat.isAnnouncementOnly && (
                              <Chip
                                label='Announcement'
                                size='small'
                                sx={{
                                  height: 18,
                                  fontSize: '0.65rem',
                                  bgcolor: alpha(theme.palette.warning.main, 0.1),
                                  color: 'warning.main',
                                  flexShrink: 0
                                }}
                              />
                            )}
                            <Typography
                              variant='body2'
                              color='text.secondary'
                              sx={{
                                fontSize: { xs: '0.8rem', sm: '0.875rem' },
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                flex: 1,
                                minWidth: 0,
                                maxWidth: '100%'
                              }}
                              component='span'
                              display='block'
                            >
                              {chat.lastMessage
                                ? chat.lastMessage.deletedForEveryone
                                  ? 'This message was deleted'
                                  : (() => {
                                      const lm = chat.lastMessage
                                      const isGroup = chat.type === 'group'
                                      const isSender = lm.senderEmail === session?.user?.email
                                      const msg = lm.message || ''
                                      if (isGroup && isSender && lm.approvalStatus === 'pending') {
                                        return (
                                          <>
                                            {msg}
                                            <Box
                                              component='span'
                                              sx={{
                                                color: 'warning.main',
                                                fontWeight: 600,
                                                fontStyle: 'italic',
                                                ml: 0.25
                                              }}
                                            >
                                              (pending)
                                            </Box>
                                          </>
                                        )
                                      }
                                      if (isGroup && isSender && lm.approvalStatus === 'rejected') {
                                        return (
                                          <>
                                            {msg}
                                            <Box
                                              component='span'
                                              sx={{
                                                color: 'error.main',
                                                fontWeight: 600,
                                                fontStyle: 'italic',
                                                ml: 0.25
                                              }}
                                            >
                                              (Rejected)
                                            </Box>
                                          </>
                                        )
                                      }
                                      return msg
                                    })()
                                : 'No messages yet'}
                            </Typography>
                          </Stack>
                        </Stack>
                        <Stack 
                          direction='column' 
                          alignItems='flex-end' 
                          spacing={0.5} 
                          sx={{ 
                            flexShrink: 0, 
                            ml: 1,
                            minWidth: 'fit-content'
                          }}
                        >
                          {chat.lastMessage && (
                            <Typography
                              variant='caption'
                              color={chat.unreadCount > 0 ? '#25D366' : 'text.secondary'}
                              sx={{
                                fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                                fontWeight: chat.unreadCount > 0 ? 600 : 400,
                                lineHeight: 1.2,
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {formatLastMessageTime(chat.lastMessage.createdAt)}
                            </Typography>
                          )}
                          {chat.unreadCount > 0 && (
                            <Box
                              sx={{
                                minWidth: chat.unreadCount > 9 ? 24 : 20,
                                height: 20,
                                borderRadius: '10px',
                                bgcolor: '#25D366',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                px: chat.unreadCount > 9 ? 0.75 : 0.5,
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                mt: chat.lastMessage ? 0 : 0.5
                              }}
                            >
                              {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                            </Box>
                          )}
                        </Stack>
                      </Stack>
                    </Box>
                  </ListItemButton>
                </ListItem>
                {index < sortedAndFilteredChats.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Box>

      {/* Search User Dialog */}
      <Dialog
        open={searchDialogOpen}
        onClose={() => {
          setSearchDialogOpen(false)
          setSearchEmail('')
          setSearchResult(null)
        }}
        maxWidth='sm'
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>
          <Typography variant='h6' fontWeight={700}>
            Search User by Email
          </Typography>
          <Typography variant='caption' color='text.secondary' sx={{ mt: 0.5, display: 'block' }}>
            Enter the exact email address to find a user
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label='Email Address'
              type='email'
              value={searchEmail}
              onChange={e => setSearchEmail(e.target.value)}
              onKeyPress={e => {
                if (e.key === 'Enter') {
                  handleSearchUser()
                }
              }}
              placeholder='user@example.com'
              disabled={searching}
              InputProps={{
                endAdornment: searching && <CircularProgress size={20} />
              }}
            />

            {searchResult && (
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: isDarkMode
                    ? alpha(theme.palette.primary.main, 0.1)
                    : alpha(theme.palette.primary.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
                }}
              >
                <Stack direction='row' spacing={2} alignItems='center'>
                  <Avatar
                    sx={{
                      bgcolor: stringToColor(searchResult.email),
                      color: 'white',
                      fontWeight: 700,
                      width: 48,
                      height: 48
                    }}
                  >
                    {searchResult.profile
                      ? (
                          searchResult.profile.firstname?.[0] ||
                          searchResult.profile.lastname?.[0] ||
                          searchResult.email[0]
                        ).toUpperCase()
                      : searchResult.email[0].toUpperCase()}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant='subtitle1' fontWeight={600}>
                      {searchResult.profile
                        ? `${searchResult.profile.firstname || ''} ${searchResult.profile.lastname || ''}`.trim() ||
                          searchResult.email.split('@')[0]
                        : searchResult.email.split('@')[0]}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      {searchResult.email}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setSearchDialogOpen(false)
              setSearchEmail('')
              setSearchResult(null)
            }}
          >
            Cancel
          </Button>
          <Button
            variant='contained'
            color='primary'
            onClick={handleSearchUser}
            disabled={searching || !searchEmail.trim()}
            startIcon={<SearchIcon />}
            sx={{ color: 'white' }}
            component='label'
          >
            Search
          </Button>
          {searchResult && (
            <Button variant='contained' color='success' component='label' onClick={handleStartChat} startIcon={<SendIcon />} sx={{ ml: 1, color: 'white' }}>
              Start Chat
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default ChatList
