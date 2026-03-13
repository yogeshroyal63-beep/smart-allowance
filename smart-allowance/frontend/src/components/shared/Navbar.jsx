import { motion } from 'framer-motion'
import { Wallet, LogOut, Home, Bell } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { useWallet } from '../../hooks/useWallet'
import { formatAddress } from '../../utils'

export default function Navbar() {
  const { currentView, setCurrentView, walletAddress, isConnected, pendingApprovals, role } = useStore()
  const { connect, disconnect, loading } = useWallet()

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 px-4 py-3"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between glass rounded-2xl px-4 py-3">
        {/* Logo */}
        <button
          onClick={() => setCurrentView('landing')}
          className="flex items-center gap-3 group"
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(0,255,135,0.15)', border: '1px solid rgba(0,255,135,0.3)' }}>
            <span className="text-sm">⚡</span>
          </div>
          <span className="font-display font-bold text-sm neon-text hidden sm:block">SmartAllowance</span>
        </button>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Pending approvals bell */}
          {pendingApprovals.length > 0 && (
            <div className="relative">
              <Bell size={18} className="text-yellow-400" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-xs flex items-center justify-center"
                style={{ background: '#ffc700', color: '#000' }}>
                {pendingApprovals.length}
              </span>
            </div>
          )}

          {/* Role badge */}
          {role && currentView !== 'landing' && (
            <div className="badge-green text-xs">
              {role === 'parent' ? '👨‍👩‍👧 Parent' : '🧒 Child'}
            </div>
          )}

          {/* Wallet */}
          {isConnected ? (
            <div className="flex items-center gap-2">
              <div className="glass px-3 py-1.5 rounded-lg flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-neon animate-pulse" />
                <span className="text-xs font-mono text-white/70">{formatAddress(walletAddress)}</span>
              </div>
              <button onClick={disconnect} className="p-2 rounded-lg hover:bg-white/5 transition-colors">
                <LogOut size={14} className="text-white/40" />
              </button>
            </div>
          ) : (
            <button
              onClick={connect}
              disabled={loading}
              className="btn-ghost flex items-center gap-2 py-2 text-xs"
            >
              <Wallet size={14} />
              {loading ? 'Connecting...' : 'Connect Wallet'}
            </button>
          )}
        </div>
      </div>
    </motion.nav>
  )
}
