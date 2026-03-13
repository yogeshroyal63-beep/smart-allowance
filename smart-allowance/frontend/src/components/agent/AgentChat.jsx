import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Bot, User, Loader2, Zap, RefreshCw } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { useAgent } from '../../hooks/useAgent'
import { formatRelativeTime } from '../../utils'

const QUICK_PROMPTS_PARENT = [
  'Show me spending summary for Alex',
  'Set food limit to $25 for Sam',
  'What transactions happened today?',
  'Approve all pending payments',
]

const QUICK_PROMPTS_CHILD = [
  'How much allowance do I have left?',
  'Pay $5 to GameStore for Minecraft credits',
  'Show my spending this month',
  'Request $10 more for books',
]

function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 px-4 py-3 glass rounded-2xl rounded-tl-sm w-fit">
      <div className="flex gap-1">
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: '#00ff87' }}
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }}
          />
        ))}
      </div>
      <span className="text-xs text-white/30 font-mono">Agent thinking...</span>
    </div>
  )
}

function ChatMessage({ msg }) {
  const isUser = msg.role === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-1 ${
        isUser
          ? 'bg-white/10'
          : 'agent-pulse'
      }`}
        style={!isUser ? { background: 'rgba(0,255,135,0.15)', border: '1px solid rgba(0,255,135,0.3)' } : {}}
      >
        {isUser ? <User size={14} className="text-white/60" /> : <Bot size={14} className="text-neon" />}
      </div>

      {/* Bubble */}
      <div className={`max-w-[75%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? 'bg-white/10 rounded-tr-sm text-white/90'
            : msg.error
              ? 'rounded-tl-sm text-red-400'
              : 'glass rounded-tl-sm text-white/85'
        }`}
          style={!isUser && !msg.error ? { borderColor: 'rgba(0,255,135,0.1)' } : {}}
        >
          {msg.content}

          {/* Action badge */}
          {msg.action && (
            <div className="mt-2 pt-2 border-t border-white/10">
              <span className="badge-green text-xs">
                <Zap size={10} />
                {msg.action}
              </span>
            </div>
          )}
        </div>

        <span className="text-xs text-white/20 px-1 font-mono">
          {formatRelativeTime(msg.timestamp)}
        </span>
      </div>
    </motion.div>
  )
}

export default function AgentChat({ compact = false }) {
  const [input, setInput] = useState('')
  const { chatHistory, agentThinking, role, clearChat } = useStore()
  const { sendMessage, loading } = useAgent()
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
    <div className={`flex flex-col ${compact ? 'h-[420px]' : 'h-[600px]'} glass rounded-2xl overflow-hidden`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center agent-pulse"
            style={{ background: 'rgba(0,255,135,0.15)', border: '1px solid rgba(0,255,135,0.3)' }}>
            <Bot size={14} className="text-neon" />
          </div>
          <div>
            <p className="text-sm font-display font-semibold">Claude Agent</p>
            <p className="text-xs text-white/30 font-mono">
              {agentThinking ? 'Thinking...' : 'Ready'}
            </p>
          </div>
        </div>
        <button
          onClick={clearChat}
          className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
          title="Clear chat"
        >
          <RefreshCw size={12} className="text-white/30" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatHistory.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(0,255,135,0.08)', border: '1px solid rgba(0,255,135,0.15)' }}>
              <Bot size={28} className="text-neon/60" />
            </div>
            <div>
              <p className="text-sm font-display font-semibold text-white/50 mb-1">Ask the agent anything</p>
              <p className="text-xs text-white/25">Try a quick prompt below to get started</p>
            </div>

            <div className="grid grid-cols-2 gap-2 w-full max-w-sm">
              {quickPrompts.map(p => (
                <button
                  key={p}
                  onClick={() => sendMessage(p)}
                  className="px-3 py-2 rounded-xl text-xs text-left text-white/50 hover:text-white/80 transition-all"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
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
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center"
              style={{ background: 'rgba(0,255,135,0.15)', border: '1px solid rgba(0,255,135,0.3)' }}>
              <Bot size={14} className="text-neon" />
            </div>
            <TypingIndicator />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick prompts strip (when chat has messages) */}
      {chatHistory.length > 0 && (
        <div className="px-4 py-2 flex gap-2 overflow-x-auto border-t border-white/5">
          {quickPrompts.slice(0, 2).map(p => (
            <button
              key={p}
              onClick={() => sendMessage(p)}
              className="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs text-white/40 hover:text-white/70 transition-all whitespace-nowrap"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t border-white/5">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Message the agent..."
            className="input-field flex-1 py-2.5 text-sm"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all disabled:opacity-30"
            style={{ background: 'rgba(0,255,135,0.15)', border: '1px solid rgba(0,255,135,0.3)' }}
          >
            {loading
              ? <Loader2 size={16} className="text-neon animate-spin" />
              : <Send size={16} className="text-neon" />
            }
          </button>
        </div>
      </div>
    </div>
  )
}
