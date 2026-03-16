import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Send, Bot, User, Loader2, Zap, RefreshCw, CreditCard } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { useApp } from '../../context/AppContext'
import { useAgent } from '../../hooks/useAgent'
import { formatRelativeTime } from '../../utils'

const QUICK_PROMPTS_PARENT = [
  'Show spending summary for all children',
  'Which child is close to their limit?',
  'What transactions happened recently?',
  'Give me AI insights on spending patterns',
]

const QUICK_PROMPTS_CHILD = [
  'How much allowance do I have left?',
  'Pay 0.001 ETH to GameStore for gaming',
  'Show my spending this month',
  'What categories can I spend in?',
]

function TypingIndicator() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '10px 16px', background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16,
      width: 'fit-content'
    }}>
      <div style={{ display: 'flex', gap: 4 }}>
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' }}
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }}
          />
        ))}
      </div>
      <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'monospace' }}>Agent thinking...</span>
    </div>
  )
}

function ChatMessage({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ display: 'flex', gap: 12, flexDirection: isUser ? 'row-reverse' : 'row' }}
    >
      <div style={{
        width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 4,
        background: isUser ? 'rgba(255,255,255,0.08)' : 'rgba(0,255,135,0.15)',
        border: isUser ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,255,135,0.3)'
      }}>
        {isUser
          ? <User size={14} color="rgba(255,255,255,0.6)" />
          : <Bot size={14} color="var(--accent)" />
        }
      </div>
      <div style={{ maxWidth: '75%', display: 'flex', flexDirection: 'column', gap: 4, alignItems: isUser ? 'flex-end' : 'flex-start' }}>
        <div style={{
          padding: '10px 14px', borderRadius: 16, fontSize: 14, lineHeight: 1.6,
          background: isUser ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)',
          border: isUser ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,255,135,0.1)',
          color: msg.error ? '#f87171' : 'var(--text-primary)',
          borderTopRightRadius: isUser ? 4 : 16,
          borderTopLeftRadius: isUser ? 16 : 4,
        }}>
          {msg.content}
          {msg.action && (
            <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <span style={{ fontSize: 11, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Zap size={10} /> {msg.action}
              </span>
            </div>
          )}
        </div>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace', padding: '0 4px' }}>
          {formatRelativeTime(msg.timestamp)}
        </span>
      </div>
    </motion.div>
  )
}

// onPaymentRequest: ({ merchant, amount, category, reason }) => void
export default function AgentChat({ compact = false, onPaymentRequest }) {
  const [input, setInput] = useState('')
  const { chatHistory, agentThinking, clearChat } = useStore()
  const { role } = useApp()
  const { sendMessage, loading } = useAgent({ onPaymentRequest })
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const quickPrompts = role === 'parent' ? QUICK_PROMPTS_PARENT : QUICK_PROMPTS_CHILD

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory, agentThinking])

  const handleSend = async () => {
    const msg = input.trim()
    if (!msg || loading) return
    setInput('')
    await sendMessage(msg)
    inputRef.current?.focus()
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: compact ? 420 : 600,
      background: 'var(--bg-secondary)',
      border: '1px solid var(--border)',
      borderRadius: 16, overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,255,135,0.15)', border: '1px solid rgba(0,255,135,0.3)' }}>
            <Bot size={14} color="var(--accent)" />
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600 }}>Claude Agent</p>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace' }}>
              {agentThinking ? 'Thinking...' : 'Ready'}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {/* Child: quick pay button */}
          {role === 'child' && onPaymentRequest && (
            <button
              onClick={() => onPaymentRequest({ merchant: '', amount: '', category: '', reason: '' })}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 12px', borderRadius: 10, fontSize: 12, fontWeight: 600,
                background: 'rgba(0,255,135,0.12)', border: '1px solid rgba(0,255,135,0.3)',
                color: 'var(--accent)', cursor: 'pointer'
              }}
              title="Make a payment"
            >
              <CreditCard size={12} /> Pay
            </button>
          )}
          <button onClick={clearChat} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 8 }} title="Clear chat">
            <RefreshCw size={12} color="var(--text-muted)" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {chatHistory.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 16, textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,255,135,0.08)', border: '1px solid rgba(0,255,135,0.15)' }}>
              <Bot size={24} color="var(--accent)" style={{ opacity: 0.6 }} />
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Ask the agent anything</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Try a quick prompt below to get started</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, width: '100%', maxWidth: 360 }}>
              {quickPrompts.map(p => (
                <button
                  key={p}
                  onClick={() => sendMessage(p)}
                  style={{
                    padding: '8px 12px', borderRadius: 12, fontSize: 12, textAlign: 'left',
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
                    color: 'var(--text-muted)', cursor: 'pointer', lineHeight: 1.4
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {chatHistory.map(msg => (
          <ChatMessage key={msg.id} msg={msg} />
        ))}

        {agentThinking && (
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,255,135,0.15)', border: '1px solid rgba(0,255,135,0.3)' }}>
              <Bot size={14} color="var(--accent)" />
            </div>
            <TypingIndicator />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick prompts strip when chat has messages */}
      {chatHistory.length > 0 && (
        <div style={{ padding: '8px 16px', display: 'flex', gap: 8, overflowX: 'auto', borderTop: '1px solid var(--border)' }}>
          {quickPrompts.slice(0, 2).map(p => (
            <button
              key={p}
              onClick={() => sendMessage(p)}
              style={{
                flexShrink: 0, padding: '6px 12px', borderRadius: 12, fontSize: 12,
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
                color: 'var(--text-muted)', cursor: 'pointer', whiteSpace: 'nowrap'
              }}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{ padding: 12, borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder={role === 'child' ? 'Ask about balance or say "pay 0.001 ETH to..."' : 'Message the agent...'}
            className="input-field"
            style={{ flex: 1, padding: '10px 14px', fontSize: 14 }}
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            style={{
              width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(0,255,135,0.15)', border: '1px solid rgba(0,255,135,0.3)',
              cursor: 'pointer', opacity: (!input.trim() || loading) ? 0.3 : 1, transition: 'opacity 0.2s'
            }}
          >
            {loading
              ? <Loader2 size={16} color="var(--accent)" style={{ animation: 'spin 0.8s linear infinite' }} />
              : <Send size={16} color="var(--accent)" />
            }
          </button>
        </div>
      </div>
    </div>
  )
}
