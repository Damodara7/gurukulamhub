'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  Stack,
  useTheme,
  alpha,
  useMediaQuery
} from '@mui/material'
import { SmartToy as AiIcon } from '@mui/icons-material'
import ChatMessage from '@/components/ai/ChatMessage'
import TypingIndicator from '@/components/ai/TypingIndicator'
import AIChatInput from '@/components/ai/AIChatInput'

export default function AIChatPage({ userEmail: _userEmail, userRoles: _userRoles }) {
  const welcomeMessage = {
    id: 'welcome',
    role: 'assistant',
    content: 'Hi! I’m your AI assistant. Ask me anything — I can reason and use tools to help.'
  }
  const theme = useTheme()
  const isDarkMode = theme.palette.mode === 'dark'
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const [messages, setMessages] = useState([welcomeMessage])
  const [input, setInput] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const [thinkingStatus, setThinkingStatus] = useState('')
  const [sessionReady, setSessionReady] = useState(false)

  const scrollRef = useRef(null)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)
  const sessionIdRef = useRef('')
  const wsRef = useRef(null)
  const wsPingRef = useRef(null)

  const normalizeAssistantText = useCallback((text) => {
    if (!text) return ''
    const value = String(text)
      .replace(/\\r\\n/g, '\n')
      .replace(/\\n/g, '\n')
      .replace(/\u00a0/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
    return value
  }, [])

  const mapMessagesForUi = useCallback(
    (rawMessages = []) => {
      const list = Array.isArray(rawMessages) ? rawMessages : []
      return list.map((m, idx) => {
        const role = m?.role === 'user' ? 'user' : 'assistant'
        const normalizedContent =
          role === 'assistant' ? normalizeAssistantText(m?.content) : String(m?.content || '')
        return {
          id: m?.id || `${role}-${idx}-${Date.now()}`,
          role,
          content: normalizedContent
        }
      })
    },
    [normalizeAssistantText]
  )

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isThinking, scrollToBottom])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const setupSessionAndHistory = async () => {
      let sid = window.localStorage.getItem('ai_chat_session_id')
      if (!sid) {
        sid = `ai-${Date.now()}-${Math.random().toString(36).slice(2)}`
        window.localStorage.setItem('ai_chat_session_id', sid)
      }

      sessionIdRef.current = sid
      setSessionReady(true)

      try {
        const historyRes = await fetch(`/api/ai/chat?sessionId=${encodeURIComponent(sid)}`)
        const historyData = await historyRes.json()
        if (historyRes.ok && historyData?.status === 'success') {
          const loadedMessages = mapMessagesForUi(historyData?.result?.messages)
          setMessages(loadedMessages.length > 0 ? loadedMessages : [welcomeMessage])
        }
      } catch (error) {
        console.error('[AI chat UI] failed to fetch history', error)
      }
    }

    setupSessionAndHistory()
  }, [mapMessagesForUi])

  useEffect(() => {
    if (!sessionReady || typeof window === 'undefined') return
    const sid = sessionIdRef.current
    if (!sid) return

    const wsUrl = `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/api/ws/ai-chat/${encodeURIComponent(sid)}`
    const socket = new window.WebSocket(wsUrl)
    wsRef.current = socket

    socket.onopen = () => {
      wsPingRef.current = window.setInterval(() => {
        if (socket.readyState === window.WebSocket.OPEN) {
          socket.send(JSON.stringify({ type: 'ping' }))
        }
      }, 30000)
    }

    socket.onmessage = event => {
      try {
        const payload = JSON.parse(event.data)
        if (payload?.type === 'sessionUpdate') {
          const incoming = mapMessagesForUi(payload?.messages)
          setMessages(incoming.length > 0 ? incoming : [welcomeMessage])
          setIsThinking(false)
          setThinkingStatus('')
        }
      } catch (error) {
        console.error('[AI chat UI] websocket message parse error', error)
      }
    }

    socket.onerror = error => {
      console.error('[AI chat UI] websocket error', error)
    }

    return () => {
      if (wsPingRef.current) {
        window.clearInterval(wsPingRef.current)
        wsPingRef.current = null
      }
      if (wsRef.current) {
        wsRef.current.close(1000, 'AI chat page unmount')
        wsRef.current = null
      }
    }
  }, [sessionReady, mapMessagesForUi])

  const sendMessage = useCallback(async () => {
    const trimmed = input.trim()
    if (!trimmed || isThinking) return
    console.log('[AI chat UI] sending message', {
      sessionId: sessionIdRef.current || null,
      messageLength: trimmed.length,
      preview: trimmed.slice(0, 80)
    })

    const userId = `user-${Date.now()}`
    setMessages((prev) => [...prev, { id: userId, role: 'user', content: trimmed }])
    setInput('')
    setIsThinking(true)
    setThinkingStatus('Thinking...')

    const assistantId = `assistant-${Date.now()}`
    setMessages((prev) => [...prev, { id: assistantId, role: 'assistant', content: '' }])

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          sessionId: sessionIdRef.current
        })
      })

      if (!response.ok || !response.body) {
        throw new Error('Failed to stream AI response')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let receivedAnyToken = false

      const appendAssistantToken = (token) => {
        if (!token) return
        receivedAnyToken = true
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: (m.content || '') + token } : m))
        )
      }

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const frames = buffer.split('\n\n')
        buffer = frames.pop() || ''

        for (const frame of frames) {
          const line = frame
            .split('\n')
            .find((l) => l.startsWith('data: '))
          if (!line) continue
          const raw = line.slice(6)
          if (!raw) continue

          let event
          try {
            event = JSON.parse(raw)
          } catch {
            continue
          }

          if (event.type === 'meta' && event.sessionId) {
            console.log('[AI chat UI] stream meta', event)
            sessionIdRef.current = event.sessionId
            if (typeof window !== 'undefined') {
              window.localStorage.setItem('ai_chat_session_id', event.sessionId)
            }
          } else if (event.type === 'thinking') {
            console.log('[AI chat UI] thinking status', event.status)
            setThinkingStatus(event.status || 'Thinking...')
          } else if (event.type === 'token') {
            appendAssistantToken(event.token || '')
          } else if (event.type === 'done') {
            console.log('[AI chat UI] stream done', {
              sessionId: event.sessionId,
              responseLength: (event.message || '').length,
              toolLogCount: event.toolLogs?.length || 0
            })
            // Fallback/final sync: if no token chunks arrived, use final message payload.
            // Also protects against any dropped token events.
            if (event.message) {
              const normalizedDoneMessage = normalizeAssistantText(event.message)
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? {
                        ...m,
                        content: receivedAnyToken
                          ? normalizeAssistantText(m.content || normalizedDoneMessage)
                          : normalizedDoneMessage
                      }
                    : m
                )
              )
            }
            setThinkingStatus('')
          } else if (event.type === 'error') {
            console.error('[AI chat UI] stream error event', event)
            throw new Error(event.message || 'AI request failed')
          }
        }
      }
    } catch (error) {
      console.error('AI streaming error:', error)
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: 'Something went wrong while getting AI response. Please try again.' }
            : m
        )
      )
    } finally {
      setIsThinking(false)
      setThinkingStatus('')
      inputRef.current?.focus()
    }
  }, [input, isThinking, normalizeAssistantText])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleCopyMessage = useCallback(async (text) => {
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
    } catch (error) {
      console.error('Failed to copy message:', error)
    }
  }, [])

  const handleEditMessage = useCallback((messageId) => {
    const target = messages.find((m) => m.id === messageId && m.role === 'user')
    if (!target) return
    setInput(target.content)
    inputRef.current?.focus()
  }, [messages])

  return (
    <Box
      sx={{
        height: '100%',
        minHeight: { xs: 'calc(100vh - 120px)', sm: 'calc(100vh - 100px)' },
        display: 'flex',
        flexDirection: 'column',
        bgcolor: alpha(theme.palette.background.default, 1),
        overflow: 'hidden',
        borderRadius: { xs: 0, sm: 1 }
      }}
    >
      {/* Header */}
      <Paper
        elevation={0}
        square={isMobile}
        sx={{
          flexShrink: 0,
          px: { xs: 2, sm: 3 },
          py: { xs: 1.5, sm: 2 },
          borderBottom: `1px solid ${alpha(theme.palette.divider, isDarkMode ? 0.15 : 0.08)}`,
          bgcolor: theme.palette.background.paper,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.85)}, ${alpha(theme.palette.secondary.main, 0.75)})`,
            color: 'white'
          }}
        >
          <AiIcon sx={{ fontSize: 24 }} />
        </Box>
        <Box>
          <Typography variant='subtitle1' fontWeight={700} sx={{ lineHeight: 1.2 }}>
            AI Assistant
          </Typography>
          <Typography variant='caption' color='text.secondary'>
            Agentic mode · Tool-enabled
          </Typography>
        </Box>
      </Paper>

      {/* Messages */}
      <Box
        ref={scrollRef}
        sx={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          px: { xs: 2, sm: 3 },
          py: { xs: 2, sm: 3 },
          '&::-webkit-scrollbar': { width: 8 },
          '&::-webkit-scrollbar-thumb': {
            borderRadius: 4,
            bgcolor: alpha(theme.palette.primary.main, 0.25)
          }
        }}
      >
        <Stack spacing={2} sx={{ width: '100%', mx: 'auto' }}>
          {messages.map((m) => (
            <ChatMessage
              key={m.id}
              role={m.role}
              content={m.content}
              theme={theme}
              isDarkMode={isDarkMode}
              onCopy={() => handleCopyMessage(m.content)}
              onEdit={() => handleEditMessage(m.id)}
            />
          ))}
          {isThinking && <TypingIndicator theme={theme} isDarkMode={isDarkMode} statusText={thinkingStatus} />}
          <div ref={bottomRef} />
        </Stack>
      </Box>

      {/* Input */}
      <Paper
        elevation={isMobile ? 8 : 0}
        square={isMobile}
        sx={{
          flexShrink: 0,
          px: { xs: 2, sm: 3 },
          py: { xs: 1.5, sm: 2 },
          borderTop: `1px solid ${alpha(theme.palette.divider, isDarkMode ? 0.15 : 0.08)}`,
          bgcolor: theme.palette.background.paper
        }}
      >
        <AIChatInput
          value={input}
          onChange={setInput}
          onKeyDown={handleKeyDown}
          onSend={sendMessage}
          disabled={isThinking}
          canSend={Boolean(input.trim())}
          isMobile={isMobile}
          theme={theme}
          isDarkMode={isDarkMode}
          inputRef={inputRef}
        />
      </Paper>
    </Box>
  )
}
