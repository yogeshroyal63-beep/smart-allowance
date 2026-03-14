import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Send } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import PaymentModal from '../payment/PaymentModal'
import AgentChat from '../agent/AgentChat'

const CATEGORY_ICONS = {
  food: '🍔', education: '📚', entertainment: '🎬', clothing: '👕', gaming: '🎮'
}

const tabs = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'agent', label: '🤖 Agent' },
]

export default function ChildDashboard() {
  const { childProfile } = useApp()
  const [showAlias, setShowAlias] = useState(true)
  const [showPayment, setShowPayment] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')

  if (!childProfile) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)' }}>No profile found. Ask your parent to set up your account.</p>
        </div>
      </div>
    )
  }

  const weeklyPct = Math.min(100, (parseFloat(childProfile.weeklySpent) / parseFloat(childProfile.weeklyLimit)) * 100)
  const monthlyPct = Math.min(100, (parseFloat(childProfile.monthlySpent) / parseFloat(childProfile.monthlyLimit)) * 100)

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid var(--border)' }}>
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                padding: '10px 20px', fontSize: 14, fontWeight: 600,
                background: 'none', border: 'none', cursor: 'pointer',
                color: activeTab === t.id ? 'var(--accent)' : 'var(--text-muted)',
                borderBottom: activeTab === t.id ? '2px solid var(--accent)' : '2px solid transparent',
                marginBottom: -1, transition: 'all 0.2s'
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab: Dashboard */}
        {activeTab === 'dashboard' && (
          <>
            {/* Identity card */}
            <div className="card glow" style={{ padding: 28, marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
              <div style={{
                position: 'absolute', top: 0, right: 0, width: 200, height: 200,
                background: 'radial-gradient(circle, rgba(20,184,166,0.08) 0%, transparent 70%)',
                pointerEvents: 'none'
              }} />
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Your Private Alias</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                    <span className="mono" style={{ fontSize: 22, fontWeight: 600, color: 'var(--accent)' }}>
                      {showAlias ? childProfile.alias : '••••••••••••'}
                    </span>
                    <button onClick={() => setShowAlias(!showAlias)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                      {showAlias ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    🔒 Merchants only see your alias — your real identity stays private
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Balance</p>
                  <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)' }}>
                    {childProfile.balance} <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>ETH</span>
                  </div>
                </div>
              </div>
              <button
                className="btn-primary"
                onClick={() => setShowPayment(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 20 }}
              >
                <Send size={16} />
                Make a Payment
              </button>
            </div>

            {/* Spending limits */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
              <div className="card" style={{ padding: 20 }}>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>Weekly Limit</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span className="mono" style={{ fontSize: 14 }}>{childProfile.weeklySpent} ETH spent</span>
                  <span className="mono" style={{ fontSize: 14, color: 'var(--text-muted)' }}>{childProfile.weeklyLimit} ETH</span>
                </div>
                <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${weeklyPct}%` }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    style={{ height: '100%', borderRadius: 3, background: weeklyPct > 80 ? 'var(--red)' : weeklyPct > 60 ? 'var(--yellow)' : 'var(--accent)' }}
                  />
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>{weeklyPct.toFixed(0)}% used</p>
              </div>
              <div className="card" style={{ padding: 20 }}>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>Monthly Limit</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span className="mono" style={{ fontSize: 14 }}>{childProfile.monthlySpent} ETH spent</span>
                  <span className="mono" style={{ fontSize: 14, color: 'var(--text-muted)' }}>{childProfile.monthlyLimit} ETH</span>
                </div>
                <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${monthlyPct}%` }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    style={{ height: '100%', borderRadius: 3, background: monthlyPct > 80 ? 'var(--red)' : monthlyPct > 60 ? 'var(--yellow)' : 'var(--accent)' }}
                  />
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>{monthlyPct.toFixed(0)}% used</p>
              </div>
            </div>

            {/* Allowed categories */}
            <div className="card" style={{ padding: 20, marginBottom: 24 }}>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14 }}>Allowed Categories</p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {Object.entries(childProfile.categories).map(([cat, allowed]) => (
                  <div key={cat} style={{
                    padding: '8px 14px', borderRadius: 8, fontSize: 14, fontWeight: 500,
                    background: allowed ? 'rgba(20,184,166,0.1)' : 'rgba(239,68,68,0.05)',
                    border: `1px solid ${allowed ? 'rgba(20,184,166,0.3)' : 'rgba(239,68,68,0.15)'}`,
                    color: allowed ? 'var(--accent)' : 'var(--text-muted)',
                    display: 'flex', alignItems: 'center', gap: 6
                  }}>
                    <span>{CATEGORY_ICONS[cat]}</span>
                    <span style={{ textTransform: 'capitalize' }}>{cat}</span>
                    {!allowed && <span style={{ fontSize: 10, color: '#f87171' }}>blocked</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Recent transactions */}
            <div className="card" style={{ padding: 20 }}>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14 }}>Recent Transactions</p>
              {childProfile.transactions.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: 20 }}>No transactions yet</p>
              ) : (
                childProfile.transactions.map(tx => (
                  <div key={tx.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 0', borderBottom: '1px solid var(--border)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 20 }}>{CATEGORY_ICONS[tx.category]}</span>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 500 }}>{tx.merchant}</p>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          {new Date(tx.timestamp).toLocaleDateString()} · {tx.category}
                        </p>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p className="mono" style={{ fontSize: 14, fontWeight: 600 }}>-{tx.amount} ETH</p>
                      <span className={`badge ${tx.status === 'approved' ? 'badge-green' : 'badge-red'}`} style={{ fontSize: 11 }}>
                        {tx.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* Tab: Agent */}
        {activeTab === 'agent' && (
          <AgentChat />
        )}

      </motion.div>

      {showPayment && <PaymentModal onClose={() => setShowPayment(false)} />}
    </div>
  )
}
