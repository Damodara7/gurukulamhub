'use client'
import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Button,
  Switch,
  FormControlLabel,
  Menu,
  MenuItem,
  useTheme,
  alpha,
  useMediaQuery,
  CircularProgress,
  Typography,
  Stack,
  IconButton,
  Divider
} from '@mui/material'
import { ArrowBack as ArrowBackIcon, PersonRemove as PersonRemoveIcon, DoneAll as DoneAllIcon, CheckCircle as CheckCircleIcon, MoreVert as MoreVertIcon, ExitToApp as ExitToAppIcon, DeleteForever as DeleteForeverIcon } from '@mui/icons-material'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns'
import useSound from 'use-sound'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { toast } from 'react-toastify'
import CreateGroupForm from '@/components/group/CreateGroupForm'
import { stringToColor } from '@/utils/stringToColor'
import * as ChatEncryption from '@/utils/chatEncryption'
import * as KeyManagement from '@/utils/keyManagement'
import ConfirmationDialog from '@/components/dialogs/confirmation-dialog'
import ChatHeader from './chat/ChatHeader'
import MessagesArea from './chat/MessagesArea'
import ChatInput from './chat/ChatInput'
import MessageMenu from './chat/MessageMenu'
import SelectionActionBar from './chat/SelectionActionBar'
import DeleteDialog from './chat/DeleteDialog'
import MembersDrawer from './chat/MembersDrawer'
import ReadReceiptsMenu from './chat/ReadReceiptsMenu'

const GroupChatPage = ({ groupId, groupData: initialGroupData, backPath = '/management/group' }) => {
  const theme = useTheme()
  const isDarkMode = theme.palette.mode === 'dark'
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'))
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'))
  const { data: session } = useSession()
  const router = useRouter()
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const messagesContainerRef = useRef(null)

  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [socket, setSocket] = useState(null)
  const [groupSocket, setGroupSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [canSend, setCanSend] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [groupData, setGroupData] = useState(initialGroupData)
  const [membersDrawerOpen, setMembersDrawerOpen] = useState(false)
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false)
  const [memberMenuAnchor, setMemberMenuAnchor] = useState(null)
  const [selectedMember, setSelectedMember] = useState(null)
  const [readReceiptMenuAnchor, setReadReceiptMenuAnchor] = useState(null)
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false)
  const [messageMenuAnchor, setMessageMenuAnchor] = useState(null)
  const [menuMessage, setMenuMessage] = useState(null)
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedMessages, setSelectedMessages] = useState(new Set())
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteType, setDeleteType] = useState(null) // 'me' or 'everyone'
  const [editingMessage, setEditingMessage] = useState(null) // Message being edited
  const [deleteFromMenu, setDeleteFromMenu] = useState(false) // Track if delete dialog opened from menu
  const [deleteGroupDialogOpen, setDeleteGroupDialogOpen] = useState(false) // Delete group confirmation dialog
  const [soundEnabled, setSoundEnabled] = useState(true) // Sound enabled by default
  const soundEnabledRef = useRef(true) // Ref to track sound state for WebSocket handler
  const [newMessageForNotification, setNewMessageForNotification] = useState(null) // Track new messages for notification sound
  const [menuAnchor, setMenuAnchor] = useState(null)
  const [clearChatDialogOpen, setClearChatDialogOpen] = useState(false)
  const [exitGroupDialogOpen, setExitGroupDialogOpen] = useState(false)
  const [encryptionReady, setEncryptionReady] = useState(false)
  const encryptionReadyRef = useRef(false)

  // Sound hooks
  const [playSoundOn] = useSound('/sounds/sound-on.mp3', { volume: 0.7 })
  const [playSoundOff] = useSound('/sounds/sound-off.mp3', { volume: 0.7 })
  const [playNotificationSound] = useSound('/sounds/notification.mp3', { volume: 0.7 })

  const isCreator = groupData?.creatorEmail === session?.user?.email

  // Play notification sound when new message arrives (outside WebSocket handler)
  useEffect(() => {
    if (newMessageForNotification && soundEnabled) {
      const message = newMessageForNotification
      // Check if we should play the sound
      if (
        message.senderEmail !== session?.user?.email &&
        !message.deletedFor?.some(d => d.userEmail === session?.user?.email) &&
        !message.deletedForEveryone
      ) {
        console.log('Playing notification sound for new message (from state)')
        try {
          playNotificationSound()
        } catch (error) {
          console.error('Error playing notification sound:', error)
        }
      }
      // Clear the state after playing
      setNewMessageForNotification(null)
    }
  }, [newMessageForNotification, soundEnabled, session?.user?.email, playNotificationSound])

  // Toggle sound function
  const handleToggleSound = () => {
    const newSoundState = !soundEnabled
    
    if (newSoundState) {
      playSoundOn()
    } else {
      playSoundOff()
    }
    
    setSoundEnabled(newSoundState)
    soundEnabledRef.current = newSoundState
  }

  // Update ref when soundEnabled changes
  useEffect(() => {
    soundEnabledRef.current = soundEnabled
  }, [soundEnabled])

  // Initialize encryption for the user
  useEffect(() => {
    const initEncryption = async () => {
      if (!session?.user?.email) return

      try {
        // Initialize user encryption (generate key pair if needed)
        const { publicKey } = await ChatEncryption.initializeUserEncryption(session.user.email)

        // Upload public key to server if not already uploaded
        try {
          const existingKey = await RestApi.get(`/encryption/keys?userId=${session.user.email}`)
          if (!existingKey?.result?.publicKey) {
            await RestApi.post('/encryption/keys', { publicKey })
            console.log('[Encryption] Public key uploaded to server')
          }
        } catch (error) {
          console.warn('[Encryption] Failed to upload public key:', error)
        }
      } catch (error) {
        console.error('[Encryption] Error initializing encryption:', error)
      }
    }

    initEncryption()
  }, [session?.user?.email])

  // Setup encryption for group chat
  useEffect(() => {
    const setupGroupEncryption = async () => {
      if (!groupId || !session?.user?.email) return

      try {
        // Setup group chat encryption (creates or retrieves shared group key)
        const success = await ChatEncryption.setupGroupChatEncryption(groupId, isCreator)

        if (success) {
          setEncryptionReady(true)
          encryptionReadyRef.current = true
          console.log('[Encryption] Group chat encryption set up successfully')
        } else {
          console.warn('[Encryption] Failed to set up group chat encryption')
          setEncryptionReady(false)
          encryptionReadyRef.current = false
        }
      } catch (error) {
        console.error('[Encryption] Error setting up group chat encryption:', error)
        setEncryptionReady(false)
        encryptionReadyRef.current = false
      }
    }

    if (groupId && isCreator !== undefined) {
      setupGroupEncryption()
    }
  }, [groupId, session?.user?.email, isCreator])

  // Check if user can send messages
  useEffect(() => {
    if (!groupData || !session?.user?.email) return

    const checkCanSend = () => {
      if (isCreator) {
        setCanSend(true)
        return
      }

      if (groupData.isAnnouncementOnly) {
        setCanSend(false)
        return
      }

      const memberEmails = groupData.members?.map(m => {
        if (typeof m === 'object') {
          return m.email || (m.profile && m.profile.email) || null
        }
        return null
      }).filter(Boolean) || []

      setCanSend(memberEmails.includes(session.user.email))
    }

    checkCanSend()
  }, [groupData, session?.user?.email, isCreator])

  // Fetch initial messages
  const fetchMessages = useCallback(async (before = null) => {
    try {
      if (before) {
        setLoadingMore(true)
      } else {
        setLoading(true)
      }

      const params = new URLSearchParams({
        groupId,
        limit: '50'
      })
      if (before) {
        params.append('before', before)
      }
      if (session?.user?.email) {
        params.append('userEmail', session.user.email)
      }

      const result = await RestApi.get(`${API_URLS.v0.USERS_GROUP_CHAT}?${params.toString()}`)

      if (result?.status === 'success') {
        const fetchedMessages = result.result || []
        
        // Decrypt messages if encryption is ready
        const decryptedMessages = await Promise.all(
          fetchedMessages.map(async (msg) => {
            if (msg.message && encryptionReadyRef.current) {
              try {
                const decrypted = await ChatEncryption.decryptIfEncrypted(
                  msg.message,
                  (encrypted) => ChatEncryption.decryptGroupMessage(encrypted, groupId)
                )
                return { ...msg, message: decrypted }
              } catch (error) {
                console.warn('[Encryption] Failed to decrypt message:', error)
                return msg
              }
            }
            return msg
          })
        )
        
        if (before) {
          setMessages(prev => [...decryptedMessages, ...prev])
          setHasMore(decryptedMessages.length === 50)
        } else {
          setMessages(decryptedMessages)
          setHasMore(decryptedMessages.length === 50)
          
          // Mark all messages as read when opening chat
          if (decryptedMessages.length > 0) {
            markAllMessagesAsRead()
          }
        }
      } else {
        toast.error(result?.message || 'Failed to load messages')
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
      toast.error('An error occurred while loading messages')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [groupId])

  // Fetch messages immediately when groupId is available
  // If groupData is provided, we can start fetching messages right away
  useEffect(() => {
    if (groupId && initialGroupData) {
      // If we have initial group data, fetch messages immediately
      fetchMessages()
    } else if (groupId && groupData) {
      // If group data was fetched separately, fetch messages
      fetchMessages()
    }
  }, [groupId, initialGroupData, groupData, fetchMessages])

  // Mark all messages as read
  const markAllMessagesAsRead = async () => {
    try {
      await RestApi.post(API_URLS.v0.USERS_GROUP_CHAT_ACTIONS, {
        action: 'markAllAsRead',
        groupId
      })
    } catch (error) {
      console.error('Error marking messages as read:', error)
    }
  }

  // WebSocket connection for chat messages
  useEffect(() => {
    if (!groupId || !session?.user?.email) return

    const wsUrl =
      typeof window !== 'undefined'
        ? `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${
            window.location.host
          }/api/ws/groups/${groupId}/chat`
        : ''

    if (wsUrl) {
      const wsRef = new WebSocket(wsUrl)

      wsRef.onopen = () => {
        console.log('[WS] Connected to group chat')
        setIsConnected(true)
        setSocket(wsRef)
        markAllMessagesAsRead()
      }

      wsRef.onmessage = async event => {
        try {
          const msg = JSON.parse(event.data)
          
          if (msg.type === 'connected') {
            console.log('[WS] Chat connection confirmed')
          } else if (msg.type === 'newMessage' || msg.type === 'newChatMessage') {
            const message = msg.data
            
            // Decrypt message if encrypted (try even if encryptionReadyRef is false)
            let decryptedMessage = message
            if (message.message) {
              const isMessageEncrypted = ChatEncryption.isEncrypted(message.message)
              try {
                const decrypted = await ChatEncryption.decryptIfEncrypted(
                  message.message,
                  (encrypted) => ChatEncryption.decryptGroupMessage(encrypted, groupId)
                )
                // Check if decryption actually succeeded (message changed)
                if (decrypted !== message.message) {
                  decryptedMessage = { ...message, message: decrypted }
                } else if (isMessageEncrypted) {
                  // Message is encrypted but decryption returned the same value (failed)
                  // This means the key might not be ready yet - retry after a delay
                  console.log('[Encryption] Decryption failed for encrypted message, will retry:', message._id)
                  const isOwnMessage = message.senderEmail === session?.user?.email
                  // Retry decryption after a short delay, especially for own messages
                  setTimeout(async () => {
                    try {
                      const retryDecrypted = await ChatEncryption.decryptIfEncrypted(
                        message.message,
                        (encrypted) => ChatEncryption.decryptGroupMessage(encrypted, groupId)
                      )
                      if (retryDecrypted !== message.message) {
                        // Decryption succeeded, update the message in state
                        setMessages(prev => {
                          return prev.map(m => 
                            m._id === message._id 
                              ? { ...m, message: retryDecrypted }
                              : m
                          )
                        })
                        console.log('[Encryption] Retry decryption succeeded for message:', message._id)
                      } else {
                        // Still failed, try one more time after a longer delay
                        if (isOwnMessage) {
                          setTimeout(async () => {
                            try {
                              const finalRetry = await ChatEncryption.decryptIfEncrypted(
                                message.message,
                                (encrypted) => ChatEncryption.decryptGroupMessage(encrypted, groupId)
                              )
                              if (finalRetry !== message.message) {
                                setMessages(prev => {
                                  return prev.map(m => 
                                    m._id === message._id 
                                      ? { ...m, message: finalRetry }
                                      : m
                                  )
                                })
                                console.log('[Encryption] Final retry decryption succeeded for message:', message._id)
                              }
                            } catch (finalError) {
                              console.warn('[Encryption] Final retry decryption failed:', finalError)
                            }
                          }, 1000)
                        }
                      }
                    } catch (retryError) {
                      console.warn('[Encryption] Retry decryption failed:', retryError)
                    }
                  }, isOwnMessage ? 100 : 500) // Retry faster for own messages
                }
              } catch (error) {
                console.warn('[Encryption] Failed to decrypt incoming message:', error)
                // If message appears encrypted, retry after a delay
                if (isMessageEncrypted) {
                  const isOwnMessage = message.senderEmail === session?.user?.email
                  setTimeout(async () => {
                    try {
                      const retryDecrypted = await ChatEncryption.decryptIfEncrypted(
                        message.message,
                        (encrypted) => ChatEncryption.decryptGroupMessage(encrypted, groupId)
                      )
                      if (retryDecrypted !== message.message) {
                        setMessages(prev => {
                          return prev.map(m => 
                            m._id === message._id 
                              ? { ...m, message: retryDecrypted }
                              : m
                          )
                        })
                        console.log('[Encryption] Retry decryption succeeded for message:', message._id)
                      }
                    } catch (retryError) {
                      console.warn('[Encryption] Retry decryption failed:', retryError)
                    }
                  }, isOwnMessage ? 100 : 500)
                }
                // Continue with original message (backward compatibility)
              }
            }
            
            // Store message for notification sound (will be played in useEffect outside WebSocket)
            if (
              soundEnabledRef.current &&
              decryptedMessage.senderEmail !== session?.user?.email &&
              !decryptedMessage.deletedFor?.some(d => d.userEmail === session?.user?.email) &&
              !decryptedMessage.deletedForEveryone
            ) {
              setNewMessageForNotification(decryptedMessage)
            }
            
            setMessages(prev => {
              const exists = prev.some(m => m._id === decryptedMessage._id)
              if (exists) return prev
              // Filter out if deleted for this user, but keep messages deleted for everyone (to show with banned icon)
              const isDeletedForMe = decryptedMessage.deletedFor?.some(d => d.userEmail === session?.user?.email)
              if (isDeletedForMe) return prev
              const updated = [...prev, decryptedMessage]
              // Mark new message as read (only if not deleted for everyone and not own message)
              if (!decryptedMessage.deletedForEveryone && decryptedMessage.senderEmail !== session?.user?.email) {
                setTimeout(() => {
                  markMessageAsRead(decryptedMessage._id)
                }, 100)
              }
              return updated
            })
            setTimeout(() => {
              messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
            }, 100)
          } else if (msg.type === 'messageUpdate') {
            setMessages(prev => {
              // Update existing message or add if it doesn't exist (shouldn't happen, but handle it)
              const messageExists = prev.some(m => m._id === msg.data._id)
              let updated
              
              if (messageExists) {
                // Update existing message
                updated = prev.map(m =>
                  m._id === msg.data._id ? { ...m, ...msg.data } : m
                )
              } else {
                // Message doesn't exist in current list, just return previous (shouldn't happen for updates)
                updated = prev
              }
              
              // Filter out messages deleted for this user, but keep messages deleted for everyone (to show with banned icon)
              return updated.filter(m => {
                const isDeletedForMe = m.deletedFor?.some(d => d.userEmail === session?.user?.email)
                return !isDeletedForMe // Keep deletedForEveryone messages to show with banned icon
              })
            })
          }
        } catch (e) {
          console.error('[WS] Error parsing chat message', e)
        }
      }

      wsRef.onerror = err => {
        console.error('[WS] Chat WebSocket error', err)
        setIsConnected(false)
      }

      wsRef.onclose = () => {
        console.log('[WS] Chat WebSocket connection closed')
        setIsConnected(false)
      }

      return () => {
        wsRef.close()
      }
    }
  }, [groupId, session?.user?.email])

  // WebSocket connection for group updates (settings, members, etc.)
  useEffect(() => {
    if (!groupId || !session?.user?.email) return

    const wsUrl =
      typeof window !== 'undefined'
        ? `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${
            window.location.host
          }/api/ws/groups/${groupId}`
        : ''

    if (wsUrl) {
      const wsRef = new WebSocket(wsUrl)

      wsRef.onopen = () => {
        console.log('[WS] Connected to group updates')
        setGroupSocket(wsRef)
      }

      wsRef.onmessage = event => {
        try {
          const msg = JSON.parse(event.data)
          
          if (msg.type === 'groupDetails') {
            console.log('[WS] Received group update:', msg.data)
            // Update group data in real-time (replace entire object to ensure proper updates)
            setGroupData(msg.data)
          }
        } catch (e) {
          console.error('[WS] Error parsing group update message', e)
        }
      }

      wsRef.onerror = err => {
        console.error('[WS] Group WebSocket error', err)
      }

      wsRef.onclose = () => {
        console.log('[WS] Group WebSocket connection closed')
      }

      return () => {
        wsRef.close()
      }
    }
  }, [groupId, session?.user?.email])

  // Mark message as read
  const markMessageAsRead = async (messageId) => {
    try {
      await RestApi.post(API_URLS.v0.USERS_GROUP_CHAT_ACTIONS, {
        action: 'markAsRead',
        messageId
      })
    } catch (error) {
      console.error('Error marking message as read:', error)
    }
  }

  // Scroll to bottom when messages change
  useEffect(() => {
    if (!loading && messages.length > 0) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }
  }, [messages, loading])

  // Helper function to trim only leading newlines and whitespace, but preserve newlines in content
  const trimLeadingNewlines = (text) => {
    // Remove leading newlines and whitespace, but preserve newlines in the content
    return text.replace(/^[\n\r\s]+/, '').trimEnd()
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !canSend || sending) return

    // Trim only leading newlines, preserve newlines in the message content
    const messageText = trimLeadingNewlines(newMessage)

    // If editing, update the message instead of sending new one
    if (editingMessage) {
      setSending(true)
      try {
        // Encrypt message if encryption is ready
        let messageToSend = messageText
        if (encryptionReadyRef.current) {
          try {
            messageToSend = await ChatEncryption.encryptGroupMessage(messageText, groupId)
          } catch (error) {
            console.error('[Encryption] Failed to encrypt edited message:', error)
            toast.error('Failed to encrypt message. Please try again.')
            setSending(false)
            return
          }
        }

        const result = await RestApi.put(API_URLS.v0.USERS_GROUP_CHAT, {
          messageId: editingMessage._id,
          message: messageToSend
        })

        if (result?.status === 'success') {
          setEditingMessage(null)
          setNewMessage('')
          // Focus input after editing
          setTimeout(() => {
            if (inputRef.current) {
              const inputElement = inputRef.current.querySelector('textarea') || 
                                   inputRef.current.querySelector('input') ||
                                   inputRef.current
              if (inputElement) {
                inputElement.focus()
              }
            }
          }, 100)
          toast.success('Message edited successfully')
        } else {
          toast.error(result?.message || 'Failed to edit message')
        }
      } catch (error) {
        console.error('Error editing message:', error)
        toast.error('An error occurred while editing message')
      } finally {
        setSending(false)
      }
      return
    }

    // Normal send message flow
    setNewMessage('')
    setSending(true)

    try {
      // Encrypt message if encryption is ready
      let messageToSend = messageText
      if (encryptionReadyRef.current) {
        try {
          messageToSend = await ChatEncryption.encryptGroupMessage(messageText, groupId)
        } catch (error) {
          console.error('[Encryption] Failed to encrypt message:', error)
          toast.error('Failed to encrypt message. Please try again.')
          setSending(false)
          setNewMessage(messageText)
          return
        }
      }

      const result = await RestApi.post(API_URLS.v0.USERS_GROUP_CHAT, {
        groupId,
        message: messageToSend,
        messageType: 'text'
      })

      if (result?.status === 'success') {
        // Focus input after sending message
        setTimeout(() => {
          if (inputRef.current) {
            const inputElement = inputRef.current.querySelector('textarea') || 
                                 inputRef.current.querySelector('input') ||
                                 inputRef.current
            if (inputElement) {
              inputElement.focus()
            }
          }
        }, 100)
      } else {
        toast.error(result?.message || 'Failed to send message')
        setNewMessage(messageText)
      }
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('An error occurred while sending message')
      setNewMessage(messageText)
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    
    if (isToday(date)) {
      return format(date, 'h:mm a') // 12-hour format with AM/PM
    } else if (isYesterday(date)) {
      return `Yesterday ${format(date, 'h:mm a')}` // 12-hour format with AM/PM
    } else {
      return format(date, 'MMM d, h:mm a') // 12-hour format with AM/PM
    }
  }

  const formatDateHeader = (timestamp) => {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    
    // Date headers don't need time, but if time is included, use 12-hour format
    if (isToday(date)) {
      return 'Today'
    } else if (isYesterday(date)) {
      return 'Yesterday'
    } else {
      return format(date, 'MMMM d, yyyy')
    }
  }

  const shouldShowDateHeader = (currentMessage, previousMessage) => {
    if (!previousMessage) return true
    
    const currentDate = new Date(currentMessage.createdAt)
    const previousDate = new Date(previousMessage.createdAt)
    
    return (
      currentDate.getDate() !== previousDate.getDate() ||
      currentDate.getMonth() !== previousDate.getMonth() ||
      currentDate.getFullYear() !== previousDate.getFullYear()
    )
  }

  const getSenderName = (senderEmail) => {
    if (senderEmail === groupData?.creatorEmail) {
      const creatorMember = groupData?.members?.find(m => {
        if (typeof m === 'object' && m.email === senderEmail) {
          return true
        }
        return false
      })
      
      if (creatorMember?.profile) {
        const firstName = creatorMember?.profile?.firstname || ''
        const lastName = creatorMember?.profile?.lastname || ''
        const fullName = `${firstName} ${lastName}`.trim()
        return fullName || 'Creator'
      }
      
      return 'Creator'
    }
    
    const member = groupData?.members?.find(m => {
      if (typeof m === 'object' && m.email === senderEmail) {
        return true
      }
      return false
    })
    
    if (member?.profile) {
      const firstName = member.profile.firstname || ''
      const lastName = member.profile.lastname || ''
      return `${firstName} ${lastName}`.trim() || senderEmail.split('@')[0]
    }
    
    return senderEmail.split('@')[0]
  }

  const getSenderAvatar = (senderEmail) => {
    if (senderEmail === groupData?.creatorEmail) {
      const creatorMember = groupData?.members?.find(m => {
        if (typeof m === 'object' && m.email === senderEmail) {
          return true
        }
        return false
      })
      
      if (creatorMember?.profile) {
        const firstName = creatorMember.profile.firstname || ''
        const lastName = creatorMember.profile.lastname || ''
        return (firstName[0] || lastName[0] || 'C').toUpperCase()
      }
      
      return 'C'
    }
    
    const member = groupData?.members?.find(m => {
      if (typeof m === 'object' && m.email === senderEmail) {
        return true
      }
      return false
    })
    
    if (member?.profile) {
      const firstName = member.profile.firstname || ''
      const lastName = member.profile.lastname || ''
      return (firstName[0] || lastName[0] || senderEmail[0] || 'U').toUpperCase()
    }
    
    return (senderEmail[0] || 'U').toUpperCase()
  }

  const loadMoreMessages = () => {
    if (loadingMore || !hasMore || messages.length === 0) return
    
    const oldestMessage = messages[0]
    if (oldestMessage?.createdAt) {
      fetchMessages(oldestMessage.createdAt)
    }
  }

  // Get all group members including creator
  const getAllMembers = () => {
    const members = []
    
    // Add creator first
    if (groupData?.creatorEmail) {
      const creatorMember = groupData?.members?.find(m => {
        if (typeof m === 'object' && m.email === groupData.creatorEmail) {
          return true
        }
        return false
      })
      
      members.push({
        email: groupData.creatorEmail,
        profile: creatorMember?.profile || null,
        isCreator: true
      })
    }
    
    // Add other members
    if (groupData?.members) {
      groupData.members.forEach(member => {
        if (typeof member === 'object' && member.email) {
          // Skip if already added as creator
          if (member.email !== groupData.creatorEmail) {
            members.push({
              email: member.email,
              profile: member.profile || null,
              isCreator: false
            })
          }
        }
      })
    }
    
    return members
  }

  // Handle member removal
  const handleRemoveMember = async () => {
    if (!selectedMember || !isCreator) return

    try {
      const result = await RestApi.post(API_URLS.v0.USERS_GROUP_CHAT_ACTIONS, {
        action: 'removeMember',
        groupId,
        memberEmail: selectedMember.email
      })

      if (result?.status === 'success') {
        setGroupData(result.result)
        toast.success('Member removed successfully')
        setMemberMenuAnchor(null)
        setSelectedMember(null)
      } else {
        toast.error(result?.message || 'Failed to remove member')
      }
    } catch (error) {
      console.error('Error removing member:', error)
      toast.error('An error occurred while removing member')
    }
  }

  // Handle settings update
  const handleSettingsUpdate = async (newIsAnnouncementOnly) => {
    if (!isCreator) return

    try {
      const result = await RestApi.post(API_URLS.v0.USERS_GROUP_CHAT_ACTIONS, {
        action: 'updateSettings',
        groupId,
        isAnnouncementOnly: newIsAnnouncementOnly
      })

      if (result?.status === 'success') {
        setGroupData(result.result)
        toast.success('Settings updated successfully')
        setSettingsDialogOpen(false)
      } else {
        toast.error(result?.message || 'Failed to update settings')
      }
    } catch (error) {
      console.error('Error updating settings:', error)
      toast.error('An error occurred while updating settings')
    }
  }

  // Handle delete group
  const handleDeleteGroup = async () => {
    if (!isCreator || !groupId) return

    try {
      const result = await RestApi.del(`${API_URLS.v0.USERS_GROUP}?id=${groupId}`)

      if (result?.status === 'success') {
        toast.success('Group deleted successfully')
        setDeleteGroupDialogOpen(false)
        setSettingsDialogOpen(false)
        // Navigate back after a short delay
        setTimeout(() => {
          router.push(backPath)
        }, 500)
      } else {
        throw new Error(result?.message || 'Failed to delete group')
      }
    } catch (error) {
      console.error('Error deleting group:', error)
      throw error
    }
  }

  // Handle add member form submit
  const handleAddMemberSubmit = async (values) => {
    if (!isCreator) return

    try {
      // Transform members to IDs if they're objects
      const memberIds = values.members.map(member => {
        if (typeof member === 'object' && member._id) {
          return member._id
        }
        return member
      })

      const payload = {
        _id: groupId,
        groupName: values.groupName,
        description: values.description,
        filters: values.filters || [],
        status: values.status,
        isAnnouncementOnly: values.isAnnouncementOnly || false,
        members: memberIds,
        membersCount: memberIds.length,
        updatedBy: session?.user?.id,
        updaterEmail: session?.user?.email
      }

      const result = await RestApi.put(API_URLS.v0.USERS_GROUP, payload)

      if (result?.status === 'success') {
        setGroupData(result.result)
        toast.success('Members updated successfully')
        setAddMemberDialogOpen(false)
        setMembersDrawerOpen(false)
      } else {
        toast.error(result?.message || 'Failed to update members')
      }
    } catch (error) {
      console.error('Error updating members:', error)
      toast.error('An error occurred while updating members')
    }
  }

  // Prepare group data for the form
  const getGroupDataForForm = () => {
    if (!groupData) return null

    return {
      ...groupData,
      members: groupData.members?.map(member => {
        if (typeof member === 'object' && member._id) {
          return member._id
        }
        return member
      }) || []
    }
  }

  // Get read receipts for a message (excluding sender's own read receipt)
  const getReadReceipts = (message) => {
    if (!message.readBy || message.readBy.length === 0) return []
    
    // Filter out sender's own read receipt
    const filteredReadBy = message.readBy.filter(reader => reader.userEmail !== message.senderEmail)
    
    return filteredReadBy.map(reader => {
      const member = getAllMembers().find(m => m.email === reader.userEmail)
      return {
        ...reader,
        member: member || null
      }
    })
  }

  // Get read status icon (WhatsApp style - more visible)
  const getReadStatusIcon = (message) => {
    // Filter out sender's own read receipt
    const readByExcludingSender = message.readBy?.filter(reader => reader.userEmail !== message.senderEmail) || []
    
    if (readByExcludingSender.length === 0) {
      return <CheckCircleIcon sx={{ fontSize: { xs: 16, sm: 18 }, color: 'rgba(255, 255, 255, 0.7)' }} />
    }
    
    // Total members excluding sender
    const totalMembers = getAllMembers().filter(m => m.email !== message.senderEmail).length
    const readCount = readByExcludingSender.length
    
    if (readCount === totalMembers) {
      // All read - blue double check (WhatsApp style)
      return <DoneAllIcon sx={{ fontSize: { xs: 16, sm: 18 }, color: '#4FC3F7' }} />
    } else if (readCount > 0) {
      // Some read - gray double check
      return <DoneAllIcon sx={{ fontSize: { xs: 16, sm: 18 }, color: 'rgba(255, 255, 255, 0.7)' }} />
    }
    
    // Sent but not read - single check
    return <CheckCircleIcon sx={{ fontSize: { xs: 16, sm: 18 }, color: 'rgba(255, 255, 255, 0.7)' }} />
  }

  // Generate color from string with contrast adjustment (same as ChatList)
  const getColorFromString = (str) => {
    if (!str) return null
    let color = stringToColor(str || 'user')
    
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

  // Get avatar background color from sender name (ensures good contrast with white text)
  const getAvatarBackgroundColor = (senderEmail) => {
    const name = getSenderName(senderEmail)
    // Use the name to generate a color
    let color = stringToColor(name || senderEmail)
    
    // Convert hex to RGB
    const hex = color.replace('#', '')
    let r = parseInt(hex.substr(0, 2), 16)
    let g = parseInt(hex.substr(2, 2), 16)
    let b = parseInt(hex.substr(4, 2), 16)
    
    // Calculate relative luminance (for contrast checking)
    const getLuminance = (r, g, b) => {
      const [rs, gs, bs] = [r, g, b].map(val => {
        val = val / 255
        return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)
      })
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
    }
    
    let luminance = getLuminance(r, g, b)
    
    // Ensure color is dark enough for white text (luminance should be < 0.5)
    // If too light, darken it progressively until we get good contrast
    let attempts = 0
    while (luminance > 0.4 && attempts < 10) {
      // Darken by reducing RGB values
      r = Math.max(0, Math.floor(r * 0.7))
      g = Math.max(0, Math.floor(g * 0.7))
      b = Math.max(0, Math.floor(b * 0.7))
      luminance = getLuminance(r, g, b)
      attempts++
    }
    
    // Ensure minimum brightness for visibility (at least one channel should be > 80)
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

  // Handle message menu actions
  const handleMessageMenuOpen = (event, message) => {
    event.stopPropagation()
    setMenuMessage(message)
    setMessageMenuAnchor(event.currentTarget)
  }

  const handleMessageMenuClose = () => {
    setMessageMenuAnchor(null)
    setMenuMessage(null)
  }

  const handleSelectMode = (message = null) => {
    if (message) {
      // If message is provided, toggle its selection
      const isAlreadySelected = selectedMessages.has(message._id)
      
      if (isAlreadySelected) {
        // Deselect the message
        setSelectedMessages(prev => {
          const newSet = new Set(prev)
          newSet.delete(message._id)
          // If no messages remain selected, exit selection mode
          if (newSet.size === 0) {
            setSelectionMode(false)
          }
          return newSet
        })
      } else {
        // Enter selection mode and select this message
        setSelectionMode(true)
        setSelectedMessages(new Set([message._id]))
      }
    } else {
      // No message provided, just enter selection mode
      setSelectionMode(true)
      setSelectedMessages(new Set())
    }
    handleMessageMenuClose()
  }

  const handleToggleMessageSelection = (messageId) => {
    setSelectedMessages(prev => {
      const newSet = new Set(prev)
      if (newSet.has(messageId)) {
        newSet.delete(messageId)
      } else {
        newSet.add(messageId)
      }
      return newSet
    })
  }

  const handleSelectAll = () => {
    const allMessageIds = messages
      .filter(msg => !msg.deletedFor?.some(d => d.userEmail === session?.user?.email))
      // Allow selecting deleted-for-everyone messages (to delete for me)
      .map(msg => msg._id)
    setSelectedMessages(new Set(allMessageIds))
  }

  const handleCancelSelection = () => {
    setSelectionMode(false)
    setSelectedMessages(new Set())
  }

  // Handle ESC key to exit selection mode
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && selectionMode) {
        handleCancelSelection()
      }
    }

    if (selectionMode) {
      window.addEventListener('keydown', handleKeyDown)
      return () => {
        window.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [selectionMode])

  // Handle clear group chat
  const handleClearGroupChat = async () => {
    try {
      const result = await RestApi.post(API_URLS.v0.USERS_GROUP_CHAT_ACTIONS, {
        action: 'clearChat',
        groupId
      })
      
      if (result?.status === 'success') {
        toast.success('Group chat cleared successfully')
        setMessages([])
        setClearChatDialogOpen(false)
        setMenuAnchor(null)
      } else {
        toast.error(result?.message || 'Failed to clear group chat')
      }
    } catch (error) {
      console.error('Error clearing group chat:', error)
      toast.error('Failed to clear group chat')
    }
  }

  // Handle exit group
  const handleExitGroup = async () => {
    try {
      const result = await RestApi.post(API_URLS.v0.USERS_GROUP_CHAT_ACTIONS, {
        action: 'exitGroup',
        groupId
      })
      
      if (result?.status === 'success') {
        toast.success('Successfully exited the group')
        setExitGroupDialogOpen(false)
        setMenuAnchor(null)
        // Navigate back to chat list
        router.push(backPath)
      } else {
        toast.error(result?.message || 'Failed to exit group')
      }
    } catch (error) {
      console.error('Error exiting group:', error)
      toast.error('Failed to exit group')
    }
  }

  const handleDeleteClick = (messageId, fromMenu = false) => {
    setSelectedMessages(new Set([messageId]))
    setDeleteFromMenu(fromMenu) // Mark if delete dialog is opened from menu
    setDeleteDialogOpen(true)
    if (fromMenu) {
      handleMessageMenuClose()
    }
  }

  const handleDeleteConfirm = async (deleteForEveryone = false) => {
    const messagesToDelete = selectedMessages.size > 0 
      ? Array.from(selectedMessages)
      : menuMessage ? [menuMessage._id] : []

    if (messagesToDelete.length === 0) return

    setDeleteFromMenu(false) // Reset after delete action

    try {
      let successCount = 0
      let errorCount = 0
      
      for (const messageId of messagesToDelete) {
        const message = messages.find(m => m._id === messageId)
        if (!message) {
          errorCount++
          continue
        }

        // Check if user is the sender (required for delete for everyone)
        const isSender = message.senderEmail === session?.user?.email
        
        // Only allow delete for everyone if:
        // 1. deleteForEveryone is true
        // 2. User is the sender
        // 3. Message is not already deleted for everyone
        const shouldDeleteForEveryone = deleteForEveryone && isSender && !isMessageDeletedForEveryone(message)
        
        if (deleteForEveryone && !isSender) {
          toast.error('Only the message sender can delete for everyone')
          errorCount++
          continue
        }
        
        if (deleteForEveryone && isMessageDeletedForEveryone(message)) {
          toast.error('Message is already deleted for everyone')
          errorCount++
          continue
        }
        
        try {
          const result = await RestApi.del(`${API_URLS.v0.USERS_GROUP_CHAT}?messageId=${messageId}&deleteForEveryone=${shouldDeleteForEveryone}`)
          if (result?.status === 'success') {
            successCount++
            // WebSocket will broadcast the update, which will trigger messageUpdate handler
            // No need to manually update state here
          } else {
            errorCount++
            toast.error(result?.message || 'Failed to delete message')
          }
        } catch (err) {
          errorCount++
          console.error('Error deleting message:', err)
        }
      }

      if (successCount > 0) {
        toast.success(`${successCount} message${successCount > 1 ? 's' : ''} deleted successfully`)
      }
      
      setDeleteDialogOpen(false)
      setSelectedMessages(new Set())
      setDeleteType(null)
      
      if (selectionMode) {
        handleCancelSelection()
      }
      
      // WebSocket will handle real-time updates automatically via messageUpdate event
      // No need to manually update state or reload messages
    } catch (error) {
      console.error('Error deleting messages:', error)
      toast.error('Failed to delete messages')
    }
  }

  const isMessageDeletedForMe = (message) => {
    return message.deletedFor?.some(d => d.userEmail === session?.user?.email)
  }

  const isMessageDeletedForEveryone = (message) => {
    return message.deletedForEveryone
  }

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          gap: 2,
          background: `radial-gradient(circle at 20% 20%, ${alpha(theme.palette.primary.main, isDarkMode ? 0.08 : 0.05)} 0%, transparent 50%),
                       radial-gradient(circle at 80% 80%, ${alpha(theme.palette.secondary.main, isDarkMode ? 0.08 : 0.05)} 0%, transparent 50%),
                       ${theme.palette.background.default}`
        }}
      >
        <CircularProgress size={isMobile ? 32 : 40} />
        <Typography 
          variant='body2' 
          color='text.secondary'
          sx={{ fontSize: { xs: '0.875rem', sm: '0.9375rem' } }}
        >
          Loading messages...
        </Typography>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: `radial-gradient(circle at 20% 20%, ${alpha(theme.palette.primary.main, isDarkMode ? 0.08 : 0.05)} 0%, transparent 50%),
                     radial-gradient(circle at 80% 80%, ${alpha(theme.palette.secondary.main, isDarkMode ? 0.08 : 0.05)} 0%, transparent 50%),
                     ${theme.palette.background.default}`
      }}
    >
      {/* Header */}
      <Box sx={{ position: 'relative' }}>
        <ChatHeader
          groupData={groupData}
          isConnected={isConnected}
          isCreator={isCreator}
          onBack={() => router.push(backPath)}
          onMembersClick={() => setMembersDrawerOpen(true)}
          onSettingsClick={() => setSettingsDialogOpen(true)}
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
          onMoreOptionsClick={(e) => setMenuAnchor(e.currentTarget)}
          isGroup={true}
          avatarColor={groupData?.groupName ? getColorFromString(groupData.groupName) : null}
          encryptionReady={encryptionReady}
        />
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={() => setMenuAnchor(null)}
        >
          <MenuItem onClick={() => {
            setMenuAnchor(null)
            setClearChatDialogOpen(true)
          }}>
            Clear Chat
          </MenuItem>
          {isCreator && (
            <MenuItem 
              onClick={() => {
                setMenuAnchor(null)
                setDeleteGroupDialogOpen(true)
              }} 
              sx={{ color: 'error.main' }}
            >
              <DeleteForeverIcon sx={{ mr: 1, fontSize: 20 }} />
              Delete Group
            </MenuItem>
          )}
          {!isCreator && (
            <MenuItem 
              onClick={() => {
                setMenuAnchor(null)
                setExitGroupDialogOpen(true)
              }} 
              sx={{ color: 'error.main' }}
            >
              <ExitToAppIcon sx={{ mr: 1, fontSize: 20 }} />
              Exit Group
            </MenuItem>
          )}
        </Menu>
      </Box>
      
      {/* Clear Chat Confirmation Dialog */}
      <Dialog open={clearChatDialogOpen} onClose={() => setClearChatDialogOpen(false)}>
        <DialogTitle>Clear Chat</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to clear all messages in this group chat? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClearChatDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleClearGroupChat} color='primary' variant='contained' component='label' sx={{ color: 'white' }}>
            Clear
          </Button>
        </DialogActions>
      </Dialog>

      {/* Exit Group Confirmation Dialog */}
      <Dialog open={exitGroupDialogOpen} onClose={() => setExitGroupDialogOpen(false)}>
        <DialogTitle>Exit Group</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to exit this group? You will no longer receive messages from this group and cannot rejoin unless you are added again.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExitGroupDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleExitGroup} color='error' variant='contained' component='label'>
            Exit Group
          </Button>
        </DialogActions>
      </Dialog>

      {/* Messages Area */}
      <MessagesArea
        messages={messages}
        messagesContainerRef={messagesContainerRef}
        messagesEndRef={messagesEndRef}
        loading={loading}
        loadingMore={loadingMore}
        hasMore={hasMore}
        onLoadMore={loadMoreMessages}
        selectionMode={selectionMode}
        selectedMessages={selectedMessages}
        onToggleMessageSelection={handleToggleMessageSelection}
        onMessageMenuOpen={handleMessageMenuOpen}
        formatMessageTime={formatMessageTime}
        formatDateHeader={formatDateHeader}
        shouldShowDateHeader={shouldShowDateHeader}
        getSenderName={getSenderName}
        getSenderAvatar={getSenderAvatar}
        getColorFromString={getColorFromString}
        getAvatarBackgroundColor={getAvatarBackgroundColor}
        getReadStatusIcon={getReadStatusIcon}
        isMessageDeletedForMe={isMessageDeletedForMe}
        isMessageDeletedForEveryone={isMessageDeletedForEveryone}
        groupData={groupData}
        getAllMembers={getAllMembers}
        session={session}
        theme={theme}
        isMobile={isMobile}
      />

      {/* Input Area or Selection Action Bar */}
      {selectionMode ? (
        <SelectionActionBar
          selectedCount={selectedMessages.size}
          onDelete={() => handleDeleteClick(false)} // Not from menu
          onCancel={handleCancelSelection}
        />
      ) : (
        <ChatInput
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          canSend={canSend}
          isConnected={isConnected}
          sending={sending}
          onSend={handleSendMessage}
          onKeyPress={handleKeyPress}
          inputRef={inputRef}
          groupData={groupData}
          editingMessage={editingMessage}
          onCancelEdit={() => {
            setEditingMessage(null)
            setNewMessage('')
          }}
          formatMessageTime={formatMessageTime}
          getSenderName={getSenderName}
        />
      )}

      {/* Message Menu (Three Dots) */}
      <MessageMenu
        anchorEl={messageMenuAnchor}
        open={Boolean(messageMenuAnchor)}
        onClose={handleMessageMenuClose}
        menuMessage={menuMessage}
        session={session}
        onInfoClick={() => {
          setSelectedMessage(menuMessage)
          setReadReceiptMenuAnchor(messageMenuAnchor)
          handleMessageMenuClose()
        }}
        onSelectMode={() => handleSelectMode(menuMessage)}
        onEditClick={async () => {
          setEditingMessage(menuMessage)
          // Ensure message is decrypted before editing
          let messageText = menuMessage.message
          if (encryptionReadyRef.current && ChatEncryption.isEncrypted(messageText)) {
            try {
              messageText = await ChatEncryption.decryptGroupMessage(messageText, groupId)
            } catch (error) {
              console.warn('[Encryption] Failed to decrypt message for editing:', error)
              // Continue with original message if decryption fails
            }
          }
          setNewMessage(messageText) // Prepopulate input with message text
          handleMessageMenuClose()
          // Focus input and set cursor to end after a short delay to ensure it's rendered
          setTimeout(() => {
            if (inputRef.current) {
              // For MUI TextField with inputRef, the ref points directly to the input/textarea element
              inputRef.current.focus()
              // Set cursor position to end of text
              const length = messageText.length
              if (inputRef.current.setSelectionRange) {
                inputRef.current.setSelectionRange(length, length)
              } else if (inputRef.current.createTextRange) {
                // Fallback for IE
                const range = inputRef.current.createTextRange()
                range.collapse(false)
                range.select()
              }
            }
          }, 100)
        }}
        onDeleteClick={() => handleDeleteClick(menuMessage._id, true)} // From menu
        isMessageDeletedForEveryone={isMessageDeletedForEveryone}
        isMessageDeletedForMe={isMessageDeletedForMe}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false)
          setDeleteType(null)
          setDeleteFromMenu(false)
          setSelectedMessages(new Set())
        }}
        selectedCount={selectedMessages.size}
        menuMessage={menuMessage}
        messages={messages}
        selectedMessages={selectedMessages}
        onConfirm={handleDeleteConfirm}
        isMessageDeletedForEveryone={isMessageDeletedForEveryone}
        fromMenu={deleteFromMenu}
        groupData={groupData}
      />

      {/* Members Drawer */}
      <MembersDrawer
        open={membersDrawerOpen}
        onClose={() => setMembersDrawerOpen(false)}
        members={getAllMembers()}
        isCreator={isCreator}
        onAddMember={() => setAddMemberDialogOpen(true)}
        onRemoveMember={(member, event) => {
          setSelectedMember(member)
          setMemberMenuAnchor(event?.currentTarget || event)
        }}
      />

      {/* Add Member Dialog */}
      <Dialog
        open={addMemberDialogOpen}
        onClose={() => setAddMemberDialogOpen(false)}
        maxWidth='md'
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            overflow: 'auto',
            background: theme.palette.background.default,
            height: isMobile ? '100vh' : 'auto',
            maxHeight: isMobile ? '100vh' : '90vh'
          }
        }}
      >
        <DialogTitle
          sx={{
            p: { xs: 1.5, sm: 2 },
            borderBottom: `1px solid ${alpha(theme.palette.divider, isDarkMode ? 0.12 : 0.08)}`
          }}
        >
          <Stack direction='row' alignItems='center' justifyContent='space-between'>
            <Typography 
              variant={isMobile ? 'h6' : 'h5'}
              sx={{ fontSize: { xs: '1.1rem', sm: '1.5rem', md: '1.75rem' } }}
            >
              Add/Remove Members
            </Typography>
            <IconButton 
              onClick={() => setAddMemberDialogOpen(false)} 
              size={isMobile ? 'small' : 'medium'}
            >
              <ArrowBackIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ p: { xs: 1.5, sm: 2 } }}>
          {getGroupDataForForm() && (
            <CreateGroupForm
                showHeader={false}
              data={getGroupDataForForm()}
              onSubmit={handleAddMemberSubmit}
              onCancel={() => setAddMemberDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Member Remove Menu */}
      <Menu
        anchorEl={memberMenuAnchor}
        open={Boolean(memberMenuAnchor)}
        onClose={() => {
          setMemberMenuAnchor(null)
          setSelectedMember(null)
        }}
        PaperProps={{
          sx: {
            minWidth: { xs: 180, sm: 200 },
            background: theme.palette.background.paper,
            border: `1px solid ${alpha(theme.palette.divider, isDarkMode ? 0.12 : 0.08)}`
          }
        }}
      >
        <MenuItem
          onClick={() => {
            handleRemoveMember()
          }}
          sx={{ 
            color: 'error.main',
            py: { xs: 1, sm: 1.25 },
            fontSize: { xs: '0.875rem', sm: '0.9375rem' }
          }}
        >
          <PersonRemoveIcon sx={{ mr: 1.5, fontSize: { xs: 18, sm: 20 } }} />
          Remove from group
        </MenuItem>
      </Menu>

      {/* Settings Dialog */}
      <Dialog
        open={settingsDialogOpen}
        onClose={() => setSettingsDialogOpen(false)}
        maxWidth='sm'
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            background: theme.palette.background.default
          }
        }}
      >
        <DialogTitle
          sx={{
            p: { xs: 1.5, sm: 2 },
            borderBottom: `1px solid ${alpha(theme.palette.divider, isDarkMode ? 0.12 : 0.08)}`
          }}
        >
          <Typography 
            variant={isMobile ? 'h6' : 'h5'}
            sx={{ fontSize: { xs: '1.1rem', sm: '1.5rem' } }}
          >
            Group Settings
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: { xs: 1.5, sm: 2 } }}>
          <FormControlLabel
            control={
              <Switch
                checked={groupData?.isAnnouncementOnly || false}
                onChange={(e) => handleSettingsUpdate(e.target.checked)}
                color='primary'
                size={isMobile ? 'small' : 'medium'}
              />
            }
            label={
              <Typography
                sx={{
                  fontSize: { xs: '0.875rem', sm: '0.9375rem' }
                }}
              >
                Announcement mode (Only admins can send messages)
              </Typography>
            }
          />
          <Typography 
            variant='caption' 
            color='text.secondary' 
            sx={{ 
              display: 'block', 
              mt: 1,
              mb: 2,
              fontSize: { xs: '0.75rem', sm: '0.8125rem' }
            }}
          >
            When enabled, only the group creator can send messages. Other members can only view messages.
          </Typography>
          
          {/* Divider between sections */}
          <Divider 
            sx={{ 
              my: { xs: 2, sm: 2.5 },
              borderColor: alpha(theme.palette.divider, isDarkMode ? 0.12 : 0.08)
            }} 
          />
          
          {/* Delete Group Section */}
          <Box>
            <Typography 
              variant='subtitle2'
              color='error'
              sx={{ 
                mb: 1.5,
                fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                fontWeight: 600
              }}
            >
              Warning!
            </Typography>
            <Typography 
              variant='body2' 
              color='text.secondary' 
              sx={{ 
                mb: 2,
                fontSize: { xs: '0.75rem', sm: '0.8125rem' }
              }}
            >
              Once you delete a group, there is no going back. Please be certain.
            </Typography>
            <Button
              variant='outlined'
              color='error'
              onClick={() => setDeleteGroupDialogOpen(true)}
              size={isMobile ? 'small' : 'medium'}
              fullWidth
              sx={{
                fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                borderColor: alpha(theme.palette.error.main, 0.3),
                '&:hover': {
                  borderColor: theme.palette.error.main,
                  background: alpha(theme.palette.error.main, 0.08)
                }
              }}
            >
              Delete Group
            </Button>
          </Box>
        </DialogContent>
        <DialogActions
          sx={{
            p: { xs: 1.5, sm: 2 },
            borderTop: `1px solid ${alpha(theme.palette.divider, isDarkMode ? 0.12 : 0.08)}`
          }}
        >
          <Button 
            onClick={() => setSettingsDialogOpen(false)}
            size={isMobile ? 'small' : 'medium'}
            variant='outlined'
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Group Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteGroupDialogOpen}
        setOpen={setDeleteGroupDialogOpen}
        type='delete-group'
        onConfirm={handleDeleteGroup}
      />

      {/* Read Receipts Menu */}
      <ReadReceiptsMenu
        anchorEl={readReceiptMenuAnchor}
        open={Boolean(readReceiptMenuAnchor)}
        onClose={() => {
          setReadReceiptMenuAnchor(null)
          setSelectedMessage(null)
        }}
        message={selectedMessage}
        getAllMembers={getAllMembers}
      />
    </Box>
  )
}

export default GroupChatPage
