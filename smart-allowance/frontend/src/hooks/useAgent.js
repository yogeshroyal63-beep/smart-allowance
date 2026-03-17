import { useState, useCallback } from 'react'
import { useStore } from '../store/useStore'
import { useApp } from '../context/AppContext'
// ✅ FIXED: Import axios from utils so baseURL (Railway backend) is always set
import axios from '../utils/index.js'
import toast from 'react-hot-toast'

export function useAgent({ onPaymentRequest } = {}) {
  const [loading, setLoading] = useState(false)
  const {
    addChatMessage,
    setAgentThinking,
    setAgentStatus,
    addPendingApproval,
    chatHistory,
  } = useStore()

  const { role, childProfile, children: childrenList } = useApp()

  const buildChildContext = useCallback(() => {
    if (role === 'child' && childProfile) {
      return {
        name: childProfile.name,
        alias: childProfile.alias,
        balance: childProfile.balance,
        weeklyLimit: childProfile.weeklyLimit,
        weeklySpent: childProfile.weeklySpent,
        monthlyLimit: childProfile.monthlyLimit,
        monthlySpent: childProfile.monthlySpent,
        categories: childProfile.categories,
        transactions: (childProfile.transactions || []).slice(0, 5),
      }
    }
    if (role === 'parent' && childrenList?.length > 0) {
      return {
        children: childrenList.map(c => ({
          name: c.name,
          alias: c.alias,
          balance: c.balance,
          weeklyLimit: c.weeklyLimit,
          monthlyLimit: c.monthlyLimit,
          spent: c.spent,
          categories: c.categories,
          active: c.active,
        }))
      }
    }
    return null
  }, [role, childProfile, childrenList])

  const sendMessage = useCallback(async (userMessage, context = {}) => {
    setLoading(true)
    setAgentThinking(true)
    setAgentStatus('thinking')

    addChatMessage({ role: 'user', content: userMessage })

    try {
      const childContext = buildChildContext()

      const response = await axios.post('/api/agent/chat', {
        message: userMessage,
        history: chatHistory.slice(-10),
        role,
        childContext,
        ...context,
      })

      const { reply, action, requiresApproval } = response.data

      addChatMessage({ role: 'assistant', content: reply, action })

      if (requiresApproval) {
        if (role === 'child' && onPaymentRequest) {
          onPaymentRequest({
            merchant: requiresApproval.merchant || '',
            amount: requiresApproval.amount || '',
            category: requiresApproval.category || '',
            reason: requiresApproval.reason || userMessage,
          })
          toast('Opening payment flow...', { icon: '💳' })
        } else {
          addPendingApproval({
            id: `approval_${Date.now()}`,
            ...requiresApproval,
            timestamp: new Date().toISOString(),
          })
          setAgentStatus('waiting_approval')
          toast('Payment request needs your approval', { icon: '⏳' })
        }
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
  }, [chatHistory, role, buildChildContext, addChatMessage, setAgentThinking, setAgentStatus, addPendingApproval, onPaymentRequest])

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
