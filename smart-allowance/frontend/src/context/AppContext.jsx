import React, { createContext, useContext, useState, useCallback } from 'react'
import { ethers } from 'ethers'
// ✅ FIXED: Import axios from utils so baseURL (Railway backend) is always set
import axios from '../utils/index.js'
import toast from 'react-hot-toast'

const AppContext = createContext(null)

const BASE_SEPOLIA = {
  chainId: '0x14A34',  // 84532
  chainName: 'Base Sepolia',
  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: ['https://sepolia.base.org'],
  blockExplorerUrls: ['https://sepolia.basescan.org'],
}

export function AppProvider({ children }) {
  const [role, setRole] = useState(null)
  const [wallet, setWallet] = useState(null)
  const [provider, setProvider] = useState(null)
  const [signer, setSigner] = useState(null)
  const [loading, setLoading] = useState(false)
  const [childrenList, setChildrenList] = useState([])
  const [transactions, setTransactions] = useState([])
  const [childProfile, setChildProfile] = useState(null)
  const [aiInsights, setAiInsights] = useState([])

  // ── Load children from backend (on-chain read via backend) ──────────────────
  const loadChildren = useCallback(async (parentAddress) => {
    if (!parentAddress || parentAddress.startsWith('0xDEMO')) return
    try {
      const res = await axios.get(`/api/children/${parentAddress}`)
      if (res.data.children?.length > 0) {
        setChildrenList(res.data.children)
      }
    } catch (err) {
      console.warn('loadChildren failed:', err.message)
    }
  }, [])

  // ── Load child profile from on-chain ────────────────────────────────────────
  const loadChildProfile = useCallback(async (childAddress) => {
    if (!childAddress || childAddress.startsWith('0xDEMO')) return
    try {
      const res = await axios.get(`/api/payment/child-data/${childAddress}`)
      const data = res.data
      setChildProfile(prev => ({
        ...(prev || {}),
        alias: data.aliasName,
        balance: data.balance,
        weeklyLimit: data.weeklyLimit,
        monthlyLimit: data.monthlyLimit,
        weeklySpent: data.weeklySpent,
        monthlySpent: data.monthlySpent,
        active: data.active,
      }))
    } catch (err) {
      console.warn('loadChildProfile failed:', err.message)
    }
  }, [])

  // ── Connect wallet ───────────────────────────────────────────────────────────
  const connectWallet = async (selectedRole) => {
    try {
      if (!window.ethereum) {
        toast.error('MetaMask not found.')
        return false
      }
      setLoading(true)

      const _provider = new ethers.BrowserProvider(window.ethereum)
      await _provider.send('eth_requestAccounts', [])

      // Switch to Base Sepolia
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: BASE_SEPOLIA.chainId }],
        })
      } catch (switchErr) {
        if (switchErr.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [BASE_SEPOLIA],
          })
        }
      }

      const _signer = await _provider.getSigner()
      const address = await _signer.getAddress()

      setProvider(_provider)
      setSigner(_signer)
      setWallet(address)
      setRole(selectedRole)
      setChildrenList([])
      setTransactions([])
      setChildProfile(null)

      toast.success(`Connected: ${address.slice(0, 6)}...${address.slice(-4)}`)

      // Auto-load data after connect
      if (selectedRole === 'parent') {
        setTimeout(() => loadChildren(address), 500)
      } else if (selectedRole === 'child') {
        setTimeout(() => loadChildProfile(address), 500)
      }

      return true
    } catch (err) {
      if (err.code !== 4001) toast.error('Wallet connection failed')
      return false
    } finally {
      setLoading(false)
    }
  }

  const disconnectWallet = () => {
    setWallet(null); setProvider(null); setSigner(null)
    setRole(null); setChildrenList([]); setTransactions([])
    setChildProfile(null)
  }

  // ── Demo mode ────────────────────────────────────────────────────────────────
  const loadDemoData = (demoRole) => {
    setRole(demoRole)
    setWallet('0xDEMO...1234')
    if (demoRole === 'parent') {
      setChildrenList([
        {
          id: '1', name: 'Alice', alias: 'StarGazer#4821',
          walletAddress: '0x742d35Cc6634C0532925a3b8D4C9C2aF4D7e9d1f',
          balance: '0.045', weeklyLimit: '0.05', monthlyLimit: '0.2',
          weeklySpent: '0.012', monthlySpent: '0.035', spent: '0.012',
          categories: { food: true, education: true, entertainment: false, clothing: true, gaming: false },
          age: 14, active: true
        },
        {
          id: '2', name: 'Bob', alias: 'CryptoKid#7392',
          walletAddress: '0x9f2d35Cc6634C0532925a3b8D4C9C2aF4D7e9d2a',
          balance: '0.022', weeklyLimit: '0.03', monthlyLimit: '0.12',
          weeklySpent: '0.028', monthlySpent: '0.09', spent: '0.028',
          categories: { food: true, education: true, entertainment: true, clothing: false, gaming: true },
          age: 11, active: true
        }
      ])
      setTransactions([
        { id: '1', child: 'Alice', alias: 'StarGazer#4821', amount: '0.005', merchant: 'Khan Academy', category: 'education', status: 'approved', timestamp: Date.now() - 3600000 },
        { id: '2', child: 'Bob', alias: 'CryptoKid#7392', amount: '0.008', merchant: 'Steam Store', category: 'gaming', status: 'blocked', timestamp: Date.now() - 7200000 },
        { id: '3', child: 'Alice', alias: 'StarGazer#4821', amount: '0.003', merchant: 'Subway', category: 'food', status: 'approved', timestamp: Date.now() - 14400000 },
        { id: '4', child: 'Bob', alias: 'CryptoKid#7392', amount: '0.006', merchant: 'Textbooks.com', category: 'education', status: 'approved', timestamp: Date.now() - 28800000 },
      ])
    }
    if (demoRole === 'child') {
      setChildProfile({
        name: 'Alice', alias: 'StarGazer#4821',
        balance: '0.045', weeklyLimit: '0.05', weeklySpent: '0.012',
        monthlyLimit: '0.2', monthlySpent: '0.035',
        categories: { food: true, education: true, entertainment: false, clothing: true, gaming: false },
        transactions: [
          { id: '1', amount: '0.005', merchant: 'Khan Academy', category: 'education', status: 'approved', timestamp: Date.now() - 3600000 },
          { id: '2', amount: '0.003', merchant: 'Subway', category: 'food', status: 'approved', timestamp: Date.now() - 14400000 },
          { id: '3', amount: '0.01', merchant: 'Nike Store', category: 'clothing', status: 'approved', timestamp: Date.now() - 86400000 },
        ]
      })
    }
  }

  return (
    <AppContext.Provider value={{
      role, setRole, wallet, provider, signer, loading, setLoading,
      children: childrenList, setChildren: setChildrenList,
      transactions, setTransactions,
      childProfile, setChildProfile,
      aiInsights, setAiInsights,
      connectWallet, disconnectWallet, loadDemoData,
      loadChildren, loadChildProfile,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
