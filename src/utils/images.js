export const MAX_IMAGE_BYTES = 5 * 1024 * 1024 // 5 MB per image
export const MAX_IMAGES_PER_MESSAGE = 4

const ALLOWED_MIME = /^image\/(png|jpe?g|gif|webp|heic|heif)$/i

/**
 * Validate a File against size + type constraints.
 * Returns null on success, or a string error message on failure.
 */
export function validateImage(file) {
  if (!file) return 'No file'
  if (!ALLOWED_MIME.test(file.type ?? '')) {
    return `Unsupported image type: ${file.type || 'unknown'}`
  }
  if (file.size > MAX_IMAGE_BYTES) {
    const mb = (file.size / 1024 / 1024).toFixed(1)
    return `Image too large (${mb} MB) — max 5 MB`
  }
  return null
}

/**
 * Read a File as a base64 string (without the `data:<mime>;base64,` prefix).
 * Returns { mimeType, dataBase64 }.
 */
export function readAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = String(reader.result || '')
      const comma = result.indexOf(',')
      if (comma === -1) return reject(new Error('Bad data URL'))
      resolve({ mimeType: file.type, dataBase64: result.slice(comma + 1) })
    }
    reader.onerror = () => reject(reader.error || new Error('Read failed'))
    reader.readAsDataURL(file)
  })
}

/**
 * Convert a Vision Models lookup. For the chosen model id, return whether it
 * supports image inputs. The hardcoded list mirrors §5.2 of the v2 spec.
 */
const VISION_MODEL_IDS = new Set([
  'gpt-4.1',
  'gpt-4.1-mini',
  'claude-sonnet-4-6',
  'claude-opus-4-6',
  'gemini-2.5-pro',
  'gemini-2.5-flash',
])

export function modelSupportsVision(modelId) {
  if (VISION_MODEL_IDS.has(modelId)) return true
  // Heuristic for local llama vision models (e.g. qwen3-vl:30b).
  return /(?:^|[-:\.])vl(?:[-:\.]|$)/i.test(modelId || '')
}
