import { useCallback, useEffect, useState } from 'react'

/**
 * SSR-safe local storage hook with cross-tab sync.
 */
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    if (typeof window === 'undefined') return initialValue
    try {
      const raw = window.localStorage.getItem(key)
      return raw != null ? JSON.parse(raw) : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (err) {
      console.warn(`useLocalStorage: failed to persist key "${key}"`, err)
    }
  }, [key, value])

  useEffect(() => {
    function onStorage(e) {
      if (e.key !== key) return
      try {
        setValue(e.newValue != null ? JSON.parse(e.newValue) : initialValue)
      } catch {
        /* ignore */
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [key, initialValue])

  const remove = useCallback(() => {
    window.localStorage.removeItem(key)
    setValue(initialValue)
  }, [key, initialValue])

  return [value, setValue, remove]
}
