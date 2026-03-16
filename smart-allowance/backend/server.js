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

// --- CORS setup that allows localhost + any *.vercel.app ---
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true) // allow server-to-server / curl

    if (
      origin === 'http://localhost:3000' ||
      origin === process.env.FRONTEND_URL ||
      origin.endsWith('.vercel.app')
    ) {
      return callback(null, true)
    }

    return callback(new Error('Not allowed by CORS'))
  },
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
  credentials: true
}

app.options('*', cors(corsOptions)) // handle preflight
app.use(cors(corsOptions))
// -----------------------------------------------------------

app.use(helmet())
app.use(express.json())

const limiter = rateLimit({ windowMs: 60 * 1000, max: 60 })
app.use('/api/', limiter)

// Routes
app.use('/api/ai', aiRouter)
app.use('/api/agent', aiRouter)
app.use('/api/payment', paymentRouter)
app.use('/api/children', childrenRouter)

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    claude: process.env.SYNTHESIS_API_KEY || process.env.ANTHROPIC_API_KEY ? '✅ configured' : '❌ missing API key',
    contract: process.env.CONTRACT_ADDRESS || '0x0'
  })
})

app.listen(PORT, () => {
  console.log(`🚀 SmartAllowance backend running on port ${PORT}`)
  const key = process.env.SYNTHESIS_API_KEY || process.env.ANTHROPIC_API_KEY
  console.log(`   Claude API: ${key ? '✅ configured' : '❌ missing API key'}`)
  console.log(`   Contract: ${process.env.CONTRACT_ADDRESS || '⚠️  not deployed yet'}`)
  console.log(`   Chain RPC: ${process.env.RPC_URL || '⚠️  using default'}`)
})