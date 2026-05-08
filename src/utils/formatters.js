const RTF = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })
const DTF = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
})

const UNITS = [
  ['year', 1000 * 60 * 60 * 24 * 365],
  ['month', 1000 * 60 * 60 * 24 * 30],
  ['day', 1000 * 60 * 60 * 24],
  ['hour', 1000 * 60 * 60],
  ['minute', 1000 * 60],
  ['second', 1000],
]

export function formatRelative(timestamp) {
  if (!timestamp) return ''
  const diff = timestamp - Date.now()
  const abs = Math.abs(diff)
  for (const [unit, ms] of UNITS) {
    if (abs >= ms || unit === 'second') {
      return RTF.format(Math.round(diff / ms), unit)
    }
  }
  return ''
}

export function formatDateTime(timestamp) {
  if (!timestamp) return ''
  return DTF.format(new Date(timestamp))
}

export function formatTokens(n) {
  if (n == null) return '—'
  if (n < 1000) return String(n)
  if (n < 10_000) return `${(n / 1000).toFixed(1)}k`
  return `${Math.round(n / 1000)}k`
}

/**
 * Compact relative time: "2m" / "3h" / "4d" / "2w" / "5mo" / "1y"
 * Used in sidebar thread rows where space is tight.
 */
export function formatRelativeShort(timestamp, now = Date.now()) {
  if (!timestamp) return ''
  const diff = Math.max(0, now - timestamp)
  const m = 60 * 1000
  const h = 60 * m
  const d = 24 * h
  if (diff < m) return 'now'
  if (diff < h) return `${Math.floor(diff / m)}m`
  if (diff < d) return `${Math.floor(diff / h)}h`
  if (diff < 7 * d) return `${Math.floor(diff / d)}d`
  if (diff < 30 * d) return `${Math.floor(diff / (7 * d))}w`
  if (diff < 365 * d) return `${Math.floor(diff / (30 * d))}mo`
  return `${Math.floor(diff / (365 * d))}y`
}

/**
 * Group chats into time buckets for sidebar rendering.
 * Each chat must have a numeric `updatedAt`. Returns an ordered array
 * of { label, chats } where chats are in their original (newest-first) order.
 *
 *   Today        — same calendar day as `now`
 *   Yesterday    — calendar day immediately before
 *   Last 7 days  — older than yesterday, within 7 days
 *   Older        — anything older
 */
export function bucketByDate(chats, now = Date.now()) {
  const today = new Date(now)
  today.setHours(0, 0, 0, 0)
  const startOfToday = today.getTime()
  const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000
  const sevenDaysAgo = startOfToday - 7 * 24 * 60 * 60 * 1000

  const buckets = {
    today: [],
    yesterday: [],
    week: [],
    older: [],
  }

  for (const chat of chats) {
    const ts = chat.updatedAt ?? 0
    if (ts >= startOfToday) buckets.today.push(chat)
    else if (ts >= startOfYesterday) buckets.yesterday.push(chat)
    else if (ts >= sevenDaysAgo) buckets.week.push(chat)
    else buckets.older.push(chat)
  }

  const out = []
  if (buckets.today.length) out.push({ label: 'Today', chats: buckets.today })
  if (buckets.yesterday.length) out.push({ label: 'Yesterday', chats: buckets.yesterday })
  if (buckets.week.length) out.push({ label: 'Last 7 days', chats: buckets.week })
  if (buckets.older.length) out.push({ label: 'Older', chats: buckets.older })
  return out
}
