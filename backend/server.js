import 'dotenv/config'
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import morgan from 'morgan'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import chatRouter from './routes/chat.js'
import authRouter from './routes/auth.js'
import { authMiddleware } from './middleware/auth.js'

const app = express()
const PORT = Number(process.env.PORT) || 8080
const ORIGINS = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)

app.set('trust proxy', 1)
app.use(helmet({ contentSecurityPolicy: false }))
app.use(cors({ origin: ORIGINS, credentials: true }))
app.use(compression())
app.use(express.json({ limit: '1mb' }))
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))

const limiter = rateLimit({
  windowMs: 60 * 1000,
  limit: Number(process.env.RATE_LIMIT_PER_MIN) || 60,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
})
app.use('/api', limiter)

app.get('/api/health', (_req, res) => res.json({ status: 'ok', uptime: process.uptime() }))

app.use('/api/auth', authRouter)
app.use('/api/chat', authMiddleware, chatRouter)

app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' })
})

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`)
})
