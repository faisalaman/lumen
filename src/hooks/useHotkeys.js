import { useEffect } from 'react'

/**
 * Bind a single hotkey for as long as the component is mounted.
 *
 *   useHotkeys('mod+k', () => setOpen((v) => !v))
 *   useHotkeys('Escape', () => setOpen(false), { when: open })
 *
 *  - 'mod' resolves to Cmd on Mac, Ctrl elsewhere.
 *  - When the matching keypress fires, preventDefault is called.
 *  - Pass {when: false} to disable the binding without unmounting.
 */
export function useHotkeys(combo, handler, { when = true } = {}) {
  useEffect(() => {
    if (!when) return undefined
    const isMac = typeof navigator !== 'undefined' && /Mac/i.test(navigator.platform)
    const parts = combo.toLowerCase().split('+')
    const wantMod = parts.includes('mod') || parts.includes('cmd') || parts.includes('ctrl')
    const wantShift = parts.includes('shift')
    const wantAlt = parts.includes('alt') || parts.includes('option')
    const key = parts[parts.length - 1] // last segment is the actual key

    function onKeyDown(e) {
      const modOk = wantMod ? (isMac ? e.metaKey : e.ctrlKey) : (!e.metaKey && !e.ctrlKey)
      const shiftOk = wantShift ? e.shiftKey : !e.shiftKey
      const altOk = wantAlt ? e.altKey : !e.altKey
      const keyOk = e.key.toLowerCase() === key
      if (modOk && shiftOk && altOk && keyOk) {
        e.preventDefault()
        handler(e)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [combo, handler, when])
}

/**
 * Tiny helper to render a "⌘K" hint string that shows the right modifier
 * label on Mac vs. other platforms.
 */
export function modLabel() {
  if (typeof navigator === 'undefined') return 'Ctrl'
  return /Mac/i.test(navigator.platform) ? '⌘' : 'Ctrl'
}
