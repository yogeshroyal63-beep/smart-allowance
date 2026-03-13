import express from 'express'
import { evaluatePayment } from '../services/claudeAgent.js'
import { createPrivacyReceipt } from '../services/privacyService.js'

const router = express.Router()

// In-memory transaction log (replace with DB)
const txLog = []

// POST /api/payment/request
// Called by child when making a payment
router.post('/request', async (req, res) => {
  try {
    const { childAlias, merchant, amount, category, notes, limits, allowedCategories } = req.body

    if (!childAlias || !merchant || !amount || !category) {
      return res.status(400).json({ error: 'Missing required fields: childAlias, merchant, amount, category' })
    }

    if (parseFloat(amount) <= 0) {
      return res.status(400).json({ error: 'Amount must be positive' })
    }

    // AI Agent evaluates payment
    const decision = await evaluatePayment({
      childAlias, merchant, amount, category, notes,
      limits, allowedCategories
    })

    // Create transaction record
    const tx = {
      id: `tx_${Date.now()}`,
      alias: childAlias,
      merchant,
      amount,
      category,
      approved: decision.approved,
      reason: decision.reason,
      timestamp: Date.now(),
      txHash: decision.approved ? `0x${Math.random().toString(16).slice(2, 66)}` : null
    }
    txLog.unshift(tx)

    // Build response
    const receipt = decision.approved
      ? createPrivacyReceipt({ alias: childAlias, amount, merchant, category, txHash: tx.txHash })
      : null

    res.json({
      approved: decision.approved,
      reason: decision.reason,
      aiAnalysis: decision.aiAnalysis,
      confidence: decision.confidence,
      txHash: tx.txHash,
      txId: tx.id,
      receipt,
      privacyNote: `Merchant only sees: ${childAlias}`,
      timestamp: tx.timestamp
    })
  } catch (err) {
    console.error('Payment request error:', err)
    res.status(500).json({ error: 'Payment processing failed', details: err.message })
  }
})

// GET /api/payment/history/:alias
router.get('/history/:alias', (req, res) => {
  const { alias } = req.params
  const history = txLog.filter(tx => tx.alias === alias).slice(0, 50)
  res.json({ history })
})

// GET /api/payment/all - parent view
router.get('/all', (req, res) => {
  res.json({ transactions: txLog.slice(0, 100) })
})

export default router
