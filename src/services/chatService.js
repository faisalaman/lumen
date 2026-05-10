import { api, streamFetch } from './api.js'

/**
 * Send a non-streaming chat completion request.
 * @param {{ messages: Array<{role:string,content:string}>, model: string }} payload
 */
export async function sendChat(payload, { signal } = {}) {
  const { data } = await api.post('/chat', payload, { signal })
  return data
}

/**
 * Stream a chat completion. The backend is expected to emit Server-Sent
 * Event-style frames where each line begins with `data: ` and the payload is
 * either a JSON object `{ type: 'token' | 'usage' | 'done' | 'error', ... }`
 * or the literal string `[DONE]`.
 *
 * @param {Object} options
 * @param {Array<{role:string,content:string}>} options.messages
 * @param {string} options.model
 * @param {string} [options.systemPrompt]
 * @param {AbortSignal} [options.signal]
 * @param {(token: string) => void} [options.onToken]
 * @param {(usage: any) => void} [options.onUsage]
 */
export async function streamChatCompletion({
  messages,
  model,
  systemPrompt,
  signal,
  onToken,
  onUsage,
}) {
  const fullMessages = [
    ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
    ...messages,
  ]
  const res = await streamFetch('/chat/stream', {
    body: { messages: fullMessages, model, stream: true },
    signal,
  })

  if (!res.body) throw new Error('Streaming is not supported by this browser.')

  const reader = res.body.getReader()
  const decoder = new TextDecoder('utf-8')
  let buffer = ''

  try {
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })

      // SSE frames are separated by blank lines.
      let boundary
      while ((boundary = buffer.indexOf('\n\n')) !== -1) {
        const frame = buffer.slice(0, boundary).trim()
        buffer = buffer.slice(boundary + 2)
        if (!frame) continue
        for (const line of frame.split('\n')) {
          if (!line.startsWith('data:')) continue
          const data = line.slice(5).trim()
          if (data === '[DONE]') return
          try {
            const parsed = JSON.parse(data)
            if (parsed.type === 'token' && parsed.content) {
              onToken?.(parsed.content)
            } else if (parsed.type === 'usage') {
              onUsage?.(parsed.usage ?? parsed)
            } else if (parsed.type === 'error') {
              throw new Error(parsed.message || 'Stream error')
            }
            // unknown types are ignored to remain forward-compatible
          } catch (err) {
            if (err instanceof SyntaxError) {
              // Treat as raw token chunk
              onToken?.(data)
            } else {
              throw err
            }
          }
        }
      }
    }
  } finally {
    try {
      reader.releaseLock()
    } catch {
      /* noop */
    }
  }
}
