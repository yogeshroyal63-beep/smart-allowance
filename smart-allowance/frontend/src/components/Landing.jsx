import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Shield, Zap, Eye, Lock, ChevronRight, Wallet } from 'lucide-react'
import { useApp } from '../context/AppContext'
import toast from 'react-hot-toast'

const features = [
  { icon: Shield, title: 'Parent-Controlled Limits', desc: 'Set weekly/monthly caps and category restrictions enforced on-chain' },
  { icon: Eye, title: 'Privacy-First Identity', desc: 'Kids pay with aliases like StarGazer#4821, real identity stays private' },
  { icon: Zap, title: 'AI Agent Decisions', desc: 'Claude instantly approves or blocks payments based on your rules' },
  { icon: Lock, title: 'On-Chain Transparency', desc: 'All transactions verifiable on Base Mainnet, nothing hidden from parents' },
]

export default function Landing() {
  const navigate = useNavigate()
  const { connectWallet, loadDemoData, loading } = useApp()
  const [connecting, setConnecting] = useState(null)

  const handleConnect = async (role) => {
    setConnecting(role)
    const ok = await connectWallet(role)
    if (ok) navigate(`/${role}`)
    setConnecting(null)
  }

  const handleDemo = (role) => {
    loadDemoData(role)
    navigate(`/${role}`)
    toast.success(`Demo mode: ${role} dashboard`)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Nav */}
      <nav style={{ padding: '20px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={18} color="#0a0f0e" />
          </div>
          <span style={{ fontWeight: 700, fontSize: 18, color: 'var(--text-primary)' }}>SmartAllowance</span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span className="badge badge-teal">Base Mainnet</span>
          <span className="badge badge-green">AI-Powered</span>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '80px 24px 60px', textAlign: 'center' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="badge badge-teal" style={{ marginBottom: 24, display: 'inline-flex' }}>
            🏆 Synthesis Hackathon 2025 — Agents that Pay + Agents that Keep Secrets
          </div>
          <h1 style={{ fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: 700, lineHeight: 1.1, marginBottom: 24 }}>
            Smart Allowances.<br />
            <span style={{ color: 'var(--accent)' }}>Private Payments.</span>
          </h1>
          <p style={{ fontSize: 18, color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto 48px', lineHeight: 1.6 }}>
            AI agent manages your kids' spending with on-chain limits. Children pay merchants using anonymous aliases — privacy-first, parent-controlled.
          </p>
        </motion.div>

        {/* Role selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, maxWidth: 680, margin: '0 auto' }}
        >
          {/* Parent card */}
          <div className="card" style={{ padding: 32, textAlign: 'left' }}>
            <div style={{ fontSize: 36, marginBottom: 16 }}>👨‍👩‍👧‍👦</div>
            <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Parent</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24, lineHeight: 1.5 }}>
              Set limits, fund wallets, monitor spending, get AI insights
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                className="btn-primary"
                onClick={() => handleConnect('parent')}
                disabled={!!connecting}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                <Wallet size={16} />
                {connecting === 'parent' ? 'Connecting...' : 'Connect Wallet'}
              </button>
              <button className="btn-secondary" onClick={() => handleDemo('parent')} style={{ fontSize: 13 }}>
                Try Demo Mode
              </button>
            </div>
          </div>

          {/* Child card */}
          <div className="card" style={{ padding: 32, textAlign: 'left' }}>
            <div style={{ fontSize: 36, marginBottom: 16 }}>🧒</div>
            <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Child</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24, lineHeight: 1.5 }}>
              Pay privately with your alias, track your balance and spending
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                className="btn-primary"
                onClick={() => handleConnect('child')}
                disabled={!!connecting}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                <Wallet size={16} />
                {connecting === 'child' ? 'Connecting...' : 'Connect Wallet'}
              </button>
              <button className="btn-secondary" onClick={() => handleDemo('child')} style={{ fontSize: 13 }}>
                Try Demo Mode
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Features */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              className="card"
              style={{ padding: 24 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
            >
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--accent-glow)', border: '1px solid rgba(20,184,166,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <f.icon size={20} color="var(--accent)" />
              </div>
              <h4 style={{ fontWeight: 600, marginBottom: 8, fontSize: 14 }}>{f.title}</h4>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Tech stack footer */}
      <div style={{ borderTop: '1px solid var(--border)', padding: '20px 40px', display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap' }}>
        {['React + Vite', 'Node.js + Express', 'Solidity', 'Base Mainnet', 'Claude AI', 'Ethers.js'].map(t => (
          <span key={t} style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>{t}</span>
        ))}
      </div>
    </div>
  )
}
