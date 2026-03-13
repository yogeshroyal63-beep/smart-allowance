import React, { useState } from 'react'
import { X, Settings } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import toast from 'react-hot-toast'

const CATEGORIES = ['food', 'education', 'entertainment', 'clothing', 'gaming']
const CATEGORY_ICONS = { food: '🍔', education: '📚', entertainment: '🎬', clothing: '👕', gaming: '🎮' }

export default function EditChildModal({ child, onClose }) {
  const { setChildren, children } = useApp()
  const [form, setForm] = useState({
    weeklyLimit: child.weeklyLimit,
    monthlyLimit: child.monthlyLimit,
    categories: { ...child.categories }
  })
  const [loading, setLoading] = useState(false)

  const toggle = (cat) => setForm(f => ({ ...f, categories: { ...f.categories, [cat]: !f.categories[cat] } }))

  const handleSave = async () => {
    setLoading(true)
    try {
      setChildren(children.map(c => c.id === child.id ? { ...c, ...form } : c))
      toast.success('Settings updated on-chain')
      onClose()
    } catch (err) {
      toast.error('Update failed')
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
      <div className="card" style={{ width: 440, padding: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Settings size={20} color="var(--accent)" />
            <h2 style={{ fontSize: 18, fontWeight: 600 }}>Edit {child.name}</h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ padding: 14, background: 'var(--bg-primary)', borderRadius: 8, border: '1px solid var(--border)' }}>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Privacy Alias</p>
            <p className="mono" style={{ color: 'var(--accent)', fontWeight: 600 }}>{child.alias}</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label>Weekly Limit (ETH)</label>
              <input type="number" step="0.001" value={form.weeklyLimit} onChange={e => setForm(f => ({ ...f, weeklyLimit: e.target.value }))} />
            </div>
            <div>
              <label>Monthly Limit (ETH)</label>
              <input type="number" step="0.001" value={form.monthlyLimit} onChange={e => setForm(f => ({ ...f, monthlyLimit: e.target.value }))} />
            </div>
          </div>

          <div>
            <label style={{ marginBottom: 10, display: 'block' }}>Spending Categories</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => toggle(cat)} style={{
                  padding: '8px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500,
                  cursor: 'pointer', transition: 'all 0.15s',
                  background: form.categories[cat] ? 'rgba(20,184,166,0.15)' : 'var(--bg-primary)',
                  border: `1px solid ${form.categories[cat] ? 'rgba(20,184,166,0.4)' : 'var(--border)'}`,
                  color: form.categories[cat] ? 'var(--accent)' : 'var(--text-muted)',
                  display: 'flex', alignItems: 'center', gap: 6
                }}>
                  {CATEGORY_ICONS[cat]} {cat}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button className="btn-secondary" onClick={onClose} style={{ flex: 1 }}>Cancel</button>
            <button className="btn-primary" onClick={handleSave} disabled={loading} style={{ flex: 2 }}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
