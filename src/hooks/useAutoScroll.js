import { useEffect, useRef, useState } from 'react'

/**
 * Keeps a scroll container pinned to the bottom while new content streams in,
 * but respects the user if they scroll up to read older messages.
 *
 * @param {any} dep      Value that changes whenever new content arrives
 *                       (e.g., the current message list length or last token).
 * @param {Object} opts
 * @param {number} [opts.threshold=80]  How close to the bottom (in px) we must
 *                                      be before considering the user "pinned".
 */
export function useAutoScroll(dep, { threshold = 80 } = {}) {
  const containerRef = useRef(null)
  const bottomRef = useRef(null)
  const [isPinned, setIsPinned] = useState(true)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    function onScroll() {
      const distance = el.scrollHeight - el.scrollTop - el.clientHeight
      setIsPinned(distance <= threshold)
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [threshold])

  useEffect(() => {
    if (!isPinned) return
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dep, isPinned])

  function scrollToBottom(behavior = 'smooth') {
    setIsPinned(true)
    bottomRef.current?.scrollIntoView({ behavior, block: 'end' })
  }

  return { containerRef, bottomRef, isPinned, scrollToBottom }
}
