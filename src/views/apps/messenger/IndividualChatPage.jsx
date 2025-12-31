'use client'
import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  Box,
  useTheme,
  alpha,
  useMediaQuery,
  CircularProgress,
  Typography,
  Menu,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button
} from '@mui/material'
import { MoreVert as MoreVertIcon } from '@mui/icons-material'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns'
import useSound from 'use-sound'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { toast } from 'react-toastify'
import { stringToColor } from '@/utils/stringToColor'
import ChatHeader from '../group/chat/ChatHeader'
import MessagesArea from '../group/chat/MessagesArea'
import ChatInput from '../group/chat/ChatInput'
import MessageMenu from '../group/chat/MessageMenu'
import SelectionActionBar from '../group/chat/SelectionActionBar'
import DeleteDialog from '../group/chat/DeleteDialog'
import ReadReceiptsMenu from '../group/chat/ReadReceiptsMenu'

const IndividualChatPage = ({ chatId, backPath = '/messanger' }) => {
  const theme = useTheme()
  const isDarkMode = theme.palette.mode === 'dark'
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
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
  const [isConnected, setIsConnected] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [otherUser, setOtherUser] = useState(null)
  const [readReceiptMenuAnchor, setReadReceiptMenuAnchor] = useState(null)
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [messageMenuAnchor, setMessageMenuAnchor] = useState(null)
  const [menuMessage, setMenuMessage] = useState(null)
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedMessages, setSelectedMessages] = useState(new Set())
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteType, setDeleteType] = useState(null)
  const [editingMessage, setEditingMessage] = useState(null)
  const [deleteFromMenu, setDeleteFromMenu] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const soundEnabledRef = useRef(true)
  const [newMessageForNotification, setNewMessageForNotification] = useState(null)
  const [menuAnchor, setMenuAnchor] = useState(null)
  const [clearChatDialogOpen, setClearChatDialogOpen] = useState(false)
  const [deleteChatDialogOpen, setDeleteChatDialogOpen] = useState(false)

  // Extract emails from chatId and decode them (chatId may be URL-encoded)
  const extractAndDecodeEmail = (email) => {
    if (!email) return null
    try {
      // Try decoding multiple times if needed (handles double-encoding)
      let decoded = email
      for (let i = 0; i < 3; i++) {
        try {
          const testDecode = decodeURIComponent(decoded)
          if (testDecode === decoded) break // No more decoding needed
          decoded = testDecode
        } catch (e) {
          break // Can't decode further
        }
      }
      return decoded
    } catch (e) {
      return email // Return original if decoding fails
    }
  }

  const [email1, email2] = chatId ? chatId.split('_').map(extractAndDecodeEmail) : [null, null]
  const otherUserEmail = email1 === session?.user?.email ? email2 : email1

  // Sound hooks
  const [playSoundOn] = useSound('/sounds/sound-on.mp3', { volume: 0.7 })
  const [playSoundOff] = useSound('/sounds/sound-off.mp3', { volume: 0.7 })
  const [playNotificationSound] = useSound('/sounds/notification.mp3', { volume: 0.7 })

  // Fetch other user info and messages in parallel for faster loading
  useEffect(() => {
    const fetchOtherUser = async () => {
      if (!otherUserEmail) return

      try {
        const result = await RestApi.get(`${API_URLS.v0.USER}/${otherUserEmail}`)
        if (result?.status === 'success') {
          setOtherUser(result.result)
        }
      } catch (error) {
        console.error('Error fetching other user:', error)
      }
    }

    // Fetch user info in parallel with messages (don't block on this)
    fetchOtherUser()
  }, [otherUserEmail])

  // Play notification sound
  useEffect(() => {
    if (newMessageForNotification && soundEnabled) {
      const message = newMessageForNotification
      if (
        message.senderEmail !== session?.user?.email &&
        !message.deletedFor?.some(d => d.userEmail === session?.user?.email) &&
        !message.deletedForEveryone
      ) {
        try {
          playNotificationSound()
        } catch (error) {
          console.error('Error playing notification sound:', error)
        }
      }
      setNewMessageForNotification(null)
    }
  }, [newMessageForNotification, soundEnabled, session?.user?.email, playNotificationSound])

  // Toggle sound
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

  useEffect(() => {
    soundEnabledRef.current = soundEnabled
  }, [soundEnabled])

  // Fetch initial messages
  const fetchMessages = useCallback(async (before = null) => {
    if (!chatId) return

    try {
      if (before) {
        setLoadingMore(true)
      } else {
        setLoading(true)
      }

      const params = new URLSearchParams({
        chatId,
        limit: '50'
      })
      if (before) {
        params.append('before', before)
      }
      if (session?.user?.email) {
        params.append('userEmail', session.user.email)
      }

      const result = await RestApi.get(`${API_URLS.v0.USERS_INDIVIDUAL_CHAT}?${params.toString()}`)

      if (result?.status === 'success') {
        const fetchedMessages = result.result || []
        
        if (before) {
          setMessages(prev => [...fetchedMessages, ...prev])
          setHasMore(fetchedMessages.length === 50)
        } else {
          setMessages(fetchedMessages)
          setHasMore(fetchedMessages.length === 50)
          
          if (fetchedMessages.length > 0) {
            markAllMessagesAsRead()
          }
          
          // Scroll to bottom after messages are loaded
          setTimeout(() => {
            if (messagesEndRef.current) {
              messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
            }
          }, 100)
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
  }, [chatId, session?.user?.email])

  useEffect(() => {
    if (chatId) {
      fetchMessages()
    }
  }, [chatId, fetchMessages])

  // Mark all messages as read
  const markAllMessagesAsRead = async () => {
    try {
      await RestApi.post(API_URLS.v0.USERS_INDIVIDUAL_CHAT_ACTIONS, {
        action: 'markAllAsRead',
        chatId
      })
    } catch (error) {
      console.error('Error marking messages as read:', error)
    }
  }

  // Normalize chatId for WebSocket connection (ensure it matches the format used in service)
  const normalizeChatIdForWS = (chatId) => {
    if (!chatId) return chatId
    
    try {
      // Decode URL-encoded chatId
      let decoded = chatId
      for (let i = 0; i < 3; i++) {
        try {
          const testDecode = decodeURIComponent(decoded)
          if (testDecode === decoded) break
          decoded = testDecode
        } catch (e) {
          break
        }
      }
      
      // Split and normalize emails
      const [email1, email2] = decoded.split('_')
      if (!email1 || !email2) return chatId
      
      // Decode and normalize emails
      let normalizedEmail1 = email1
      let normalizedEmail2 = email2
      try {
        normalizedEmail1 = decodeURIComponent(email1).toLowerCase().trim()
        normalizedEmail2 = decodeURIComponent(email2).toLowerCase().trim()
      } catch (e) {
        normalizedEmail1 = email1.toLowerCase().trim()
        normalizedEmail2 = email2.toLowerCase().trim()
      }
      
      // Sort emails to ensure consistent format (matches service layer)
      const sorted = [normalizedEmail1, normalizedEmail2].sort()
      return `${sorted[0]}_${sorted[1]}`
    } catch (e) {
      console.warn('Failed to normalize chatId for WS:', e)
      return chatId
    }
  }

  // WebSocket connection
  useEffect(() => {
    if (!chatId || !session?.user?.email) return

    // Normalize chatId to match the format used in service layer
    const normalizedChatId = normalizeChatIdForWS(chatId)

    const wsUrl =
      typeof window !== 'undefined'
        ? `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${
            window.location.host
          }/api/ws/individual-chat/${encodeURIComponent(normalizedChatId)}`
        : ''

    if (wsUrl) {
      const wsRef = new WebSocket(wsUrl)

      wsRef.onopen = () => {
        console.log('[WS] Connected to individual chat')
        setIsConnected(true)
        setSocket(wsRef)
        markAllMessagesAsRead()
      }

      wsRef.onmessage = event => {
        try {
          const msg = JSON.parse(event.data)
          
          if (msg.type === 'connected') {
            console.log('[WS] Chat connection confirmed')
          } else if (msg.type === 'newMessage' || msg.type === 'newChatMessage') {
            const message = msg.data
            
            if (
              soundEnabledRef.current &&
              message.senderEmail !== session?.user?.email &&
              !message.deletedFor?.some(d => d.userEmail === session?.user?.email) &&
              !message.deletedForEveryone
            ) {
              setNewMessageForNotification(message)
            }
            
            setMessages(prev => {
              const exists = prev.some(m => m._id === message._id)
              if (exists) return prev
              const isDeletedForMe = message.deletedFor?.some(d => d.userEmail === session?.user?.email)
              if (isDeletedForMe) return prev
              const updated = [...prev, message]
              if (!message.deletedForEveryone && message.senderEmail !== session?.user?.email) {
                setTimeout(() => {
                  markMessageAsRead(message._id)
                }, 100)
              }
              return updated
            })
            setTimeout(() => {
              messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
            }, 100)
          } else if (msg.type === 'messageUpdate') {
            setMessages(prev => {
              const messageExists = prev.some(m => m._id === msg.data._id)
              let updated
              
              if (messageExists) {
                updated = prev.map(m =>
                  m._id === msg.data._id ? { ...m, ...msg.data } : m
                )
              } else {
                updated = prev
              }
              
              return updated.filter(m => {
                const isDeletedForMe = m.deletedFor?.some(d => d.userEmail === session?.user?.email)
                return !isDeletedForMe
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
  }, [chatId, session?.user?.email])

  // Mark message as read
  const markMessageAsRead = async (messageId) => {
    try {
      await RestApi.post(API_URLS.v0.USERS_INDIVIDUAL_CHAT_ACTIONS, {
        action: 'markAsRead',
        messageId
      })
    } catch (error) {
      console.error('Error marking message as read:', error)
    }
  }

  // Scroll to bottom
  useEffect(() => {
    if (!loading && messages.length > 0) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }
  }, [messages, loading])

  // Trim leading newlines
  const trimLeadingNewlines = (text) => {
    return text.replace(/^[\n\r\s]+/, '').trimEnd()
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return

    const messageText = trimLeadingNewlines(newMessage)

    if (editingMessage) {
      setSending(true)
      try {
        const result = await RestApi.put(API_URLS.v0.USERS_INDIVIDUAL_CHAT, {
          messageId: editingMessage._id,
          message: messageText
        })

        if (result?.status === 'success') {
          setEditingMessage(null)
          setNewMessage('')
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

    setNewMessage('')
    setSending(true)

    try {
      const result = await RestApi.post(API_URLS.v0.USERS_INDIVIDUAL_CHAT, {
        receiverEmail: otherUserEmail,
        message: messageText,
        messageType: 'text'
      })

      if (result?.status === 'success') {
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
      return format(date, 'h:mm a')
    } else if (isYesterday(date)) {
      return `Yesterday ${format(date, 'h:mm a')}`
    } else {
      return format(date, 'MMM d, h:mm a')
    }
  }

  const formatDateHeader = (timestamp) => {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    
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
    if (senderEmail === session?.user?.email) {
      return 'You'
    }
    
    if (otherUser?.profile) {
      const firstName = otherUser.profile.firstname || ''
      const lastName = otherUser.profile.lastname || ''
      return `${firstName} ${lastName}`.trim() || senderEmail.split('@')[0]
    }
    
    return senderEmail.split('@')[0]
  }

  const getSenderAvatar = (senderEmail) => {
    if (senderEmail === session?.user?.email) {
      const firstName = session?.user?.profile?.firstname || ''
      const lastName = session?.user?.profile?.lastname || ''
      return (firstName[0] || lastName[0] || session?.user?.email[0] || 'U').toUpperCase()
    }
    
    if (otherUser?.profile) {
      const firstName = otherUser.profile.firstname || ''
      const lastName = otherUser.profile.lastname || ''
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

  const getReadReceipts = (message) => {
    if (!message.readBy || message.readBy.length === 0) return []
    
    const filteredReadBy = message.readBy.filter(reader => reader.userEmail !== message.senderEmail)
    
    return filteredReadBy.map(reader => ({
      ...reader,
      member: {
        email: reader.userEmail,
        profile: reader.userEmail === otherUserEmail ? otherUser?.profile : null
      }
    }))
  }

  const getReadStatusIcon = (message) => {
    const readByExcludingSender = message.readBy?.filter(reader => reader.userEmail !== message.senderEmail) || []
    
    if (readByExcludingSender.length === 0) {
      return null // Single check for sent
    }
    
    // Double check for read (individual chat - only one other person)
    return readByExcludingSender.length > 0
  }

  const getColorFromString = (str) => {
    return stringToColor(str || 'user')
  }

  const getAvatarBackgroundColor = (senderEmail) => {
    // Use email directly for consistent color generation (same as ChatList)
    let color = stringToColor(senderEmail || 'user')
    
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
      const isAlreadySelected = selectedMessages.has(message._id)
      
      if (isAlreadySelected) {
        setSelectedMessages(prev => {
          const newSet = new Set(prev)
          newSet.delete(message._id)
          if (newSet.size === 0) {
            setSelectionMode(false)
          }
          return newSet
        })
      } else {
        setSelectionMode(true)
        setSelectedMessages(new Set([message._id]))
      }
    } else {
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

  const handleCancelSelection = () => {
    setSelectionMode(false)
    setSelectedMessages(new Set())
  }

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

  // Handle clear chat
  const handleClearChat = async () => {
    try {
      const result = await RestApi.post(API_URLS.v0.USERS_INDIVIDUAL_CHAT_ACTIONS, {
        action: 'clearChat',
        chatId
      })
      
      if (result?.status === 'success') {
        toast.success('Chat cleared successfully')
        setMessages([])
        setClearChatDialogOpen(false)
        setMenuAnchor(null)
        // Navigate back to chat list
        router.push(backPath)
      } else {
        toast.error(result?.message || 'Failed to clear chat')
      }
    } catch (error) {
      console.error('Error clearing chat:', error)
      toast.error('Failed to clear chat')
    }
  }

  // Handle delete chat
  const handleDeleteChat = async () => {
    try {
      const result = await RestApi.post(API_URLS.v0.USERS_INDIVIDUAL_CHAT_ACTIONS, {
        action: 'deleteChat',
        chatId
      })
      
      if (result?.status === 'success') {
        toast.success('Chat deleted successfully')
        setDeleteChatDialogOpen(false)
        setMenuAnchor(null)
        // Navigate back to chat list
        router.push(backPath)
      } else {
        toast.error(result?.message || 'Failed to delete chat')
      }
    } catch (error) {
      console.error('Error deleting chat:', error)
      toast.error('Failed to delete chat')
    }
  }

  const handleDeleteClick = (messageId, fromMenu = false) => {
    setSelectedMessages(new Set([messageId]))
    setDeleteFromMenu(fromMenu)
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

    setDeleteFromMenu(false)

    try {
      let successCount = 0
      let errorCount = 0
      
      for (const messageId of messagesToDelete) {
        const message = messages.find(m => m._id === messageId)
        if (!message) {
          errorCount++
          continue
        }

        const isSender = message.senderEmail === session?.user?.email
        
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
          const result = await RestApi.del(`${API_URLS.v0.USERS_INDIVIDUAL_CHAT}?messageId=${messageId}&deleteForEveryone=${shouldDeleteForEveryone}`)
          if (result?.status === 'success') {
            successCount++
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

  // Create mock groupData for ChatHeader (individual chat doesn't need all group features)
  const mockGroupData = {
    groupName: getSenderName(otherUserEmail),
    creatorEmail: session?.user?.email,
    members: [
      {
        email: session?.user?.email,
        profile: session?.user?.profile
      },
      {
        email: otherUserEmail,
        profile: otherUser?.profile
      }
    ]
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
          groupData={mockGroupData}
          isConnected={isConnected}
          isCreator={false}
          onBack={() => router.push(backPath)}
          onMembersClick={() => {}}
          onSettingsClick={() => {}}
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
          onMoreOptionsClick={(e) => setMenuAnchor(e.currentTarget)}
          isIndividualChat={true}
          avatarText={otherUser?.profile
            ? (otherUser.profile.firstname?.[0] || otherUser.profile.lastname?.[0] || otherUserEmail[0] || 'U').toUpperCase()
            : (otherUserEmail?.[0] || 'U').toUpperCase()}
          avatarColor={otherUser ? getAvatarBackgroundColor(otherUserEmail) : null}
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
          <MenuItem onClick={() => {
            setMenuAnchor(null)
            setDeleteChatDialogOpen(true)
          }} sx={{ color: 'error.main' }}>
            Delete Chat
          </MenuItem>
        </Menu>
      </Box>
      
      {/* Clear Chat Confirmation Dialog */}
      <Dialog open={clearChatDialogOpen} onClose={() => setClearChatDialogOpen(false)}>
        <DialogTitle>Clear Chat</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to clear all messages in this chat? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClearChatDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleClearChat} color='primary' variant='contained' component='label' sx={{ color: 'white' }}>
            Clear
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Chat Confirmation Dialog */}
      <Dialog open={deleteChatDialogOpen} onClose={() => setDeleteChatDialogOpen(false)}>
        <DialogTitle>Delete Chat</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this chat? All messages will be removed and this action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteChatDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteChat} color='error' variant='contained' component='label'>
            Delete
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
        groupData={mockGroupData}
        getAllMembers={() => [
          { email: session?.user?.email, profile: session?.user?.profile },
          { email: otherUserEmail, profile: otherUser?.profile }
        ]}
        session={session}
        theme={theme}
        isMobile={isMobile}
        isIndividualChat={true}
      />

      {/* Input Area or Selection Action Bar */}
      {selectionMode ? (
        <SelectionActionBar
          selectedCount={selectedMessages.size}
          onDelete={() => handleDeleteClick(false)}
          onCancel={handleCancelSelection}
        />
      ) : (
        <ChatInput
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          canSend={true}
          isConnected={isConnected}
          sending={sending}
          onSend={handleSendMessage}
          onKeyPress={handleKeyPress}
          inputRef={inputRef}
          groupData={mockGroupData}
          editingMessage={editingMessage}
          onCancelEdit={() => {
            setEditingMessage(null)
            setNewMessage('')
          }}
          formatMessageTime={formatMessageTime}
          getSenderName={getSenderName}
        />
      )}

      {/* Message Menu */}
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
        onEditClick={() => {
          setEditingMessage(menuMessage)
          const messageText = menuMessage.message
          setNewMessage(messageText)
          handleMessageMenuClose()
          setTimeout(() => {
            if (inputRef.current) {
              inputRef.current.focus()
              const length = messageText.length
              if (inputRef.current.setSelectionRange) {
                inputRef.current.setSelectionRange(length, length)
              }
            }
          }, 100)
        }}
        onDeleteClick={() => handleDeleteClick(menuMessage._id, true)}
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
        groupData={mockGroupData}
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
        getAllMembers={() => [
          { email: session?.user?.email, profile: session?.user?.profile },
          { email: otherUserEmail, profile: otherUser?.profile }
        ]}
        isIndividualChat={true}
      />
    </Box>
  )
}

export default IndividualChatPage

