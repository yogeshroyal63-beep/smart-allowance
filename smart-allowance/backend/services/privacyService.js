// In-memory alias store (replace with DB in production)
const aliasMap = new Map()        // alias -> { walletAddress, childId }
const walletToAlias = new Map()   // walletAddress -> alias

export function registerAlias(alias, walletAddress, childId) {
  aliasMap.set(alias, { walletAddress, childId, createdAt: Date.now() })
  walletToAlias.set(walletAddress.toLowerCase(), alias)
  return { alias, walletAddress, childId }
}

export function resolveAlias(alias) {
  return aliasMap.get(alias) || null
}

export function getAliasByWallet(walletAddress) {
  return walletToAlias.get(walletAddress.toLowerCase()) || null
}

export function generateAlias(childName) {
  const adjectives = ['Cosmic', 'Neon', 'Solar', 'Pixel', 'Star', 'Quantum', 'Echo', 'Cyber', 'Luna', 'Nova']
  const nouns = ['Rider', 'Gazer', 'Fox', 'Wolf', 'Hawk', 'Storm', 'Flash', 'Spark', 'Wave', 'Kid']
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)]
  const noun = nouns[Math.floor(Math.random() * nouns.length)]
  const num = Math.floor(Math.random() * 9000) + 1000
  return `${adj}${noun}#${num}`
}

/**
 * Create a payment receipt that hides real identity
 * Returns what merchant is allowed to see
 */
export function createPrivacyReceipt({ alias, amount, merchant, category, txHash }) {
  return {
    payer: alias,                    // Alias only, no real identity
    amount,
    merchant,
    category,
    txHash,
    timestamp: new Date().toISOString(),
    verificationUrl: txHash ? `https://basescan.org/tx/${txHash}` : null,
    // Explicitly omit: real wallet, name, age, parent info
    privacyNote: 'Payment processed via SmartAllowance privacy layer'
  }
}
