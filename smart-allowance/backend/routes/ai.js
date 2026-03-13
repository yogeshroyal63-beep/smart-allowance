import express from 'express'
import { generateInsights, generatePrivacyAlias, agentChat } from '../services/claudeAgent.js'

const router = express.Router()

// POST /api/ai/insights
router.post('/insights', async (req, res) => {
  try {
    const { children, recentTransactions } = req.body
    if (!children || !recentTransactions) {
      return res.status(400).json({ error: 'Missing children or transactions data' })
    }
    const insights = await generateInsights({ children, recentTransactions })
    res.json({ insights })
  } catch (err) {
    console.error('AI insights error:', err)
    res.status(500).json({ error: 'AI analysis failed', details: err.message })
  }
})

// POST /api/ai/generate-alias
router.post('/generate-alias', async (req, res) => {
  try {
    const { childName } = req.body
    if (!childName) return res.status(400).json({ error: 'childName required' })
    const alias = await generatePrivacyAlias({ childName })
    res.json({ alias })
  } catch (err) {
    console.error('Alias gen error:', err)
    res.status(500).json({ error: 'Alias generation failed' })
  }
})

// POST /api/agent/chat  ← Agent chat endpoint (used by AgentChat.jsx)
router.post('/chat', async (req, res) => {
  try {
    const { message, history, role, childContext } = req.body
    if (!message) return res.status(400).json({ error: 'message required' })

    const result = await agentChat({ message, history: history || [], role, childContext })
    res.json(result)
  } catch (err) {
    console.error('Agent chat error:', err)
    res.status(500).json({ error: 'Agent chat failed', details: err.message })
  }
})

export default router
