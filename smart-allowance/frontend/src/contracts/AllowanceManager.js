// ⚠️ UPDATE THIS ADDRESS after deploying the contract
// Run: cd contracts && npx hardhat run scripts/deploy.js --network base-sepolia
// Then paste the deployed address below
export const ALLOWANCE_MANAGER_ADDRESS = '0x0eE682Ed9e49BDC7379f6617cEF1942A439385fB'

export const ALLOWANCE_MANAGER_ABI = [
  // Parent functions
  "function addChild(address childWallet, string calldata alias, uint256 weeklyLimit, uint256 monthlyLimit) external",
  "function fundChild(address childWallet) external payable",
  "function updateLimits(address childWallet, uint256 weeklyLimit, uint256 monthlyLimit) external",
  "function setCategory(address childWallet, string calldata category, bool allowed) external",
  "function withdrawFromChild(address childWallet, uint256 amount) external",

  // AI Agent function
  "function processPayment(address childWallet, address payable merchant, uint256 amount, string calldata category, string calldata merchantName, bool approved) external",

  // View functions
  "function getChild(address childWallet) external view returns (tuple(address wallet, string alias, uint256 balance, uint256 weeklyLimit, uint256 monthlyLimit, uint256 weeklySpent, uint256 monthlySpent, uint256 weekStart, uint256 monthStart, bool active, address parent))",
  "function getAlias(address childWallet) external view returns (string memory)",
  "function resolveAlias(string calldata alias) external view returns (address)",
  "function getSpendingStats(address childWallet) external view returns (uint256 weeklySpent, uint256 monthlySpent, uint256 weeklyLimit, uint256 monthlyLimit, uint256 balance)",
  "function getParentChildren(address parent) external view returns (address[] memory)",
  "function getTransactionCount() external view returns (uint256)",
  "function isCategoryAllowed(address childWallet, string calldata category) external view returns (bool)",

  // Admin
  "function setAIAgent(address newAgent) external",

  // Events
  "event ChildAdded(address indexed parent, address indexed child, string alias)",
  "event PaymentProcessed(address indexed child, address indexed merchant, uint256 amount, string category, bool approved)",
  "event AllowanceFunded(address indexed parent, address indexed child, uint256 amount)",
  "event LimitsUpdated(address indexed child, uint256 weeklyLimit, uint256 monthlyLimit)",
  "event CategoryUpdated(address indexed child, string category, bool allowed)",
]
