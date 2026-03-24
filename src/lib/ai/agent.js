import { callMcpTool, listMcpTools } from '@/lib/mcp/client'
import { decideAgentStep, streamFinalAnswer } from '@/lib/ai/provider'

const MAX_STEPS = 6

function normalizeToolsForModel(mcpTools) {
  return mcpTools.map((t) => ({
    name: t.name,
    description: t.description || '',
    inputSchema: t.inputSchema || { type: 'object', properties: {} }
  }))
}

export async function runAgentWithMcp({
  session,
  userMessage,
  provider,
  origin,
  onThinking,
  onToken
}) {
  const ctx = { aiSessionId: session.sessionId, origin }
  const mcpTools = await listMcpTools(ctx)
  const tools = normalizeToolsForModel(mcpTools)
  console.log('[AI agent] run started', {
    sessionId: session.sessionId,
    provider,
    toolCount: tools.length
  })

  session.messages.push({ role: 'user', content: userMessage })
  onThinking?.('Analyzing query...')

  let steps = 0
  while (steps < MAX_STEPS) {
    steps += 1
    console.log('[AI agent] step start', { sessionId: session.sessionId, step: steps })
    const step = await decideAgentStep({
      provider,
      messages: session.messages,
      tools
    })

    if (step.type === 'final') {
      const finalText = step.text || ''
      console.log('[AI agent] final answer from planner', {
        sessionId: session.sessionId,
        step: steps,
        responseLength: finalText.length
      })
      session.messages.push({ role: 'assistant', content: finalText })
      return { text: finalText, toolLogs: session.toolLogs }
    }

    const assistantMessage = step.assistantMessage
    session.messages.push(assistantMessage)
    const calls = assistantMessage.toolCalls || []
    if (!calls.length) break

    for (const call of calls) {
      onThinking?.(`Running tool: ${call.name}`)
      const startedAt = Date.now()
      console.log('[AI agent] tool call', {
        sessionId: session.sessionId,
        step: steps,
        tool: call.name,
        arguments: call.arguments || {}
      })
      try {
        const toolResult = await callMcpTool(ctx, {
          name: call.name,
          args: call.arguments || {}
        })
        console.log('[AI agent] tool success', {
          sessionId: session.sessionId,
          step: steps,
          tool: call.name,
          elapsedMs: Date.now() - startedAt
        })
        session.toolLogs.push({
          toolName: call.name,
          arguments: call.arguments || {},
          result: toolResult,
          ok: true,
          startedAt,
          endedAt: Date.now()
        })

        session.messages.push({
          role: 'tool',
          name: call.name,
          toolCallId: call.id,
          content: JSON.stringify(toolResult)
        })
      } catch (error) {
        const payload = { error: error?.message || 'Tool failed' }
        console.error('[AI agent] tool failed', {
          sessionId: session.sessionId,
          step: steps,
          tool: call.name,
          elapsedMs: Date.now() - startedAt,
          error: payload.error
        })
        session.toolLogs.push({
          toolName: call.name,
          arguments: call.arguments || {},
          result: payload,
          ok: false,
          startedAt,
          endedAt: Date.now()
        })
        session.messages.push({
          role: 'tool',
          name: call.name,
          toolCallId: call.id,
          content: JSON.stringify(payload)
        })
      }
    }
  }

  onThinking?.('Generating final response...')
  console.log('[AI agent] streaming final response', { sessionId: session.sessionId })
  const finalText = await streamFinalAnswer({
    provider,
    messages: session.messages,
    onToken
  })

  console.log('[AI agent] streaming completed', {
    sessionId: session.sessionId,
    responseLength: finalText.length
  })
  session.messages.push({ role: 'assistant', content: finalText })
  return { text: finalText, toolLogs: session.toolLogs }
}

