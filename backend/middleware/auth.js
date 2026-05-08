import jwt from 'jsonwebtoken'

/**
 * Validates the `Authorization: Bearer <token>` header against JWT_SECRET.
 * If JWT_SECRET is not set we treat the API as open (development mode).
 */
export function authMiddleware(req, res, next) {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    req.user = { id: 'anonymous', dev: true }
    return next()
  }

  const header = req.headers.authorization || ''
  const [scheme, token] = header.split(' ')
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Missing or malformed Authorization header' })
  }
  try {
    req.user = jwt.verify(token, secret)
    return next()
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token', detail: err.message })
  }
}
