import { motion } from 'framer-motion'
import { Shield, Zap, Lock, ChevronRight, Coins, Bot } from 'lucide-react'
import { useStore } from '../../store/useStore'

const features = [
  {
    icon: Bot,
    title: 'AI-Powered Agent',
    desc: 'Claude manages your child\'s spending, enforces limits, and requests approval for edge cases.'
  },
  {
    icon: Lock,
    title: 'Privacy-First Payments',
    desc: 'Kids\' real wallet addresses stay hidden. Payments go through privacy aliases on-chain.'
  },
  {
    icon: Shield,
    title: 'Parental Controls',
    desc: 'Set monthly limits, category caps, and approve/reject any transaction in real-time.'
  },
  {
    icon: Coins,
    title: 'On-Chain Transparency',
    desc: 'Every allowance and payment is recorded on Base Mainnet. Fully auditable by parents.'
  },
]

const tracks = [
  { label: 'Agents that Pay', color: '#00ff87', desc: 'AI autonomously executes payments within limits' },
  { label: 'Agents that Keep Secrets', color: '#50a0ff', desc: 'ZK-style privacy preserves child identity' },
]

export default function Landing() {
  const { setCurrentView } = useStore()

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-4 pt-20 pb-16 overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
            style={{ background: 'radial-gradient(ellipse, rgba(0,255,135,0.08) 0%, transparent 70%)' }}
          />
        </div>

        {/* Track badges */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-3 mb-10"
        >
          {tracks.map(t => (
            <div
              key={t.label}
              className="badge text-xs"
              style={{
                background: `${t.color}15`,
                color: t.color,
                border: `1px solid ${t.color}40`
              }}
            >
              {t.label}
            </div>
          ))}
        </motion.div>

        {/* Logo mark */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center agent-pulse"
            style={{ background: 'rgba(0,255,135,0.1)', border: '1px solid rgba(0,255,135,0.4)' }}>
            <span className="text-4xl">⚡</span>
          </div>
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-6 max-w-3xl"
        >
          <h1 className="font-display font-bold text-5xl md:text-7xl leading-tight mb-4">
            Smart{' '}
            <span className="neon-text">Allowance</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/50 font-body font-light leading-relaxed">
            AI agent that manages your child's allowance with{' '}
            <span className="text-white/80">spending limits</span> and{' '}
            <span className="text-white/80">privacy-first</span> on-chain payments.
          </p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="flex flex-col sm:flex-row gap-4 mb-20"
        >
          <button
            onClick={() => setCurrentView('parent')}
            className="btn-primary flex items-center gap-2 text-base"
          >
            I'm a Parent
            <ChevronRight size={16} />
          </button>
          <button
            onClick={() => setCurrentView('child')}
            className="btn-ghost flex items-center gap-2 text-base"
          >
            I'm a Kid
            <ChevronRight size={16} />
          </button>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-5xl"
        >
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="card-hover"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: 'rgba(0,255,135,0.1)' }}>
                <f.icon size={18} className="text-neon" />
              </div>
              <h3 className="font-display font-semibold text-sm mb-2">{f.title}</h3>
              <p className="text-xs text-white/40 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Footer */}
      <div className="text-center py-6 text-white/20 text-xs font-mono">
        Built on Base · The Synthesis Hackathon 2025 · Powered by Claude AI
      </div>
    </div>
  )
}
