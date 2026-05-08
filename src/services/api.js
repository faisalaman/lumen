import axios from 'axios'
import { STORAGE_KEYS } from '../utils/constants.js'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

/**
 * Returns the JWT to attach to authenticated requests.
 * In development we read from VITE_AUTH_TOKEN or local storage. In production
 * prefer http-only cookies set by your backend.
 */
export function getAuthToken() {
  return (
    window.localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) ||
    import.meta.env.VITE_AUTH_TOKEN ||
    ''
  )
}

export function setAuthToken(token) {
  if (!token) {
    window.localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
  } else {
    window.localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token)
  }
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = getAuthToken()
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear bad token; let the UI react.
      setAuthToken(null)
    }
    return Promise.reject(normalizeError(error))
  },
)

export function normalizeError(error) {
  if (axios.isCancel(error)) {
    const e = new Error('Request canceled')
    e.name = 'CanceledError'
    return e
  }
  const status = error.response?.status
  const data = error.response?.data
  const message = data?.error || data?.message || error.message || 'Network error'
  const e = new Error(message)
  e.status = status
  e.cause = error
  return e
}

/**
 * Stream raw bytes from `path` using fetch (axios doesn't expose ReadableStream).
 * Returns the Response so callers can iterate via `body.getReader()`.
 */
export async function streamFetch(path, { body, signal, headers } = {}) {
  const token = getAuthToken()
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    signal,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    let errorMessage = `Request failed (${res.status})`
    try {
      const data = await res.json()
      errorMessage = data.error || data.message || errorMessage
    } catch {
      // ignore JSON parse errors
    }
    const err = new Error(errorMessage)
    err.status = res.status
    throw err
  }
  return res
}
