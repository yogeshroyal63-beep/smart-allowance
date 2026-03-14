import React, { useState } from 'react'
import { X, Wallet, ArrowRight } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { ethers } from 'ethers'
import { CONTRACT_ADDRESS, ABI } from '../../contracts/AllowanceManager'
import toast from 'react-hot-toast'

const QUICK_AMOUNTS = ['0.01', '0.025', '0.05', '0.1']

export default function FundModal({ child, onClose }) {
  const { signer, setChildren, children, wallet } = useApp()
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)

  const handleFund = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Enter a valid amount')
      return
    }
    setLoading(true)
    try {
      if (signer && wallet && !wallet.startsWith('0xDEMO')) {
        // Real contract call — fundChild(childWallet) payable
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer)
        toast.loading('Confirm transaction in MetaMask...', { id: 'fund' })
        const tx = await contract.fundChild(child.walletAddress, {
          value: ethers.parseEther(amount)
        })
        toast.loading('Waiting for confirmation...', { id: 'fund' })
        await tx.wait()
        toast.success(`Funded ${amount} ETH to ${child.name}`, { id: 'fund' })
      } else {
        // Demo mode
        await new Promise(r => setTimeout(r, 1200))
        toast.success(`Demo: Funded ${amount} ETH to ${child.name}`)
      }

      // Update local state
      setChildren(children.map(c => c.id === child.id
        ? { ...c, balance: (parseFloat(c.balance) + parseFloat(amount)).toFixed(4) }
        : c
      ))
      onClose()
    } catch (err) {
      console.error(err)
      toast.error(err.reason || err.message?.slice(0, 60) || 'Transaction failed', { id: 'fund' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, backdropFilter: 'blur(4px)'
    }}>
      <div className="card" style={{ width: 400, padding: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Wallet size={20} color="var(--accent)" />
            <h2 style={{ fontSize: 18, fontWeight: 600 }}>Fund {child.name}</h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: 14, background: 'var(--bg-primary)', borderRadius: 8, border: '1px solid var(--border)', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Alias</span>
            <span className="mono" style={{ fontSize: 12, color: 'var(--accent)' }}>{child.alias}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Current Balance</span>
            <span className="mono" style={{ fontSize: 12 }}>{child.balance} ETH</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Wallet</span>
            <span className="mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              {child.walletAddress.slice(0, 12)}...{child.walletAddress.slice(-8)}
            </span>
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ marginBottom: 10, display: 'block' }}>Quick Select</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {QUICK_AMOUNTS.map(a => (
              <button
                key={a}
                onClick={() => setAmount(a)}
                style={{
                  padding: '8px', borderRadius: 6, fontSize: 13, fontWeight: 500, cursor: 'pointer',
                  background: amount === a ? 'rgba(20,184,166,0.15)' : 'var(--bg-primary)',
                  border: `1px solid ${amount === a ? 'rgba(20,184,166,0.4)' : 'var(--border)'}`,
                  color: amount === a ? 'var(--accent)' : 'var(--text-primary)'
                }}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <label>Custom Amount (ETH)</label>
          <input
            type="number" step="0.001" min="0"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="0.000"
            className="mono"
            style={{ fontSize: 18, fontWeight: 600, textAlign: 'center' }}
          />
        </div>

        {amount && parseFloat(amount) > 0 && (
          <div style={{ padding: 12, background: 'rgba(20,184,166,0.05)', borderRadius: 8, border: '1px solid rgba(20,184,166,0.2)', marginBottom: 20, textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>New balance after funding:</p>
            <p className="mono" style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent)', marginTop: 4 }}>
              {(parseFloat(child.balance) + parseFloat(amount || 0)).toFixed(4)} ETH
            </p>
          </div>
        )}

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-secondary" onClick={onClose} style={{ flex: 1 }}>Cancel</button>
          <button
            className="btn-primary" onClick={handleFund} disabled={loading || !amount}
            style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            {loading ? 'Sending...' : <><ArrowRight size={16} /> Send ETH</>}
          </button>
        </div>
      </div>
    </div>
  )
}
