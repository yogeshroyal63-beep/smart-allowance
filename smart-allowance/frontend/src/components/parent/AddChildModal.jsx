import React, { useState } from 'react'
import { X, UserPlus } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { ethers } from 'ethers'
import { CONTRACT_ADDRESS, ABI } from '../../contracts/AllowanceManager'
import toast from 'react-hot-toast'

const CATEGORIES = ['food', 'education', 'entertainment', 'clothing', 'gaming']
const CATEGORY_ICONS = { food: '🍔', education: '📚', entertainment: '🎬', clothing: '👕', gaming: '🎮' }

function generateAlias() {
  const words = ['StarGazer', 'CryptoKid', 'NeonWolf', 'PixelHero', 'CosmicFox', 'SkyRider', 'TechNova', 'MoonChild']
  const word = words[Math.floor(Math.random() * words.length)]
  const num = Math.floor(Math.random() * 9000) + 1000
  return `${word}#${num}`
}

export default function AddChildModal({ onClose }) {
  const { setChildren, children, signer, wallet } = useApp()
  const [form, setForm] = useState({
    name: '',
    age: '',
    walletAddress: '',
    alias: generateAlias(),
    weeklyLimit: '',
    monthlyLimit: '',
    categories: { food: true, education: true, entertainment: false, clothing: true, gaming: false }
  })
  const [loading, setLoading] = useState(false)

  const toggle = (cat) => {
    setForm(f => ({ ...f, categories: { ...f.categories, [cat]: !f.categories[cat] } }))
  }

  const handleSubmit = async () => {
    if (!form.name || !form.walletAddress || !form.weeklyLimit || !form.monthlyLimit) {
      toast.error('Fill all required fields')
      return
    }
    if (!ethers.isAddress(form.walletAddress.toLowerCase())) {
      toast.error('Invalid wallet address')
      return
    }

    setLoading(true)
    try {
      if (signer && wallet && !wallet.startsWith('0xDEMO')) {
        // Real contract call
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer)
        const weeklyWei = ethers.parseEther(form.weeklyLimit)
        const monthlyWei = ethers.parseEther(form.monthlyLimit)

        toast.loading('Confirm transaction in MetaMask...', { id: 'addchild' })
        const tx = await contract.addChild(form.walletAddress, form.alias, weeklyWei, monthlyWei)
        toast.loading('Waiting for confirmation...', { id: 'addchild' })
        await tx.wait()

        // Set categories on-chain
        for (const [cat, allowed] of Object.entries(form.categories)) {
          const catTx = await contract.setCategory(form.walletAddress, cat, allowed)
          await catTx.wait()
        }

        toast.success(`${form.name} added on-chain!`, { id: 'addchild' })
      } else {
        // Demo mode
        await new Promise(r => setTimeout(r, 800))
        toast.success(`Demo: ${form.name} added with alias ${form.alias}`)
      }

      const newChild = {
        id: Date.now().toString(),
        name: form.name,
        age: parseInt(form.age) || 12,
        walletAddress: form.walletAddress,
        alias: form.alias,
        weeklyLimit: form.weeklyLimit,
        monthlyLimit: form.monthlyLimit,
        balance: '0',
        spent: '0',
        weeklySpent: '0',
        monthlySpent: '0',
        categories: form.categories,
        active: true
      }
      setChildren([...children, newChild])
      onClose()
    } catch (err) {
      console.error(err)
      toast.error(err.reason || err.message?.slice(0, 80) || 'Failed to add child', { id: 'addchild' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, backdropFilter: 'blur(4px)'
    }}>
      <div className="card" style={{ width: 480, padding: 32, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <UserPlus size={20} color="var(--accent)" />
            <h2 style={{ fontSize: 18, fontWeight: 600 }}>Add Child</h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label>Name *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Alice" />
            </div>
            <div>
              <label>Age</label>
              <input type="number" value={form.age} onChange={e => setForm(f => ({ ...f, age: e.target.value }))} placeholder="12" />
            </div>
          </div>

          <div>
            <label>Child Wallet Address *</label>
            <input value={form.walletAddress} onChange={e => setForm(f => ({ ...f, walletAddress: e.target.value }))} placeholder="0x..." className="mono" />
          </div>

          <div>
            <label>Privacy Alias</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input value={form.alias} onChange={e => setForm(f => ({ ...f, alias: e.target.value }))} className="mono" style={{ color: 'var(--accent)' }} />
              <button className="btn-secondary" onClick={() => setForm(f => ({ ...f, alias: generateAlias() }))} style={{ whiteSpace: 'nowrap', padding: '10px 14px', fontSize: 12 }}>
                Regenerate
              </button>
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
              Merchants will only see this alias, not the wallet address
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label>Weekly Limit (ETH) *</label>
              <input type="number" step="0.001" value={form.weeklyLimit} onChange={e => setForm(f => ({ ...f, weeklyLimit: e.target.value }))} placeholder="0.05" />
            </div>
            <div>
              <label>Monthly Limit (ETH) *</label>
              <input type="number" step="0.001" value={form.monthlyLimit} onChange={e => setForm(f => ({ ...f, monthlyLimit: e.target.value }))} placeholder="0.2" />
            </div>
          </div>

          <div>
            <label style={{ marginBottom: 10, display: 'block' }}>Allowed Spending Categories</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => toggle(cat)}
                  style={{
                    padding: '8px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500,
                    cursor: 'pointer', transition: 'all 0.15s',
                    background: form.categories[cat] ? 'rgba(20,184,166,0.15)' : 'var(--bg-primary)',
                    border: `1px solid ${form.categories[cat] ? 'rgba(20,184,166,0.4)' : 'var(--border)'}`,
                    color: form.categories[cat] ? 'var(--accent)' : 'var(--text-muted)',
                    display: 'flex', alignItems: 'center', gap: 6
                  }}
                >
                  {CATEGORY_ICONS[cat]} {cat}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button className="btn-secondary" onClick={onClose} style={{ flex: 1 }}>Cancel</button>
            <button className="btn-primary" onClick={handleSubmit} disabled={loading} style={{ flex: 2 }}>
              {loading ? 'Adding on-chain...' : 'Add Child & Deploy Wallet'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
