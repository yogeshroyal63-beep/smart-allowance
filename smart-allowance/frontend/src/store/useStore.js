import { create } from 'zustand'

export const useStore = create((set, get) => ({
  // Auth
  role: null, // 'parent' | 'child'
  walletAddress: null,
  isConnected: false,

  // Parent data
  children: [
    {
      id: 'child_001',
      name: 'Alex',
      age: 14,
      walletAlias: 'alex.allowance',
      balance: 45.50,
      monthlyLimit: 100,
      spent: 54.50,
      category_limits: {
        food: 30,
        games: 20,
        education: 50,
      },
      transactions: [],
      agentEnabled: true,
    },
    {
      id: 'child_002',
      name: 'Sam',
      age: 11,
      walletAlias: 'sam.allowance',
      balance: 22.00,
      monthlyLimit: 60,
      spent: 38.00,
      category_limits: {
        food: 20,
        games: 10,
        education: 30,
      },
      transactions: [],
      agentEnabled: true,
    }
  ],

  // Active child (for child view)
  activeChildId: 'child_001',

  // Transactions (global feed)
  transactions: [],

  // Agent chat history
  chatHistory: [],

  // Agent state
  agentThinking: false,
  agentStatus: 'idle', // 'idle' | 'thinking' | 'executing' | 'waiting_approval'
  pendingApprovals: [],

  // UI
  currentView: 'landing', // 'landing' | 'parent' | 'child'
  activeTab: 'dashboard',

  // Actions
  setRole: (role) => set({ role, currentView: role }),
  setWallet: (address) => set({ walletAddress: address, isConnected: true }),
  disconnectWallet: () => set({ walletAddress: null, isConnected: false }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setCurrentView: (view) => set({ currentView: view }),

  addTransaction: (tx) => set((state) => ({
    transactions: [tx, ...state.transactions].slice(0, 100)
  })),

  addChatMessage: (msg) => set((state) => ({
    chatHistory: [...state.chatHistory, { ...msg, id: Date.now(), timestamp: new Date().toISOString() }]
  })),

  clearChat: () => set({ chatHistory: [] }),

  setAgentThinking: (val) => set({ agentThinking: val }),
  setAgentStatus: (status) => set({ agentStatus: status }),

  addPendingApproval: (approval) => set((state) => ({
    pendingApprovals: [...state.pendingApprovals, approval]
  })),

  approveTransaction: (id) => set((state) => ({
    pendingApprovals: state.pendingApprovals.filter(a => a.id !== id)
  })),

  rejectTransaction: (id) => set((state) => ({
    pendingApprovals: state.pendingApprovals.filter(a => a.id !== id)
  })),

  updateChildBalance: (childId, amount) => set((state) => ({
    children: state.children.map(c =>
      c.id === childId ? { ...c, balance: c.balance - amount, spent: c.spent + amount } : c
    )
  })),

  getActiveChild: () => {
    const state = get()
    return state.children.find(c => c.id === state.activeChildId)
  },
}))
