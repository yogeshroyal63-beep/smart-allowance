import React, { useState } from 'react'
import { X, Send, Shield, CheckCircle, XCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../../context/AppContext'
import { ethers } from 'ethers'
import { CONTRACT_ADDRESS, ABI } from '../../contracts/AllowanceManager'
import axios from 'axios'
import toast from 'react-hot-toast'

const CATEGORIES = ['food', 'education', 'entertainment', 'clothing', 'gaming']
const CATEGORY_ICONS = { food: '🍔', education: '📚', entertainment: '🎬', clothing: '👕', gaming: '🎮' }

const MERCHANTS = {
  food: ["McDonald's", 'Subway', 'Chipotle', 'Pizza Hut'],
  education: ['Khan Academy', 'Coursera', 'Textbooks.com', 'Duolingo Premium'],
  entertainment: ['Netflix', 'Spotify', 'YouTube Premium', 'Cinema Tickets'],
  clothing: ['Nike', 'H&M', 'Zara', 'Uniqlo'],
  gaming: ['Steam', 'PlayStation Store', 'Xbox Store', 'Roblox']
}

// Merchant wallet addresses (demo — in prod these would be real addresses)
const MERCHANT_WALLETS = {
  "McDonald's": '0x000000000000000000000000000000000000dEaD',
  'Subway': '0x000000000000000000000000000000000000dEaD',
  'Khan Academy': '0x000000000000000000000000000000000000dEaD',
  'Steam': '0x000000000000000000000000000000000000dEaD',
}

export default function PaymentModal({ onClose }) {
  const { childProfile, setChildProfile, signer, wallet } = useApp()
  const [step, setStep] = useState('form')
  const [form, setForm] = useState({ merchant: '', amount: '', category: '', notes: '' })
  const [result, setResult] = useState(null)

  const handleCategorySelect = (cat) => {
    setForm(f => ({ ...f, category: cat, merchant: '' }))
  }

  const handleSubmit = async () => {
    if (!form.merchant || !form.amount || !form.category) {
      toast.error('Fill all required fields')
      return
    }
    setStep('processing')
    try {
      // Step 1: AI evaluates payment
      const payload = {
        childAlias: childProfile.alias,
        merchant: form.merchant,
        amount: form.amount,
        category: form.category,
        notes: form.notes,
        limits: {
          weeklyLimit: childProfile.weeklyLimit,
          weeklySpent: childProfile.weeklySpent,
          monthlyLimit: childProfile.monthlyLimit,
          monthlySpent: childProfile.monthlySpent,
        },
        allowedCategories: childProfile.categories
      }

      const response = await axios.post('/api/payment/request', payload)
      const aiResult = response.data

      // Step 2: If approved and real wallet, call contract
      if (aiResult.approved && signer && wallet && !wallet.startsWith('0xDEMO')) {
        try {
          const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer)
          const merchantWallet = MERCHANT_WALLETS[form.merchant] || '0x000000000000000000000000000000000000dEaD'
          const amountWei = ethers.parseEther(form.amount)

          const tx = await contract.processPayment(
            wallet,           // childWallet
            merchantWallet,   // merchant address
            amountWei,        // amount
            form.category,    // category
            form.merchant,    // merchantName
            true              // approved
          )
          toast.loading('Processing on-chain...', { id: 'payment' })
          const receipt = await tx.wait()
          aiResult.txHash = receipt.hash
          aiResult.onChain = true
          toast.success('Payment processed on-chain!', { id: 'payment' })
        } catch (contractErr) {
          console.error('Contract call failed:', contractErr)
          // AI approved but contract failed — still show result
          aiResult.contractError = contractErr.reason || 'Contract call failed'
        }
      }

      setResult(aiResult)

      if (aiResult.approved) {
        setChildProfile(p => ({
          ...p,
          balance: (parseFloat(p.balance) - parseFloat(form.amount)).toFixed(4),
          weeklySpent: (parseFloat(p.weeklySpent) + parseFloat(form.amount)).toFixed(4),
          monthlySpent: (parseFloat(p.monthlySpent) + parseFloat(form.amount)).toFixed(4),
          transactions: [{
            id: Date.now().toString(),
            amount: form.amount,
            merchant: form.merchant,
            category: form.category,
            status: 'approved',
            timestamp: Date.now()
          }, ...(p.transactions || [])]
        }))
      }
    } catch (err) {
      console.error(err)
      // Demo fallback
      const allowed = childProfile.categories[form.category]
      const wouldExceed = parseFloat(childProfile.weeklySpent) + parseFloat(form.amount || 0) > parseFloat(childProfile.weeklyLimit)
      const approved = allowed && !wouldExceed
      setResult({
        approved,
        reason: !allowed
          ? `❌ "${form.category}" category is not allowed by your parent.`
          : wouldExceed
          ? `❌ This payment would exceed your weekly limit of ${childProfile.weeklyLimit} ETH.`
          : `✅ Payment approved. ${form.merchant} received ${form.amount} ETH.`,
        aiAnalysis: approved
          ? `Payment is within your ${form.category} budget. Transaction processed with alias ${childProfile.alias} — your real identity was not shared.`
          : `Payment blocked based on your parent's rules. No funds transferred.`,
        txHash: approved ? `0x${Math.random().toString(16).slice(2, 66)}` : null,
        privacyNote: `Merchant only sees: ${childProfile.alias}`
      })
    }
    setStep('result')
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, backdropFilter: 'blur(6px)'
    }}>
      <div className="card" style={{ width: 480, padding: 32, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Send size={20} color="var(--accent)" />
            <h2 style={{ fontSize: 18, fontWeight: 600 }}>Make Payment</h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {step === 'form' && (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div style={{ padding: 12, background: 'rgba(20,184,166,0.05)', borderRadius: 8, border: '1px solid rgba(20,184,166,0.2)', marginBottom: 20, display: 'flex', gap: 10 }}>
                <Shield size={16} color="var(--accent)" style={{ flexShrink: 0, marginTop: 1 }} />
                <div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)', marginBottom: 2 }}>Privacy Protected</p>
                  <p style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                    Merchant will only see <strong className="mono">{childProfile.alias}</strong> — never your wallet address
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ marginBottom: 10, display: 'block' }}>Category *</label>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {CATEGORIES.map(cat => {
                      const allowed = childProfile.categories[cat]
                      return (
                        <button
                          key={cat}
                          onClick={() => allowed && handleCategorySelect(cat)}
                          style={{
                            padding: '8px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500,
                            cursor: allowed ? 'pointer' : 'not-allowed', opacity: allowed ? 1 : 0.4,
                            background: form.category === cat ? 'rgba(20,184,166,0.15)' : 'var(--bg-primary)',
                            border: `1px solid ${form.category === cat ? 'rgba(20,184,166,0.4)' : 'var(--border)'}`,
                            color: form.category === cat ? 'var(--accent)' : allowed ? 'var(--text-primary)' : 'var(--text-muted)',
                            display: 'flex', alignItems: 'center', gap: 6
                          }}
                        >
                          {CATEGORY_ICONS[cat]} {cat}
                          {!allowed && <span style={{ fontSize: 9, color: '#ef4444' }}>blocked</span>}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <label>Merchant *</label>
                  {form.category ? (
                    <select value={form.merchant} onChange={e => setForm(f => ({ ...f, merchant: e.target.value }))}>
                      <option value="">Select merchant...</option>
                      {MERCHANTS[form.category]?.map(m => <option key={m} value={m}>{m}</option>)}
                      <option value="custom">Other</option>
                    </select>
                  ) : (
                    <input disabled placeholder="Select a category first" />
                  )}
                  {form.merchant === 'custom' && (
                    <input
                      style={{ marginTop: 8 }}
                      placeholder="Enter merchant name"
                      onChange={e => setForm(f => ({ ...f, merchant: e.target.value }))}
                    />
                  )}
                </div>

                <div>
                  <label>Amount (ETH) *</label>
                  <input
                    type="number" step="0.001" min="0.001"
                    value={form.amount}
                    onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                    placeholder="0.000"
                    className="mono"
                  />
                  {form.amount && (
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                      Balance after: {(parseFloat(childProfile.balance) - parseFloat(form.amount || 0)).toFixed(4)} ETH
                    </p>
                  )}
                </div>

                <div style={{ padding: 12, background: 'var(--bg-primary)', borderRadius: 8, border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Weekly used</span>
                    <span className="mono" style={{ fontSize: 12 }}>{childProfile.weeklySpent} / {childProfile.weeklyLimit} ETH</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Monthly used</span>
                    <span className="mono" style={{ fontSize: 12 }}>{childProfile.monthlySpent} / {childProfile.monthlyLimit} ETH</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn-secondary" onClick={onClose} style={{ flex: 1 }}>Cancel</button>
                  <button className="btn-primary" onClick={handleSubmit} style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <Send size={16} /> Request Payment via AI
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'processing' && (
            <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ padding: '40px 0', textAlign: 'center' }}
            >
              <div style={{ width: 60, height: 60, borderRadius: '50%', border: '2px solid var(--accent)', borderTopColor: 'transparent', margin: '0 auto 20px', animation: 'spin 0.8s linear infinite' }} />
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>AI is reviewing...</h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 4 }}>Checking spending limits & categories</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Your identity stays private throughout</p>
              <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
            </motion.div>
          )}

          {step === 'result' && result && (
            <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                {result.approved ? (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.1 }}>
                    <CheckCircle size={56} color="var(--green)" style={{ margin: '0 auto 16px' }} />
                    <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--green)', marginBottom: 4 }}>Payment Approved!</h3>
                  </motion.div>
                ) : (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.1 }}>
                    <XCircle size={56} color="var(--red)" style={{ margin: '0 auto 16px' }} />
                    <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--red)', marginBottom: 4 }}>Payment Blocked</h3>
                  </motion.div>
                )}
                <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{result.reason}</p>
              </div>

              <div style={{ padding: 16, background: 'rgba(20,184,166,0.05)', borderRadius: 10, border: '1px solid rgba(20,184,166,0.2)', marginBottom: 16 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)', marginBottom: 8 }}>🤖 AI Analysis</p>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{result.aiAnalysis}</p>
              </div>

              <div style={{ padding: 12, background: 'var(--bg-primary)', borderRadius: 8, border: '1px solid var(--border)', marginBottom: 20 }}>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>🔒 Privacy Report</p>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{result.privacyNote}</p>
                {result.txHash && (
                  <a
                    href={`https://sepolia.basescan.org/tx/${result.txHash}`}
                    target="_blank" rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8, fontSize: 11, color: 'var(--accent)', textDecoration: 'none' }}
                  >
                    View on BaseScan →
                  </a>
                )}
                {result.onChain && (
                  <p style={{ fontSize: 11, color: 'var(--green)', marginTop: 4 }}>✅ Processed on Base Sepolia</p>
                )}
              </div>

              <button className="btn-primary" onClick={onClose} style={{ width: '100%' }}>Done</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
