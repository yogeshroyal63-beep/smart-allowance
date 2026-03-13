import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Activity, ExternalLink, Filter } from 'lucide-react'
import { useApp } from '../../context/AppContext'

const CATEGORY_ICONS = { food: '🍔', education: '📚', entertainment: '🎬', clothing: '👕', gaming: '🎮' }

function timeAgo(ts) {
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function TransactionFeed() {
  const { transactions } = useApp()
  const [filter, setFilter] = useState('all')

  const filtered = transactions.filter(t => filter === 'all' || t.status === filter)

  return (
    <div className="card" style={{ padding: 24, height: 'fit-content', position: 'sticky', top: 88 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Activity size={18} color="var(--accent)" />
          <h3 style={{ fontSize: 15, fontWeight: 600 }}>Live Transactions</h3>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['all', 'approved', 'blocked'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 500,
                cursor: 'pointer', border: 'none',
                background: filter === f ? 'var(--accent)' : 'var(--bg-primary)',
                color: filter === f ? '#0a0f0e' : 'var(--text-muted)'
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
          No transactions yet
        </div>
      ) : (
        <AnimatePresence>
          {filtered.map((tx, i) => (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: i * 0.05 }}
              style={{
                padding: '14px 0',
                borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                    background: tx.status === 'approved' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                    border: `1px solid ${tx.status === 'approved' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16
                  }}>
                    {CATEGORY_ICONS[tx.category] || '💳'}
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>{tx.merchant}</p>
                    <p className="mono" style={{ fontSize: 11, color: 'var(--accent)', marginBottom: 2 }}>{tx.alias}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{timeAgo(tx.timestamp)}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>·</span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{tx.category}</span>
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 12 }}>
                  <p className="mono" style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                    {tx.amount} ETH
                  </p>
                  <span className={`badge ${tx.status === 'approved' ? 'badge-green' : 'badge-red'}`} style={{ fontSize: 10 }}>
                    {tx.status === 'approved' ? '✓ approved' : '✕ blocked'}
                  </span>
                </div>
              </div>

              {tx.txHash && (
                <a
                  href={`https://basescan.org/tx/${tx.txHash}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8, fontSize: 10, color: 'var(--text-muted)', textDecoration: 'none' }}
                >
                  <ExternalLink size={10} /> View on BaseScan
                </a>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      )}
    </div>
  )
}
