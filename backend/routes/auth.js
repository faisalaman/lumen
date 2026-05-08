import { Router } from 'express'
import jwt from 'jsonwebtoken'

const router = Router()

/**
 * Demonstration-only auth. Replace with your real user store.
 */
router.post('/login', (req, res) => {
  const { email, password } = req.body || {}
  if (!email || !password) return res.status(400).json({ error: 'email and password required' })

  // TODO: Replace with a real user lookup + bcrypt comparison.
  if (password !== 'demo-password') return res.status(401).json({ error: 'Invalid credentials' })

  const secret = process.env.JWT_SECRET
  if (!secret) return res.status(500).json({ error: 'JWT_SECRET not configured' })

  const token = jwt.sign({ sub: email, email }, secret, { expiresIn: '7d' })
  res.json({ token, user: { email } })
})

router.post('/logout', (_req, res) => {
  // Stateless JWT; client just discards the token.
  res.json({ ok: true })
})

router.get('/me', (req, res) => {
  res.json({ user: req.user || null })
})

export default router
