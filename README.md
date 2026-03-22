# 🧠 SmartAllowance — AI Agent for Privacy-First Kids Payments

> **The Synthesis Hackathon 2026** | Tracks: **Agents that Pay** + **Private Agents, Trusted Actions**  
> Chain: Base Sepolia | Contract: `0x0eE682Ed9e49BDC7379f6617cEF1942A439385fB`  
> Live Demo: https://smart-allowance.vercel.app

---

## What It Does

SmartAllowance is an AI-powered allowance manager where:

- **Parents** set spending limits, fund their child's wallet, and control spending categories
- **Children** make payments via an AI agent — without exposing their real identity to merchants
- **The AI agent** autonomously approves or denies every payment based on parent-set rules
- **The smart contract** processes approved payments on Base Sepolia — fully transparent and auditable

**Privacy layer**: merchants only ever see a privacy alias like `StarGazer#4821` — never the child's real wallet address.

---

## Tracks

### 🤖 Agents that Pay
1. Child requests a payment via chat or payment modal
2. AI agent evaluates: Is the category allowed? Is the child within weekly/monthly limits?
3. If approved → `processPayment()` is called on Base Sepolia
4. If denied → Payment is blocked with an explanation

### 🔒 Private Agents, Trusted Actions
- Child wallet address is mapped to a privacy alias on-chain
- Merchants interact with the alias only — real address never exposed
- `resolveAlias()` is a private mapping — only the contract knows the link
- On-chain receipts show alias, never identity

---

## Smart Contract

**Deployed on Base Sepolia**: [`0x0eE682Ed9e49BDC7379f6617cEF1942A439385fB`](https://sepolia.basescan.org/address/0x0eE682Ed9e49BDC7379f6617cEF1942A439385fB)

| Function | Who calls it | What it does |
|---|---|---|
| `addChild()` | Parent | Registers child wallet + alias + limits |
| `fundChild()` | Parent | Sends ETH to child's balance |
| `processPayment()` | AI Agent | Approves/denies + transfers ETH to merchant |
| `updateLimits()` | Parent | Adjusts weekly/monthly spend caps |
| `setCategory()` | Parent | Allow/block spending categories |
| `resolveAlias()` | Anyone | Looks up wallet from alias (privacy-preserving) |

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React + Vite + Tailwind CSS |
| Backend | Node.js + Express |
| AI Agent | Groq (llama-3.1-8b-instant) |
| Smart Contract | Solidity 0.8.20 + Hardhat |
| Chain | Base Sepolia |
| Wallet | MetaMask + ethers.js v6 |

---

## How to Run

### Frontend
```bash
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

### Backend
```bash
cd backend
npm install
cp .env.example .env
npm run dev
# → http://localhost:5000
```

### Environment Variables
```env
GROQ_API_KEY=your_groq_key
CONTRACT_ADDRESS=0x0eE682Ed9e49BDC7379f6617cEF1942A439385fB
DEPLOYER_PRIVATE_KEY=your_deployer_private_key
RPC_URL=https://sepolia.base.org
PORT=5000
FRONTEND_URL=http://localhost:3000
```

---

## Demo Mode

No wallet needed. Click **"Try Demo"** on the landing page to explore the full app with pre-loaded mock data — real AI responses included.

---

## Agent Collaboration Log

- **Mar 13** — Project idea finalized: Smart Allowance + Privacy-First Payments
- **Mar 14** — Claude designed `AllowanceManager.sol` architecture
- **Mar 15** — Full stack scaffolded: React frontend, Express backend, Hardhat contracts
- **Mar 16** — Contract deployed to Base Sepolia: `0x0eE682Ed9e49BDC7379f6617cEF1942A439385fB`
- **Mar 17** — Real contract calls wired, on-chain reads, README added
- **Mar 18** — Frontend deployed to Vercel, backend to Railway, project submitted

---

## Hackathon

- **Participant ID**: `b049b5ba66674619ba759898890bfc0c`
- **Agent**: Claude - Yogesh Royal Agent
- **Model**: claude-sonnet-4-6

*Built for The Synthesis Hackathon — where AI agents are first-class builders.*
