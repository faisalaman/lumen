import { Router } from 'express'

/**
 * GET /api/health
 *
 * Returns provider availability flags so the frontend can show an
 * "online" indicator next to the active model.
 *
 *   {
 *     ok: true,
 *     providers: {
 *       openai:    boolean,  // OPENAI_API_KEY set
 *       anthropic: boolean,  // ANTHROPIC_API_KEY set
 *       google:    boolean,  // GOOGLE_API_KEY set
 *       llama:     boolean,  // LLAMA_BASE_URL is reachable
 *     }
 *   }
 *
 * The llama check is a 750ms-timed-out HEAD request; non-fatal on any
 * error/timeout.
 */
const router = Router()

router.get('/', async (_req, res) => {
  const providers = {
    openai: Boolean(process.env.OPENAI_API_KEY),
    anthropic: Boolean(process.env.ANTHROPIC_API_KEY),
    google: Boolean(process.env.GOOGLE_API_KEY),
    llama: await checkLlama(),
  }
  res.json({ ok: true, providers })
})

export async function checkLlama(baseUrl = process.env.LLAMA_BASE_URL) {
  if (!baseUrl) return false
  // Try the OpenAI-compatible `/models` endpoint with a short timeout.
  const url = baseUrl.replace(/\/+$/, '') + '/models'
  const controller = new AbortController()
  const t = setTimeout(() => controller.abort(), 750)
  try {
    const r = await fetch(url, { method: 'GET', signal: controller.signal })
    return r.ok
  } catch {
    return false
  } finally {
    clearTimeout(t)
  }
}

export default router
