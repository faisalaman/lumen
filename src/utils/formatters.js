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
