import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Wallet, Settings, TrendingUp, Eye } from 'lucide-react'
import EditChildModal from './EditChildModal'

const CATEGORY_ICONS = {
  food: '🍔', education: '📚', entertainment: '🎬', clothing: '👕', gaming: '🎮'
}

export default function ChildCard({ child, onFund }) {
  const [showEdit, setShowEdit] = useState(false)

  const spentPct = Math.min(100, (parseFloat(child.spent) / parseFloat(child.weeklyLimit)) * 100)
  const balancePct = Math.min(100, (parseFloat(child.balance) / parseFloat(child.weeklyLimit)) * 100)

  return (
    <>
      <motion.div
        className="card"
        style={{ padding: 24 }}
        whileHover={{ scale: 1.005 }}
        transition={{ duration: 0.15 }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'linear-gradient(135deg, var(--accent-glow), rgba(167,139,250,0.1))',
              border: '1px solid rgba(20,184,166,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20
            }}>
              {child.name[0]}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ fontWeight: 600, fontSize: 16 }}>{child.name}</h3>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>age {child.age}</span>
              </div>
              <p className="mono" style={{ fontSize: 12, color: 'var(--accent)', marginTop: 2 }}>{child.alias}</p>
              <p className="mono" style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                {child.walletAddress.slice(0, 10)}...{child.walletAddress.slice(-8)}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="btn-secondary"
              onClick={() => setShowEdit(true)}
              style={{ padding: '6px 12px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <Settings size={13} /> Edit
            </button>
            <button
              className="btn-primary"
              onClick={onFund}
              style={{ padding: '6px 12px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <Wallet size={13} /> Fund
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
          <div>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Balance</p>
            <p className="mono" style={{ fontSize: 15, fontWeight: 600, color: 'var(--accent)' }}>{child.balance} ETH</p>
          </div>
          <div>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Weekly Limit</p>
            <p className="mono" style={{ fontSize: 15, fontWeight: 600 }}>{child.weeklyLimit} ETH</p>
          </div>
          <div>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>This Week Spent</p>
            <p className="mono" style={{ fontSize: 15, fontWeight: 600, color: spentPct > 80 ? 'var(--red)' : 'var(--text-primary)' }}>
              {child.spent} ETH
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Weekly spending</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{spentPct.toFixed(0)}%</span>
          </div>
          <div style={{ height: 5, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${spentPct}%` }}
              transition={{ duration: 0.8 }}
              style={{
                height: '100%', borderRadius: 3,
                background: spentPct > 80 ? 'var(--red)' : spentPct > 60 ? 'var(--yellow)' : 'var(--accent)'
              }}
            />
          </div>
        </div>

        {/* Categories */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {Object.entries(child.categories).map(([cat, allowed]) => (
            <span key={cat} style={{
              padding: '3px 9px', borderRadius: 100, fontSize: 11, fontWeight: 500,
              background: allowed ? 'rgba(20,184,166,0.08)' : 'rgba(239,68,68,0.05)',
              border: `1px solid ${allowed ? 'rgba(20,184,166,0.2)' : 'rgba(239,68,68,0.1)'}`,
              color: allowed ? 'var(--accent)' : '#6b7280',
              display: 'flex', alignItems: 'center', gap: 3
            }}>
              {CATEGORY_ICONS[cat]} {cat}
              {!allowed && <span style={{ color: '#ef4444', marginLeft: 2 }}>✕</span>}
            </span>
          ))}
        </div>
      </motion.div>

      {showEdit && <EditChildModal child={child} onClose={() => setShowEdit(false)} />}
    </>
  )
}
