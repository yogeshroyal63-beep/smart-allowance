import { useState } from 'react'
import { motion } from 'framer-motion'
import { Users, TrendingUp, Shield, Bell, Plus, CheckCircle, XCircle, ExternalLink } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { formatEth, formatRelativeTime, getSpendingColor, getSpendingStatus, categoryEmoji } from '../../utils'
import AgentChat from '../agent/AgentChat'
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts'

const mockChartData = [
  { day: 'Mon', spent: 12 },
  { day: 'Tue', spent: 8 },
  { day: 'Wed', spent: 22 },
  { day: 'Thu', spent: 5 },
  { day: 'Fri', spent: 18 },
  { day: 'Sat', spent: 30 },
  { day: 'Sun', spent: 14 },
]

function ChildCard({ child }) {
  const pct = Math.min((child.spent / child.monthlyLimit) * 100, 100)
  const status = getSpendingStatus(child.spent, child.monthlyLimit)
  const color = getSpendingColor(child.spent, child.monthlyLimit)

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="card-hover"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
            style={{ background: 'rgba(255,255,255,0.06)' }}>
            {child.name[0]}
          </div>
          <div>
            <p className="font-display font-semibold text-sm">{child.name}</p>
            <p className="text-xs text-white/30 font-mono">{child.walletAlias}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {child.agentEnabled && (
            <div className="badge-green text-xs">
              🤖 Agent ON
            </div>
          )}
        </div>
      </div>

      {/* Balance */}
      <div className="flex items-end justify-between mb-3">
        <div>
          <p className="text-xs text-white/30 mb-1">Balance</p>
          <p className="font-display font-bold text-2xl" style={{ color }}>
            ${child.balance.toFixed(2)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-white/30 mb-1">Monthly Limit</p>
          <p className="text-sm font-mono text-white/60">${child.monthlyLimit}</p>
        </div>
      </div>

      {/* Progress */}
      <div className="progress-bar mb-2">
        <div
          className={`progress-fill ${status}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between">
        <span className="text-xs text-white/30">${child.spent.toFixed(2)} spent</span>
        <span className="text-xs font-mono" style={{ color }}>
          {pct.toFixed(0)}%
        </span>
      </div>

      {/* Category mini */}
      <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-3 gap-2">
        {Object.entries(child.category_limits).map(([cat, limit]) => (
          <div key={cat} className="text-center">
            <div className="text-lg mb-0.5">{categoryEmoji[cat]}</div>
            <div className="text-xs text-white/30">${limit}</div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

function PendingApproval({ approval, onApprove, onReject }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      className="flex items-center gap-4 p-4 rounded-xl"
      style={{ background: 'rgba(255,199,0,0.06)', border: '1px solid rgba(255,199,0,0.2)' }}
    >
      <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-display font-semibold truncate">{approval.merchant}</p>
        <p className="text-xs text-white/40">{approval.reason} · {formatRelativeTime(approval.timestamp)}</p>
      </div>
      <div className="font-mono font-semibold text-yellow-400 text-sm flex-shrink-0">
        ${approval.amount}
      </div>
      <div className="flex gap-2">
        <button onClick={() => onApprove(approval.id)}
          className="p-1.5 rounded-lg hover:bg-green-500/20 transition-colors">
          <CheckCircle size={16} className="text-neon" />
        </button>
        <button onClick={() => onReject(approval.id)}
          className="p-1.5 rounded-lg hover:bg-red-500/20 transition-colors">
          <XCircle size={16} className="text-red-400" />
        </button>
      </div>
    </motion.div>
  )
}

export default function ParentDashboard() {
  const { children, pendingApprovals, approveTransaction, rejectTransaction } = useStore()
  const [activeTab, setActiveTab] = useState('overview')

  const totalBalance = children.reduce((s, c) => s + c.balance, 0)
  const totalSpent = children.reduce((s, c) => s + c.spent, 0)
  const totalLimit = children.reduce((s, c) => s + c.monthlyLimit, 0)

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'children', label: 'Children' },
    { id: 'agent', label: '🤖 Agent' },
    { id: 'analytics', label: 'Analytics' },
  ]

  return (
    <div className="min-h-screen pt-20 px-4 pb-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display font-bold text-3xl mb-1">Parent Dashboard</h1>
              <p className="text-white/40 text-sm">Manage allowances and monitor spending</p>
            </div>
            {pendingApprovals.length > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl"
                style={{ background: 'rgba(255,199,0,0.1)', border: '1px solid rgba(255,199,0,0.3)' }}>
                <Bell size={14} className="text-yellow-400" />
                <span className="text-yellow-400 text-sm font-semibold">{pendingApprovals.length} pending</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {[
            { label: 'Total Balance', value: `$${totalBalance.toFixed(2)}`, icon: '💰', color: '#00ff87' },
            { label: 'Total Spent', value: `$${totalSpent.toFixed(2)}`, icon: '📊', color: '#50a0ff' },
            { label: 'Monthly Limits', value: `$${totalLimit}`, icon: '🎯', color: '#ffc700' },
            { label: 'Active Children', value: children.length, icon: '👶', color: '#ff6bbd' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="stat-card"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{stat.icon}</span>
              </div>
              <p className="font-display font-bold text-2xl" style={{ color: stat.color }}>
                {stat.value}
              </p>
              <p className="text-xs text-white/30 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Pending Approvals */}
        {pendingApprovals.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card mb-8"
          >
            <h3 className="font-display font-semibold text-sm mb-4 flex items-center gap-2">
              <Bell size={14} className="text-yellow-400" />
              Pending Approvals
            </h3>
            <div className="space-y-2">
              {pendingApprovals.map(a => (
                <PendingApproval
                  key={a.id}
                  approval={a}
                  onApprove={approveTransaction}
                  onReject={rejectTransaction}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-6 glass rounded-xl p-1 w-fit">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2 rounded-lg text-sm font-display font-semibold transition-all ${
                activeTab === t.id
                  ? 'bg-neon text-dark-900'
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Children grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {children.map(child => (
                  <ChildCard key={child.id} child={child} />
                ))}
                {/* Add child card */}
                <button className="card-hover flex flex-col items-center justify-center gap-3 min-h-[200px] opacity-50 hover:opacity-80">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ border: '2px dashed rgba(255,255,255,0.2)' }}>
                    <Plus size={20} className="text-white/40" />
                  </div>
                  <p className="text-sm text-white/40 font-display">Add Child</p>
                </button>
              </div>
            </div>

            {/* Agent Chat sidebar */}
            <div>
              <AgentChat compact />
            </div>
          </div>
        )}

        {activeTab === 'children' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {children.map(child => (
              <ChildCard key={child.id} child={child} />
            ))}
          </div>
        )}

        {activeTab === 'agent' && (
          <div className="max-w-2xl">
            <AgentChat />
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="card">
            <h3 className="font-display font-semibold text-sm mb-6">Weekly Spending</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={mockChartData}>
                <defs>
                  <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00ff87" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00ff87" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="spent" stroke="#00ff87" fill="url(#spendGrad)" strokeWidth={2} />
                <Tooltip
                  contentStyle={{ background: '#0d1117', border: '1px solid rgba(0,255,135,0.2)', borderRadius: 8, color: '#fff' }}
                  formatter={(v) => [`$${v}`, 'Spent']}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}
