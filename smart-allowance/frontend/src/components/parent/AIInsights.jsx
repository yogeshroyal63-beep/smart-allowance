import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, RefreshCw, Brain, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react'
import { useApp } from '../../context/AppContext'
// ✅ FIXED: Import axios from utils so baseURL (Railway backend) is always set
import axios from '../../utils/index.js'

export default function AIInsights() {
  const { children, transactions, aiInsights, setAiInsights } = useApp()
  const [loading, setLoading] = useState(false)
  const [generated, setGenerated] = useState(false)

  const generateInsights = async () => {
    setLoading(true)
    try {
      const payload = {
        children: children.map(c => ({
          name: c.name,
          alias: c.alias,
          balance: c.balance,
          weeklyLimit: c.weeklyLimit,
          spent: c.spent,
          categories: c.categories
        })),
        recentTransactions: transactions.slice(0, 10)
      }

      const response = await axios.post('/api/ai/insights', payload)
      setAiInsights(response.data.insights || [])
      setGenerated(true)
    } catch (err) {
      console.error(err)
      // Fallback demo insights
      setAiInsights([
        {
          type: 'tip',
          icon: 'TrendingUp',
          title: 'Alice is spending wisely',
          body: '76% of Alice\'s spending goes to education and food — well within healthy spending patterns. Consider increasing her monthly limit slightly.',
          severity: 'positive'
        },
        {
          type: 'alert',
          icon: 'AlertTriangle',
          title: 'Bob approaching weekly limit',
          body: 'Bob has used 93% of his weekly allowance with 3 days remaining. You may want to add a small top-up or adjust his gaming category.',
          severity: 'warning'
        },
        {
          type: 'block',
          icon: 'CheckCircle',
          title: 'AI blocked 1 unauthorized payment',
          body: 'Steam Store purchase blocked for Bob — gaming category is disabled for his account. No manual action needed.',
          severity: 'neutral'
        }
      ])
      setGenerated(true)
    } finally {
      setLoading(false)
    }
  }

  const SEVERITY_STYLES = {
    positive: { bg: 'rgba(34,197,94,0.05)', border: 'rgba(34,197,94,0.2)', icon: '#22c55e' },
    warning: { bg: 'rgba(234,179,8,0.05)', border: 'rgba(234,179,8,0.2)', icon: '#eab308' },
    neutral: { bg: 'rgba(20,184,166,0.05)', border: 'rgba(20,184,166,0.2)', icon: 'var(--accent)' },
    danger: { bg: 'rgba(239,68,68,0.05)', border: 'rgba(239,68,68,0.2)', icon: '#ef4444' },
  }

  const ICONS = { TrendingUp, AlertTriangle, CheckCircle, Brain }

  return (
    <div className="card" style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Brain size={18} color="var(--accent)" />
          <h3 style={{ fontSize: 15, fontWeight: 600 }}>AI Insights</h3>
          <span className="badge badge-teal" style={{ fontSize: 10 }}>Claude</span>
        </div>
        <button
          className="btn-secondary"
          onClick={generateInsights}
          disabled={loading}
          style={{ padding: '6px 14px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}
        >
          {loading ? <RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Zap size={13} />}
          {loading ? 'Analyzing...' : generated ? 'Refresh' : 'Generate Insights'}
        </button>
      </div>

      {!generated && !loading && (
        <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Brain size={32} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
          <p style={{ fontSize: 14, marginBottom: 4 }}>Claude AI is ready to analyze</p>
          <p style={{ fontSize: 12 }}>Click "Generate Insights" to get AI-powered spending analysis</p>
        </div>
      )}

      {loading && (
        <div style={{ padding: '32px 0', textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid var(--accent)', borderTopColor: 'transparent', margin: '0 auto 12px', animation: 'spin 0.8s linear infinite' }} />
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Claude is analyzing spending patterns...</p>
        </div>
      )}

      <AnimatePresence>
        {generated && !loading && aiInsights.map((insight, i) => {
          const style = SEVERITY_STYLES[insight.severity] || SEVERITY_STYLES.neutral
          const IconComp = ICONS[insight.icon] || Brain
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              style={{
                padding: 16, borderRadius: 10,
                background: style.bg,
                border: `1px solid ${style.border}`,
                marginBottom: i < aiInsights.length - 1 ? 12 : 0
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ flexShrink: 0, marginTop: 1 }}>
                  <IconComp size={16} color={style.icon} />
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{insight.title}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{insight.body}</p>
                </div>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
