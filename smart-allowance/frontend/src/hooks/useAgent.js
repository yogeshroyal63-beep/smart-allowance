import { useState, useCallback } from 'react'
import { useStore } from '../store/useStore'
import axios from 'axios'
import toast from 'react-hot-toast'

export function useAgent() {
  const [loading, setLoading] = useState(false)
  const {
    addChatMessage,
    setAgentThinking,
    setAgentStatus,
    addPendingApproval,
    chatHistory,
    role,
    getActiveChild,
  } = useStore()

  const sendMessage = useCallback(async (userMessage, context = {}) => {
    setLoading(true)
    setAgentThinking(true)
    setAgentStatus('thinking')

    addChatMessage({ role: 'user', content: userMessage })

    try {
      const child = getActiveChild()
      const response = await axios.post('/api/agent/chat', {
        message: userMessage,
        history: chatHistory.slice(-10), // last 10 messages for context
        role,
        childContext: child ? {
          name: child.name,
          balance: child.balance,
          monthlyLimit: child.monthlyLimit,
          spent: child.spent,
          category_limits: child.category_limits,
          agentEnabled: child.agentEnabled,
        } : null,
        ...context,
      })

      const { reply, action, requiresApproval } = response.data

      addChatMessage({ role: 'assistant', content: reply, action })

      if (requiresApproval) {
        addPendingApproval({
          id: `approval_${Date.now()}`,
          ...requiresApproval,
          timestamp: new Date().toISOString(),
        })
        setAgentStatus('waiting_approval')
        toast('Payment request needs your approval', { icon: '⏳' })
      } else {
        setAgentStatus('idle')
      }

      return response.data
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Agent connection failed'
      addChatMessage({ role: 'assistant', content: `⚠️ ${errMsg}`, error: true })
      toast.error(errMsg)
      setAgentStatus('idle')
      return null
    } finally {
      setLoading(false)
      setAgentThinking(false)
    }
  }, [chatHistory, role, getActiveChild, addChatMessage, setAgentThinking, setAgentStatus, addPendingApproval])

  const requestPayment = useCallback(async (merchant, amount, category, reason) => {
    return sendMessage(
      `I want to pay ${amount} ETH to ${merchant} for ${reason} (category: ${category})`,
      { type: 'payment_request', merchant, amount, category, reason }
    )
  }, [sendMessage])

  return {
    sendMessage,
    requestPayment,
    loading,
  }
}
