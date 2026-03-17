import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'

import aiRouter from './routes/ai.js'
import paymentRouter from './routes/payment.js'
import childrenRouter from './routes/children.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// ✅ All allowed origins — stable production + git branch + all preview deploys + local
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://smart-allowance.vercel.app',                                                    // stable production
  'https://smart-allowance-git-master-yogeshroyal63-5495s-projects.vercel.app',            // git branch URL
  process.env.FRONTEND_URL,
].filter(Boolean)

// ✅ FIXED: Define corsOptions ONCE and reuse for both app.use AND app.options
// Old bug: app.options('*', cors()) used blank config = ignored allowedOrigins on preflight
const corsOptions = {
  origin: function (origin, callback) {
    // Allow Postman / curl / server-to-server requests (no origin header)
    if (!origin) return callback(null, true)

    // ✅ Exact match OR any Vercel preview deploy from your project
    const isPreview = /https:\/\/smart-allowance(-[a-z0-9]+)*-yogeshroyal63-5495s-projects\.vercel\.app/.test(origin)

    if (allowedOrigins.includes(origin) || isPreview) {
      return callback(null, true)
    }

    console.warn(`CORS blocked: ${origin}`)
    return callback(new Error(`CORS blocked: ${origin}`))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}

// ✅ CORS first — before helmet and everything else
app.use(cors(corsOptions))

// ✅ FIXED: Preflight uses same corsOptions (not blank cors())
app.options('*', cors(corsOptions))

// ✅ Helmet after cors (helmet placed before cors can strip CORS headers)
app.use(helmet())
app.use(express.json())

// Rate limiter
const limiter = rateLimit({ windowMs: 60 * 1000, max: 60 })
app.use('/api/', limiter)

// Routes
app.use('/api/ai', aiRouter)
app.use('/api/agent', aiRouter)       // AgentChat calls /api/agent/chat
app.use('/api/payment', paymentRouter)
app.use('/api/children', childrenRouter)

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    claude: process.env.SYNTHESIS_API_KEY || process.env.ANTHROPIC_API_KEY
      ? '✅ configured'
      : '❌ missing API key',
    contract: process.env.CONTRACT_ADDRESS || '0x0',
    cors_origins: allowedOrigins,
  })
})

app.listen(PORT, () => {
  console.log(`🚀 SmartAllowance backend running on port ${PORT}`)
  const key = process.env.SYNTHESIS_API_KEY || process.env.ANTHROPIC_API_KEY
  console.log(`   Claude API: ${key ? '✅ configured' : '❌ missing API key'}`)
  console.log(`   CORS allowed: ${allowedOrigins.join(', ')}`)
  console.log(`   Contract: ${process.env.CONTRACT_ADDRESS || '⚠️  not deployed yet'}`)
  console.log(`   Chain RPC: ${process.env.RPC_URL || '⚠️  using default'}`)
})
