import express from 'express'
import { registerAlias, generateAlias } from '../services/privacyService.js'

const router = express.Router()

// In-memory child store (replace with DB or on-chain data)
const childStore = new Map()

// POST /api/children/register
router.post('/register', async (req, res) => {
  try {
    const { name, walletAddress, weeklyLimit, monthlyLimit, categories, parentWallet } = req.body
    if (!name || !walletAddress || !weeklyLimit || !monthlyLimit || !parentWallet) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const alias = generateAlias(name)
    registerAlias(alias, walletAddress, walletAddress)

    const child = {
      id: `child_${Date.now()}`,
      name,
      alias,
      walletAddress,
      parentWallet,
      weeklyLimit,
      monthlyLimit,
      categories: categories || { food: true, education: true, entertainment: false, clothing: true, gaming: false },
      balance: '0',
      spent: '0',
      active: true,
      createdAt: Date.now()
    }

    childStore.set(walletAddress.toLowerCase(), child)
    res.json({ success: true, child })
  } catch (err) {
    console.error('Register child error:', err)
    res.status(500).json({ error: err.message })
  }
})

// GET /api/children/:parentWallet
router.get('/:parentWallet', (req, res) => {
  const { parentWallet } = req.params
  const children = Array.from(childStore.values())
    .filter(c => c.parentWallet?.toLowerCase() === parentWallet.toLowerCase())
  res.json({ children })
})

// PATCH /api/children/:walletAddress/limits
router.patch('/:walletAddress/limits', (req, res) => {
  const { walletAddress } = req.params
  const { weeklyLimit, monthlyLimit, categories } = req.body
  const child = childStore.get(walletAddress.toLowerCase())
  if (!child) return res.status(404).json({ error: 'Child not found' })

  if (weeklyLimit) child.weeklyLimit = weeklyLimit
  if (monthlyLimit) child.monthlyLimit = monthlyLimit
  if (categories) child.categories = categories
  childStore.set(walletAddress.toLowerCase(), child)
  res.json({ success: true, child })
})

// GET /api/children/profile/:alias
router.get('/profile/:alias', (req, res) => {
  const { alias } = req.params
  const child = Array.from(childStore.values()).find(c => c.alias === alias)
  if (!child) return res.status(404).json({ error: 'Profile not found' })
  // Return safe profile (no parent wallet exposed)
  const { parentWallet, ...safeProfile } = child
  res.json({ profile: safeProfile })
})

export default router
