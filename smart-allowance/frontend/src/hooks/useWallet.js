import { useState, useCallback } from 'react'
import { ethers } from 'ethers'
import { useStore } from '../store/useStore'
import toast from 'react-hot-toast'
import { BASE_CHAIN } from '../contracts'

export function useWallet() {
  const [loading, setLoading] = useState(false)
  const { setWallet, disconnectWallet, walletAddress } = useStore()

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      toast.error('MetaMask not found. Please install it.')
      return null
    }

    setLoading(true)
    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const accounts = await provider.send('eth_requestAccounts', [])
      
      if (accounts.length === 0) {
        toast.error('No accounts found')
        return null
      }

      // Try to switch to Base
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${BASE_CHAIN.id.toString(16)}` }],
        })
      } catch (switchError) {
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: `0x${BASE_CHAIN.id.toString(16)}`,
              chainName: BASE_CHAIN.name,
              nativeCurrency: BASE_CHAIN.nativeCurrency,
              rpcUrls: BASE_CHAIN.rpcUrls.default.http,
              blockExplorerUrls: [BASE_CHAIN.blockExplorers.default.url],
            }],
          })
        }
      }

      const address = accounts[0]
      setWallet(address)
      toast.success(`Connected: ${address.slice(0, 6)}...${address.slice(-4)}`)
      return { provider, address }
    } catch (err) {
      if (err.code !== 4001) {
        toast.error('Failed to connect wallet')
      }
      return null
    } finally {
      setLoading(false)
    }
  }, [setWallet])

  const disconnect = useCallback(() => {
    disconnectWallet()
    toast.success('Wallet disconnected')
  }, [disconnectWallet])

  const getProvider = useCallback(() => {
    if (!window.ethereum) return null
    return new ethers.BrowserProvider(window.ethereum)
  }, [])

  const getSigner = useCallback(async () => {
    const provider = getProvider()
    if (!provider) return null
    return provider.getSigner()
  }, [getProvider])

  const formatAddress = useCallback((addr) => {
    if (!addr) return ''
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }, [])

  const formatEth = useCallback((wei) => {
    if (!wei) return '0'
    return parseFloat(ethers.formatEther(wei)).toFixed(4)
  }, [])

  return {
    connect,
    disconnect,
    getProvider,
    getSigner,
    formatAddress,
    formatEth,
    loading,
    isConnected: !!walletAddress,
    address: walletAddress,
  }
}
