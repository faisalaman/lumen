import { api } from './api.js'
import { MODELS } from '../utils/constants.js'

let cached = null

export async function getHealth() {
  if (cached) return cached
  try {
    const r = await api.get('/health')
    cached = r.data
    return cached
  } catch {
    cached = { ok: false, providers: {} }
    return cached
  }
}

export function providerForModel(modelId) {
  return MODELS.find((m) => m.id === modelId)?.provider ?? null
}
