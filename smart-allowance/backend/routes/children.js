import express from 'express'
import { ethers } from 'ethers'
import { registerAlias, generateAlias } from '../services/privacyService.js'
import dotenv from 'dotenv'
dotenv.config()

const router = express.Router()

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS
const RPC_URL = process.env.RPC_URL || 'https://sepolia.base.org'

const ABI = [
  'function getChild(address childWallet) external view returns (tuple(address wallet, string aliasName, uint256 balance, uint256 weeklyLimit, uint256 monthlyLimit, uint256 weeklySpent, uint256 monthlySpent, uint256 weekStart, uint256 monthStart, bool active, address parent))',
  'function getParentChildren(address parent) external view returns (address[])',
  'function getSpendingStats(address childWallet) external view returns (uint256 weeklySpent, uint256 monthlySpent, uint256 weeklyLimit, uint256 monthlyLimit, uint256 balance)',
  'function isCategoryAllowed(address childWallet, string category) external view returns (bool)',
]

const CATEGORIES = ['food', 'education', 'entertainment', 'clothing', 'gaming']

function getContract() {
  const provider = new ethers.JsonRpcProvider(RPC_URL)
  return new ethers.Contract(CONTRACT_ADDRESS, ABI, provider)
}

// In-memory child store (used for demo mode + augmenting on-chain data)
const childStore = new Map()

// ── POST /api/children/register ──────────────────────────────────────────────
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

// ── GET /api/children/:parentWallet ──────────────────────────────────────────
// Tries on-chain first, falls back to in-memory
router.get('/:parentWallet', async (req, res) => {
  const { parentWallet } = req.params

  // Try on-chain if contract is configured
  if (CONTRACT_ADDRESS && parentWallet !== '0xDEMO...1234') {
    try {
      const contract = getContract()
      const childAddresses = await contract.getParentChildren(parentWallet)

      if (childAddresses.length > 0) {
        const children = await Promise.all(
          childAddresses.map(async (addr) => {
            try {
              const child = await contract.getChild(addr)
              const stats = await contract.getSpendingStats(addr)

              // Check category allowances in parallel
              const catResults = await Promise.all(
                CATEGORIES.map(cat => contract.isCategoryAllowed(addr, cat))
              )
              const categories = Object.fromEntries(
                CATEGORIES.map((cat, i) => [cat, catResults[i]])
              )

              // Merge with any local name data
              const local = childStore.get(addr.toLowerCase())

              return {
                id: addr,
                name: local?.name || child.aliasName,
                alias: child.aliasName,
                walletAddress: addr,
                parentWallet,
                balance: ethers.formatEther(child.balance),
                weeklyLimit: ethers.formatEther(child.weeklyLimit),
                monthlyLimit: ethers.formatEther(child.monthlyLimit),
                weeklySpent: ethers.formatEther(stats.weeklySpent),
                monthlySpent: ethers.formatEther(stats.monthlySpent),
                spent: ethers.formatEther(stats.weeklySpent),
                categories,
                active: child.active,
                onChain: true,
              }
            } catch {
              return null
            }
          })
        )

        const valid = children.filter(Boolean)
        if (valid.length > 0) {
          return res.json({ children: valid, source: 'onchain' })
        }
      }
    } catch (err) {
      console.warn('On-chain read failed, falling back to memory:', err.message)
    }
  }

  // Fallback: in-memory store
  const children = Array.from(childStore.values())
    .filter(c => c.parentWallet?.toLowerCase() === parentWallet.toLowerCase())
  res.json({ children, source: 'memory' })
})

// ── PATCH /api/children/:walletAddress/limits ────────────────────────────────
router.patch('/:walletAddress/limits', (req, res) => {
  const { walletAddress } = req.params
  const { weeklyLimit, monthlyLimit, categories } = req.body
  const child = childStore.get(walletAddress.toLowerCase())
  if (!child) return res.status(404).json({ error: 'Child not found in local store' })

  if (weeklyLimit) child.weeklyLimit = weeklyLimit
  if (monthlyLimit) child.monthlyLimit = monthlyLimit
  if (categories) child.categories = categories
  childStore.set(walletAddress.toLowerCase(), child)
  res.json({ success: true, child })
})

// ── GET /api/children/profile/:alias ─────────────────────────────────────────
router.get('/profile/:alias', (req, res) => {
  const { alias } = req.params
  const child = Array.from(childStore.values()).find(c => c.alias === alias)
  if (!child) return res.status(404).json({ error: 'Profile not found' })
  const { parentWallet, ...safeProfile } = child
  res.json({ profile: safeProfile })
})

export default router
