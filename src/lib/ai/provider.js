import OpenAI from 'openai'
import { GoogleGenAI, FunctionCallingConfigMode } from '@google/genai'

const DEFAULT_OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini'
const DEFAULT_GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash'

function toOpenAiTools(tools) {
  return tools.map((t) => ({
    type: 'function',
    function: {
      name: t.name,
      description: t.description,
      parameters: t.inputSchema || { type: 'object', properties: {} }
    }
  }))
}

function toOpenAiMessages(messages) {
  return messages.map((m) => {
    if (m.role === 'tool') {
      return {
        role: 'tool',
        tool_call_id: m.toolCallId,
        content: typeof m.content === 'string' ? m.content : JSON.stringify(m.content || {})
      }
    }
    if (m.role === 'assistant' && m.toolCalls?.length) {
      return {
        role: 'assistant',
        content: m.content || '',
        tool_calls: m.toolCalls.map((tc) => ({
          id: tc.id,
          type: 'function',
          function: {
            name: tc.name,
            arguments: JSON.stringify(tc.arguments || {})
          }
        }))
      }
    }
    return { role: m.role, content: m.content || '' }
  })
}

function toGeminiToolConfig(tools) {
  return [
    {
      functionDeclarations: tools.map((t) => ({
        name: t.name,
        description: t.description,
        parametersJsonSchema: t.inputSchema || { type: 'object', properties: {} }
      }))
    }
  ]
}

function toGeminiContents(messages) {
  return messages.map((m) => {
    if (m.role === 'assistant' && m.toolCalls?.length) {
      return {
        role: 'model',
        parts: m.toolCalls.map((tc) => ({
          functionCall: {
            name: tc.name,
            args: tc.arguments || {}
          }
        }))
      }
    }
    if (m.role === 'tool') {
      let payload = {}
      try {
        payload = typeof m.content === 'string' ? JSON.parse(m.content) : m.content || {}
      } catch {
        payload = { result: m.content }
      }
      return {
        role: 'user',
        parts: [
          {
            functionResponse: {
              name: m.name,
              response: payload
            }
          }
        ]
      }
    }
    return {
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content || '' }]
    }
  })
}

export async function decideAgentStep({ provider, messages, tools }) {
  if (provider === 'gemini') {
    const key = process.env.GEMINI_API_KEY
    if (!key) throw new Error('GEMINI_API_KEY is not configured')
    const ai = new GoogleGenAI({ apiKey: key })
    const result = await ai.models.generateContent({
      model: DEFAULT_GEMINI_MODEL,
      contents: toGeminiContents(messages),
      config: {
        tools: toGeminiToolConfig(tools),
        toolConfig: {
          functionCallingConfig: {
            mode: FunctionCallingConfigMode.AUTO
          }
        }
      }
    })

    const functionCalls = result?.functionCalls || []
    if (functionCalls.length) {
      return {
        type: 'tool_calls',
        assistantMessage: {
          role: 'assistant',
          content: result?.text || '',
          toolCalls: functionCalls.map((fc, idx) => ({
            id: `gemini-${Date.now()}-${idx}`,
            name: fc.name,
            arguments: fc.args || {}
          }))
        }
      }
    }
    return {
      type: 'final',
      text: result?.text || ''
    }
  }

  const key = process.env.OPENAI_API_KEY
  if (!key) throw new Error('OPENAI_API_KEY is not configured')
  const openai = new OpenAI({ apiKey: key })
  const result = await openai.chat.completions.create({
    model: DEFAULT_OPENAI_MODEL,
    temperature: 0.2,
    messages: toOpenAiMessages(messages),
    tools: toOpenAiTools(tools),
    tool_choice: 'auto'
  })

  const message = result.choices?.[0]?.message
  const toolCalls = message?.tool_calls || []
  if (toolCalls.length) {
    return {
      type: 'tool_calls',
      assistantMessage: {
        role: 'assistant',
        content: message?.content || '',
        toolCalls: toolCalls.map((tc) => ({
          id: tc.id,
          name: tc.function.name,
          arguments: (() => {
            try {
              return tc.function.arguments ? JSON.parse(tc.function.arguments) : {}
            } catch {
              return {}
            }
          })()
        }))
      }
    }
  }

  return {
    type: 'final',
    text: message?.content || ''
  }
}

export async function streamFinalAnswer({ provider, messages, onToken }) {
  if (provider === 'gemini') {
    const key = process.env.GEMINI_API_KEY
    if (!key) throw new Error('GEMINI_API_KEY is not configured')
    const ai = new GoogleGenAI({ apiKey: key })
    const stream = await ai.models.generateContentStream({
      model: DEFAULT_GEMINI_MODEL,
      contents: toGeminiContents(messages)
    })

    let full = ''
    for await (const chunk of stream) {
      const text = chunk?.text || ''
      if (!text) continue
      full += text
      onToken?.(text)
    }
    return full
  }

  const key = process.env.OPENAI_API_KEY
  if (!key) throw new Error('OPENAI_API_KEY is not configured')
  const openai = new OpenAI({ apiKey: key })
  const stream = await openai.chat.completions.create({
    model: DEFAULT_OPENAI_MODEL,
    temperature: 0.2,
    stream: true,
    messages: toOpenAiMessages(messages)
  })

  let full = ''
  for await (const event of stream) {
    const token = event.choices?.[0]?.delta?.content || ''
    if (!token) continue
    full += token
    onToken?.(token)
  }
  return full
}

