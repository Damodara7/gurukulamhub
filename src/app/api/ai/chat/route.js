import { runAgentWithMcp } from '@/lib/ai/agent'
import { getOrCreateSession, pruneSessions, saveSession } from '@/lib/ai/sessionStore'
import { hydrateSessionFromDb, persistSessionToDb } from '@/lib/ai/sessionPersistence'
import { broadcastAiChatSessionUpdate } from '@/app/api/ws/ai-chat/[sessionId]/publishers'

export const dynamic = 'force-dynamic'

function sseFrame(payload) {
  return `data: ${JSON.stringify(payload)}\n\n`
}

function getProviderFromEnv() {
  const provider = (process.env.LLM_PROVIDER || 'openai').toLowerCase()
  return provider === 'gemini' ? 'gemini' : 'openai'
}

function toUiMessages(messages = []) {
  return (Array.isArray(messages) ? messages : [])
    .filter(m => m?.role === 'user' || m?.role === 'assistant')
    .map((m, index) => ({
      id: m.id || `${m.role}-${index}`,
      role: m.role,
      content: String(m.content || '')
    }))
}

export async function GET(req) {
  pruneSessions()
  const sessionId = String(req.nextUrl.searchParams.get('sessionId') || '').trim()
  if (!sessionId) {
    return new Response(
      JSON.stringify({ status: 'error', message: 'sessionId is required', result: null }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const session = getOrCreateSession(sessionId)
  await hydrateSessionFromDb(session)
  saveSession(session)

  return new Response(
    JSON.stringify({
      status: 'success',
      message: 'Session history fetched',
      result: {
        sessionId: session.sessionId,
        messages: toUiMessages(session.messages),
        toolLogs: session.toolLogs || []
      }
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  )
}

export async function POST(req) {
  pruneSessions()
  const body = await req.json().catch(() => ({}))
  const message = String(body?.message || '').trim()
  const sessionId = String(body?.sessionId || '').trim()
  console.log('[AI chat route] incoming request', {
    hasMessage: Boolean(message),
    messageLength: message.length,
    sessionId: sessionId || null
  })

  if (!message) {
    return new Response(
      JSON.stringify({
        status: 'error',
        message: 'message is required',
        result: null
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const session = getOrCreateSession(sessionId)
  await hydrateSessionFromDb(session)
  const provider = getProviderFromEnv()
  const origin = req.nextUrl.origin
  const encoder = new TextEncoder()
  console.log('[AI chat route] session resolved', {
    sessionId: session.sessionId,
    provider,
    historyCount: session.messages?.length || 0
  })

  const stream = new ReadableStream({
    async start(controller) {
      const push = (payload) => controller.enqueue(encoder.encode(sseFrame(payload)))

      try {
        push({ type: 'meta', sessionId: session.sessionId, provider })
        console.log('[AI chat route] stream started', { sessionId: session.sessionId })
        const result = await runAgentWithMcp({
          session,
          userMessage: message,
          provider,
          origin,
          onThinking: (status) => {
            console.log('[AI chat route] thinking', { sessionId: session.sessionId, status })
            push({ type: 'thinking', status })
          },
          onToken: (token) => push({ type: 'token', token })
        })

        saveSession(session)
        await persistSessionToDb(session)
        broadcastAiChatSessionUpdate(session.sessionId, {
          provider,
          messages: toUiMessages(session.messages),
          toolLogs: result.toolLogs || []
        })
        console.log('[AI chat route] completed', {
          sessionId: session.sessionId,
          responseLength: (result.text || '').length,
          toolLogCount: result.toolLogs?.length || 0
        })
        push({
          type: 'done',
          sessionId: session.sessionId,
          message: result.text,
          toolLogs: result.toolLogs
        })
      } catch (error) {
        console.error('[AI chat stream] error', error)
        push({
          type: 'error',
          message: error?.message || 'Failed to process chat request'
        })
      } finally {
        controller.close()
      }
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive'
    }
  })
}

