// AllowanceManager contract - Base Sepolia
export const CONTRACT_ADDRESS = '0x0eE682Ed9e49BDC7379f6617cEF1942A439385fB'

export const ABI = [
  // Events
  'event ChildAdded(address indexed parent, address indexed child, string aliasName)',
  'event ChildFunded(address indexed parent, address indexed child, uint256 amount)',
  'event PaymentProcessed(address indexed child, address indexed merchant, uint256 amount, string category, bool approved)',
  'event LimitsUpdated(address indexed child, uint256 weeklyLimit, uint256 monthlyLimit)',

  // Parent functions
  'function addChild(address childWallet, string aliasName, uint256 weeklyLimit, uint256 monthlyLimit) external',
  'function fundChild(address childWallet) external payable',
  'function updateLimits(address childWallet, uint256 weeklyLimit, uint256 monthlyLimit) external',
  'function setCategory(address childWallet, string category, bool allowed) external',
  'function withdrawFromChild(address childWallet, uint256 amount) external',

  // AI Agent
  'function processPayment(address childWallet, address payable merchant, uint256 amount, string category, string merchantName, bool approved) external',

  // View functions
  'function getChild(address childWallet) external view returns (tuple(address parent, string aliasName, uint256 balance, uint256 weeklyLimit, uint256 monthlyLimit, uint256 weeklySpent, uint256 monthlySpent, bool active))',
  'function getAlias(address childWallet) external view returns (string)',
  'function getSpendingStats(address childWallet) external view returns (uint256 weeklySpent, uint256 monthlySpent, uint256 weeklyLimit, uint256 monthlyLimit, uint256 balance)',
  'function getParentChildren(address parent) external view returns (address[])',
  'function isCategoryAllowed(address childWallet, string category) external view returns (bool)',
  'function resolveAlias(string aliasName) external view returns (address)',
]

export default { CONTRACT_ADDRESS, ABI }
