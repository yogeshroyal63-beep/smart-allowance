import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, LogOut, ExternalLink } from 'lucide-react'
import { useApp } from '../../context/AppContext'

export default function Layout({ children, role }) {
  const navigate = useNavigate()
  const { wallet, disconnectWallet } = useApp()

  const handleLogout = () => {
    disconnectWallet()
    navigate('/')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <nav style={{
        padding: '16px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(10, 15, 14, 0.95)',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={16} color="#0a0f0e" />
          </div>
          <span style={{ fontWeight: 700, fontSize: 16 }}>SmartAllowance</span>
          <span className="badge badge-teal" style={{ marginLeft: 8 }}>
            {role === 'parent' ? '👨‍👩‍👧 Parent' : '🧒 Child'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {wallet && (
            <span className="mono" style={{ fontSize: 12, color: 'var(--text-muted)', background: 'var(--bg-card)', padding: '6px 12px', borderRadius: 6, border: '1px solid var(--border)' }}>
              {wallet.includes('DEMO') ? '🎭 Demo Mode' : `${wallet.slice(0, 8)}...${wallet.slice(-6)}`}
            </span>
          )}
          <button className="btn-secondary" onClick={handleLogout} style={{ padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
            <LogOut size={14} />
            Exit
          </button>
        </div>
      </nav>
      <main style={{ padding: '32px' }}>
        {children}
      </main>
    </div>
  )
}
