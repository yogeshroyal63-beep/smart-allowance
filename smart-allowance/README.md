# 🚀 Smart Allowance - Deploy Steps (Mar 14)

## Step 1: Setup .env
Copy `.env.example` to `.env` in the root folder and fill in:
- `DEPLOYER_PRIVATE_KEY` = your MetaMask private key
- Everything else is already filled

## Step 2: Deploy Contract to Base Sepolia
```bash
cd contracts
npm install
npx hardhat run scripts/deploy.js --network base-sepolia
```
Copy the deployed address from output.

## Step 3: Update Contract Address in 2 places
1. `frontend/src/contracts/AllowanceManager.js` → `ALLOWANCE_MANAGER_ADDRESS`
2. `.env` → `CONTRACT_ADDRESS`

## Step 4: Run Backend
```bash
cd backend
npm install
node server.js
```
Should print: `🚀 SmartAllowance backend running on port 5000`

## Step 5: Run Frontend
```bash
cd frontend
npm install
npm run dev
```
Opens at http://localhost:3000

## Step 6: Fix MetaMask RPC (if showing error)
MetaMask → Base Sepolia Testnet → Update RPC → `https://sepolia.base.org`

## Step 7: Test the App
1. Open http://localhost:3000
2. Click "Connect as Parent" → MetaMask popup → Approve
3. Click "Connect as Child" → MetaMask popup → Approve
4. Try Demo Mode (no wallet needed) to test AI agent
