import { Router } from 'express'
import { z } from 'zod'
import { resolveProvider, callProvider, streamProvider } from '../services/providers.js'

function toHttpError(err) {
  if (err?.name === 'ZodError') {
    const detail = err.issues?.[0]
    const where = detail?.path?.join('.')
    const wrapped = new Error(`Invalid request${where ? ` at "${where}"` : ''}: ${detail?.message ?? 'bad payload'}`)
    wrapped.status = 400
    return wrapped
  }
  return err
}

const router = Router()

const ContentPart = z.union([
  z.object({ type: z.literal('text'), text: z.string() }),
  z.object({
    type: z.literal('image'),
    mimeType: z.string().regex(/^image\//),
    dataBase64: z.string(),
  }),
])

const messageSchema = z.object({
  role: z.enum(['system', 'user', 'assistant']),
  content: z.union([z.string().min(1).max(20000), z.array(ContentPart).min(1)]),
})

const bodySchema = z.object({
  model: z.string().min(1),
  messages: z.array(messageSchema).min(1).max(100),
  temperature: z.number().min(0).max(2).optional(),
  stream: z.boolean().optional(),
})

router.post('/', async (req, res, next) => {
  try {
    const payload = bodySchema.parse(req.body)
    const provider = resolveProvider(payload.model)
    const result = await callProvider(provider, payload)
    res.json(result)
  } catch (err) {
    next(toHttpError(err))
  }
})

/**
 * Streaming endpoint. Frames are emitted as Server-Sent Events:
 *   data: {"type":"token","content":"..."}\n\n
 *   data: {"type":"usage","usage":{...}}\n\n
 *   data: [DONE]\n\n
 */
router.post('/stream', async (req, res, next) => {
  try {
    const payload = bodySchema.parse(req.body)
    const provider = resolveProvider(payload.model)

    res.status(200).set({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    })
    res.flushHeaders?.()

    const send = (obj) => res.write(`data: ${JSON.stringify(obj)}\n\n`)
    const close = () => {
      res.write('data: [DONE]\n\n')
      res.end()
    }

    // If the client disconnects, abort the upstream provider call.
    const abortController = new AbortController()
    req.on('close', () => abortController.abort())

    try {
      await streamProvider(provider, payload, {
        signal: abortController.signal,
        onToken: (content) => send({ type: 'token', content }),
        onUsage: (usage) => send({ type: 'usage', usage }),
      })
      close()
    } catch (err) {
      if (err.name !== 'AbortError') {
        send({ type: 'error', message: err.message || 'stream failed' })
      }
      res.end()
    }
  } catch (err) {
    next(toHttpError(err))
  }
})

export default router


