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

app.use(helmet())
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }))
app.use(express.json())

const limiter = rateLimit({ windowMs: 60 * 1000, max: 60 })
app.use('/api/', limiter)

// Routes
app.use('/api/ai', aiRouter)
app.use('/api/agent', aiRouter)      // AgentChat calls /api/agent/chat
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
