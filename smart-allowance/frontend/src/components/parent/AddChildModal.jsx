import React, { useState } from 'react'
import { X, UserPlus } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import toast from 'react-hot-toast'
import axios from 'axios'

const CATEGORIES = ['food', 'education', 'entertainment', 'clothing', 'gaming']
const CATEGORY_ICONS = { food: '🍔', education: '📚', entertainment: '🎬', clothing: '👕', gaming: '🎮' }

function generateAlias() {
  const words = ['StarGazer', 'CryptoKid', 'NeonWolf', 'PixelHero', 'CosmicFox', 'SkyRider', 'TechNova', 'MoonChild']
  const word = words[Math.floor(Math.random() * words.length)]
  const num = Math.floor(Math.random() * 9000) + 1000
  return `${word}#${num}`
}

export default function AddChildModal({ onClose }) {
  const { setChildren, children, wallet } = useApp()
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
    setLoading(true)
    try {
      // In real app: call smart contract + backend
      // For demo: add to local state
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
        categories: form.categories,
        active: true
      }
      setChildren([...children, newChild])
      toast.success(`${form.name} added with alias ${form.alias}`)
      onClose()
    } catch (err) {
      toast.error('Failed to add child')
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
            <label>Privacy Alias (auto-generated)</label>
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
              {loading ? 'Adding...' : 'Add Child & Deploy Wallet'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
