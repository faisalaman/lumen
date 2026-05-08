import { api, setAuthToken } from './api.js'

export async function login({ email, password }) {
  const { data } = await api.post('/auth/login', { email, password })
  if (data?.token) setAuthToken(data.token)
  return data
}

export async function logout() {
  try {
    await api.post('/auth/logout')
  } finally {
    setAuthToken(null)
  }
}

export async function fetchMe() {
  const { data } = await api.get('/auth/me')
  return data
}
