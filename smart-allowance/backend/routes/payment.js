import express from 'express'
import { ethers } from 'ethers'
import { evaluatePayment } from '../services/claudeAgent.js'
import { createPrivacyReceipt } from '../services/privacyService.js'
import dotenv from 'dotenv'
dotenv.config()

const router = express.Router()

// ── Contract setup ──────────────────────────────────────────────────────────
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS
const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY
const RPC_URL = process.env.RPC_URL || 'https://sepolia.base.org'

const ABI = [
  'function processPayment(address childWallet, address payable merchant, uint256 amount, string category, string merchantName, bool approved) external',
  'function addChild(address childWallet, string aliasName, uint256 weeklyLimit, uint256 monthlyLimit) external',
  'function fundChild(address childWallet) external payable',
  'function updateLimits(address childWallet, uint256 weeklyLimit, uint256 monthlyLimit) external',
  'function setCategory(address childWallet, string category, bool allowed) external',
  'function getChild(address childWallet) external view returns (tuple(address wallet, string aliasName, uint256 balance, uint256 weeklyLimit, uint256 monthlyLimit, uint256 weeklySpent, uint256 monthlySpent, uint256 weekStart, uint256 monthStart, bool active, address parent))',
  'function getParentChildren(address parent) external view returns (address[])',
  'function getSpendingStats(address childWallet) external view returns (uint256 weeklySpent, uint256 monthlySpent, uint256 weeklyLimit, uint256 monthlyLimit, uint256 balance)',
  'function isCategoryAllowed(address childWallet, string category) external view returns (bool)',
  'function resolveAlias(string aliasName) external view returns (address)',
  'event PaymentProcessed(address indexed child, address indexed merchant, uint256 amount, string category, bool approved)',
]

function getContract(useSigner = false) {
  const provider = new ethers.JsonRpcProvider(RPC_URL)
  if (useSigner && DEPLOYER_PRIVATE_KEY) {
    const wallet = new ethers.Wallet(DEPLOYER_PRIVATE_KEY, provider)
    return new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet)
  }
  return new ethers.Contract(CONTRACT_ADDRESS, ABI, provider)
}

// In-memory transaction log (mirrors on-chain for fast reads)
const txLog = []

// ── POST /api/payment/request ────────────────────────────────────────────────
router.post('/request', async (req, res) => {
  try {
    const { childAlias, merchant, amount, category, notes, limits, allowedCategories, childWallet } = req.body

    if (!childAlias || !merchant || !amount || !category) {
      return res.status(400).json({ error: 'Missing required fields: childAlias, merchant, amount, category' })
    }
    if (parseFloat(amount) <= 0) {
      return res.status(400).json({ error: 'Amount must be positive' })
    }

    // 1. AI Agent evaluates
    const decision = await evaluatePayment({
      childAlias, merchant, amount, category, notes,
      limits, allowedCategories
    })

    let txHash = null
    let onChain = false
    let contractError = null

    // 2. If approved and we have a real child wallet + contract — call on-chain
    if (decision.approved && childWallet && CONTRACT_ADDRESS && DEPLOYER_PRIVATE_KEY) {
      try {
        const contract = getContract(true)
        // Use dead address as merchant placeholder (real merchant lookup can be added)
        const merchantWallet = '0x000000000000000000000000000000000000dEaD'
        const amountWei = ethers.parseEther(String(amount))

        const tx = await contract.processPayment(
          childWallet,
          merchantWallet,
          amountWei,
          category,
          merchant,
          true
        )
        const receipt = await tx.wait()
        txHash = receipt.hash
        onChain = true
        console.log(`✅ On-chain payment: ${txHash}`)
      } catch (err) {
        console.error('Contract processPayment failed:', err.reason || err.message)
        contractError = err.reason || 'Contract call failed — check child is registered and has balance'
        // Still return AI decision, just flag the contract error
      }
    }

    // 3. Fall back to mock hash for demo mode
    if (!txHash && decision.approved) {
      txHash = `0x${Math.random().toString(16).slice(2).padEnd(64, '0')}`
    }

    // 4. Log transaction
    const tx = {
      id: `tx_${Date.now()}`,
      alias: childAlias,
      merchant,
      amount,
      category,
      approved: decision.approved,
      reason: decision.reason,
      timestamp: Date.now(),
      txHash: decision.approved ? txHash : null,
      onChain,
    }
    txLog.unshift(tx)

    const receipt = decision.approved
      ? createPrivacyReceipt({ alias: childAlias, amount, merchant, category, txHash })
      : null

    res.json({
      approved: decision.approved,
      reason: decision.reason,
      aiAnalysis: decision.aiAnalysis,
      confidence: decision.confidence,
      txHash: tx.txHash,
      txId: tx.id,
      receipt,
      onChain,
      contractError,
      privacyNote: `Merchant only sees: ${childAlias}`,
      timestamp: tx.timestamp
    })
  } catch (err) {
    console.error('Payment request error:', err)
    res.status(500).json({ error: 'Payment processing failed', details: err.message })
  }
})

// ── POST /api/payment/add-child (parent registers child on-chain) ─────────────
router.post('/add-child', async (req, res) => {
  try {
    const { childWallet, aliasName, weeklyLimit, monthlyLimit } = req.body
    if (!childWallet || !aliasName || !weeklyLimit || !monthlyLimit) {
      return res.status(400).json({ error: 'Missing: childWallet, aliasName, weeklyLimit, monthlyLimit' })
    }
    if (!CONTRACT_ADDRESS || !DEPLOYER_PRIVATE_KEY) {
      return res.status(503).json({ error: 'Contract not configured on backend' })
    }

    const contract = getContract(true)
    const weeklyWei = ethers.parseEther(String(weeklyLimit))
    const monthlyWei = ethers.parseEther(String(monthlyLimit))

    const tx = await contract.addChild(childWallet, aliasName, weeklyWei, monthlyWei)
    const receipt = await tx.wait()
    console.log(`✅ Child added on-chain: ${receipt.hash}`)

    res.json({ success: true, txHash: receipt.hash, childWallet, aliasName })
  } catch (err) {
    console.error('addChild error:', err.reason || err.message)
    res.status(500).json({ error: err.reason || 'addChild failed', details: err.message })
  }
})

// ── POST /api/payment/fund-child ─────────────────────────────────────────────
router.post('/fund-child', async (req, res) => {
  try {
    const { childWallet, amount } = req.body
    if (!childWallet || !amount) {
      return res.status(400).json({ error: 'Missing: childWallet, amount' })
    }
    if (!CONTRACT_ADDRESS || !DEPLOYER_PRIVATE_KEY) {
      return res.status(503).json({ error: 'Contract not configured on backend' })
    }

    const contract = getContract(true)
    const amountWei = ethers.parseEther(String(amount))

    const tx = await contract.fundChild(childWallet, { value: amountWei })
    const receipt = await tx.wait()
    console.log(`✅ Child funded on-chain: ${receipt.hash}`)

    res.json({ success: true, txHash: receipt.hash, childWallet, amount })
  } catch (err) {
    console.error('fundChild error:', err.reason || err.message)
    res.status(500).json({ error: err.reason || 'fundChild failed', details: err.message })
  }
})

// ── GET /api/payment/child-data/:wallet ──────────────────────────────────────
router.get('/child-data/:wallet', async (req, res) => {
  try {
    const { wallet } = req.params
    if (!CONTRACT_ADDRESS) {
      return res.status(503).json({ error: 'Contract not configured' })
    }

    const contract = getContract(false)
    const child = await contract.getChild(wallet)
    const stats = await contract.getSpendingStats(wallet)

    res.json({
      wallet,
      aliasName: child.aliasName,
      balance: ethers.formatEther(child.balance),
      weeklyLimit: ethers.formatEther(child.weeklyLimit),
      monthlyLimit: ethers.formatEther(child.monthlyLimit),
      weeklySpent: ethers.formatEther(stats.weeklySpent),
      monthlySpent: ethers.formatEther(stats.monthlySpent),
      active: child.active,
      parent: child.parent,
    })
  } catch (err) {
    console.error('getChild error:', err.message)
    res.status(500).json({ error: 'Failed to fetch child data', details: err.message })
  }
})

// ── GET /api/payment/history/:alias ─────────────────────────────────────────
router.get('/history/:alias', (req, res) => {
  const { alias } = req.params
  const history = txLog.filter(tx => tx.alias === alias).slice(0, 50)
  res.json({ history })
})

// ── GET /api/payment/all ─────────────────────────────────────────────────────
router.get('/all', (req, res) => {
  res.json({ transactions: txLog.slice(0, 100) })
})

export default router
