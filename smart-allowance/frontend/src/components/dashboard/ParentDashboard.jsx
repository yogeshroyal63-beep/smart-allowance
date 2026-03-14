import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Users, TrendingUp, Shield, Zap, Plus, RefreshCw, Bot } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import ChildCard from '../parent/ChildCard'
import AddChildModal from '../parent/AddChildModal'
import TransactionFeed from '../parent/TransactionFeed'
import AIInsights from '../parent/AIInsights'
import FundModal from '../parent/FundModal'
import AgentChat from '../agent/AgentChat'

export default function ParentDashboard() {
  const { children, transactions, wallet } = useApp()
  const [showAddChild, setShowAddChild] = useState(false)
  const [showFund, setShowFund] = useState(false)
  const [selectedChild, setSelectedChild] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')

  const totalBalance = children.reduce((s, c) => s + parseFloat(c.balance || 0), 0)
  const totalSpent = children.reduce((s, c) => s + parseFloat(c.spent || 0), 0)
  const blocked = transactions.filter(t => t.status === 'blocked').length

  const stats = [
    { label: 'Total Balance', value: `${totalBalance.toFixed(4)} ETH`, icon: TrendingUp, color: 'var(--accent)' },
    { label: 'Children Managed', value: children.length, icon: Users, color: '#a78bfa' },
    { label: 'This Month Spent', value: `${totalSpent.toFixed(4)} ETH`, icon: Zap, color: '#fb923c' },
    { label: 'Blocked Payments', value: blocked, icon: Shield, color: '#f87171' },
  ]

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'children', label: 'Children' },
    { id: 'agent', label: '🤖 Agent' },
    { id: 'analytics', label: 'Analytics' },
  ]

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Parent Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            Manage allowances and monitor spending across all children
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
            <RefreshCw size={14} /> Refresh
          </button>
          <button className="btn-primary" onClick={() => setShowAddChild(true)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Plus size={16} /> Add Child
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            className="card"
            style={{ padding: 20 }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{s.label}</span>
              <s.icon size={18} color={s.color} />
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              padding: '10px 20px',
              fontSize: 14,
              fontWeight: 600,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: activeTab === t.id ? 'var(--accent)' : 'var(--text-muted)',
              borderBottom: activeTab === t.id ? '2px solid var(--accent)' : '2px solid transparent',
              marginBottom: -1,
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: 'var(--text-secondary)' }}>CHILDREN</h2>
              {children.length === 0 ? (
                <div className="card" style={{ padding: 40, textAlign: 'center' }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>👶</div>
                  <p style={{ color: 'var(--text-secondary)' }}>No children added yet</p>
                  <button className="btn-primary" onClick={() => setShowAddChild(true)} style={{ marginTop: 16 }}>
                    Add First Child
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {children.map(child => (
                    <ChildCard
                      key={child.id}
                      child={child}
                      onFund={() => { setSelectedChild(child); setShowFund(true) }}
                    />
                  ))}
                </div>
              )}
            </div>
            <AIInsights />
          </div>
          <div>
            <TransactionFeed />
          </div>
        </div>
      )}

      {/* Tab: Children */}
      {activeTab === 'children' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {children.length === 0 ? (
            <div className="card" style={{ padding: 40, textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>👶</div>
              <p style={{ color: 'var(--text-secondary)' }}>No children added yet</p>
              <button className="btn-primary" onClick={() => setShowAddChild(true)} style={{ marginTop: 16 }}>
                Add First Child
              </button>
            </div>
          ) : (
            children.map(child => (
              <ChildCard
                key={child.id}
                child={child}
                onFund={() => { setSelectedChild(child); setShowFund(true) }}
              />
            ))
          )}
        </div>
      )}

      {/* Tab: Agent */}
      {activeTab === 'agent' && (
        <div style={{ maxWidth: 700 }}>
          <AgentChat />
        </div>
      )}

      {/* Tab: Analytics */}
      {activeTab === 'analytics' && (
        <div className="card" style={{ padding: 32, textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
          <p style={{ color: 'var(--text-secondary)' }}>Analytics coming soon</p>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 8 }}>
            Full spending charts and trends will be available here
          </p>
        </div>
      )}

      {showAddChild && <AddChildModal onClose={() => setShowAddChild(false)} />}
      {showFund && selectedChild && (
        <FundModal
          child={selectedChild}
          onClose={() => { setShowFund(false); setSelectedChild(null) }}
        />
      )}
    </div>
  )
}
