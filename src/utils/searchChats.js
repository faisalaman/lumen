import { textOf } from './content.js'

/**
 * Filter a list of chats by a query string. Case-insensitive substring match
 * against the chat title and the concatenated text of every message.
 * Empty query returns the input unchanged.
 */
export function filterChats(chats, query) {
  const q = (query ?? '').trim().toLowerCase()
  if (!q) return chats
  return chats.filter((chat) => {
    const title = (chat.title ?? '').toLowerCase()
    if (title.includes(q)) return true
    for (const msg of chat.messages ?? []) {
      if (textOf(msg.content).toLowerCase().includes(q)) return true
    }
    return false
  })
}

/**
 * Returns an array of plain strings and `{match: true, text}` objects so
 * the caller can render highlighted spans without needing dangerouslySetInnerHTML.
 *
 * highlight('hello world', 'lo')
 *   → ['hel', {match: true, text: 'lo'}, ' world']
 */
export function highlight(text, query) {
  const t = text ?? ''
  const q = (query ?? '').trim()
  if (!q) return [t]
  const lower = t.toLowerCase()
  const ql = q.toLowerCase()
  const out = []
  let i = 0
  while (i < t.length) {
    const idx = lower.indexOf(ql, i)
    if (idx === -1) {
      out.push(t.slice(i))
      break
    }
    if (idx > i) out.push(t.slice(i, idx))
    out.push({ match: true, text: t.slice(idx, idx + q.length) })
    i = idx + q.length
  }
  return out.filter((seg) => (typeof seg === 'string' ? seg.length > 0 : true))
}
