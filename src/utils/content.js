/**
 * Message content normalizer.
 *
 * Messages may carry content as either:
 *   - a plain string (legacy, text-only)
 *   - an array of typed parts: [{type:'text', text}, {type:'image', mimeType, dataBase64}, ...]
 *
 * This module normalizes between the two so consumers (UI render, request build,
 * provider mapping) can always work with parts.
 */

/**
 * Normalize content to an array of parts. Strings become a single text part.
 * Empty / nullish content becomes an empty array.
 */
export function partsOf(content) {
  if (content == null) return []
  if (typeof content === 'string') {
    return content === '' ? [] : [{ type: 'text', text: content }]
  }
  if (Array.isArray(content)) return content
  return []
}

/**
 * Concatenate every text part into a single string. Images are skipped.
 * Useful for: search indexing, rendering text-only fallback, debug logging.
 */
export function textOf(content) {
  return partsOf(content)
    .filter((p) => p.type === 'text')
    .map((p) => p.text)
    .join('')
}

/**
 * Count image parts. Useful for vision-model gating in the UI.
 */
export function imageCount(content) {
  return partsOf(content).filter((p) => p.type === 'image').length
}
