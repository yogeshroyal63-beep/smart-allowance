import { ethers } from 'ethers'
import axios from "axios";

axios.defaults.baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default axios;
export const formatAddress = (addr) => {
  if (!addr) return ''
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

export const formatEth = (amount, decimals = 4) => {
  if (amount === undefined || amount === null) return '0'
  return parseFloat(amount).toFixed(decimals)
}

export const formatUSD = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount)
}

export const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const formatRelativeTime = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

export const getSpendingStatus = (spent, limit) => {
  const pct = (spent / limit) * 100
  if (pct >= 90) return 'danger'
  if (pct >= 70) return 'warning'
  return 'safe'
}

export const getSpendingColor = (spent, limit) => {
  const status = getSpendingStatus(spent, limit)
  if (status === 'danger') return '#ff5050'
  if (status === 'warning') return '#ffc700'
  return '#00ff87'
}

export const categoryEmoji = {
  food: '🍔',
  games: '🎮',
  education: '📚',
  transport: '🚌',
  entertainment: '🎬',
  other: '💳',
}

export const generateMockTxHash = () => {
  const chars = '0123456789abcdef'
  let hash = '0x'
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)]
  }
  return hash
}

export const generatePrivacyAlias = (address) => {
  // Generate a privacy alias from address
  const adjectives = ['quiet', 'swift', 'bright', 'calm', 'wise']
  const nouns = ['river', 'cloud', 'stone', 'leaf', 'wave']
  const num = parseInt(address.slice(-4), 16) % 100
  const adj = adjectives[parseInt(address.slice(2, 4), 16) % adjectives.length]
  const noun = nouns[parseInt(address.slice(4, 6), 16) % nouns.length]
  return `${adj}-${noun}-${num}`
}

export const sleep = (ms) => new Promise(r => setTimeout(r, ms))

export const truncate = (str, maxLen = 30) => {
  if (!str || str.length <= maxLen) return str
  return str.slice(0, maxLen) + '...'
}
