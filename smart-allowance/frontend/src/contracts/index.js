// Deployed contract addresses (update after deployment)
export const CONTRACTS = {
  SmartAllowance: '0x0000000000000000000000000000000000000000', // TODO: deploy
  PrivacyPayment: '0x0000000000000000000000000000000000000000', // TODO: deploy
}

export const SMART_ALLOWANCE_ABI = [
  // Events
  'event AllowanceSet(address indexed parent, address indexed child, uint256 amount, uint256 monthlyLimit)',
  'event PaymentMade(address indexed child, address indexed merchant, uint256 amount, bytes32 category)',
  'event LimitUpdated(address indexed parent, address indexed child, bytes32 category, uint256 limit)',
  'event AgentAuthorized(address indexed child, address indexed agent, bool status)',
  'event PaymentRequested(bytes32 indexed requestId, address indexed child, uint256 amount, string reason)',
  'event PaymentApproved(bytes32 indexed requestId, address indexed parent)',
  'event PaymentRejected(bytes32 indexed requestId, address indexed parent)',

  // Parent functions
  'function setAllowance(address child, uint256 monthlyLimit) external payable',
  'function setCategoryLimit(address child, bytes32 category, uint256 limit) external',
  'function authorizeAgent(address child, address agent, bool status) external',
  'function approvePayment(bytes32 requestId) external',
  'function rejectPayment(bytes32 requestId) external',
  'function topUp(address child) external payable',

  // Child / Agent functions
  'function requestPayment(address merchant, uint256 amount, bytes32 category, string reason) external returns (bytes32)',
  'function executePayment(bytes32 requestId) external',

  // View functions
  'function getAllowance(address child) external view returns (uint256 balance, uint256 monthlyLimit, uint256 spent)',
  'function getCategorySpent(address child, bytes32 category) external view returns (uint256)',
  'function getCategoryLimit(address child, bytes32 category) external view returns (uint256)',
  'function isAgentAuthorized(address child, address agent) external view returns (bool)',
  'function getPendingRequest(bytes32 requestId) external view returns (address child, address merchant, uint256 amount, bytes32 category, string reason, uint8 status)',
]

export const PRIVACY_PAYMENT_ABI = [
  // Events
  'event PrivatePaymentSent(bytes32 indexed nullifier, address indexed merchant, uint256 amount)',
  'event CommitmentAdded(bytes32 indexed commitment)',

  // Functions
  'function deposit(bytes32 commitment) external payable',
  'function withdraw(bytes calldata proof, bytes32 nullifier, bytes32 root, address recipient, uint256 amount) external',
  'function isSpent(bytes32 nullifier) external view returns (bool)',
  'function getRoot() external view returns (bytes32)',
]

// Category bytes32 mappings
export const CATEGORIES = {
  food: '0x666f6f6400000000000000000000000000000000000000000000000000000000',
  games: '0x67616d657300000000000000000000000000000000000000000000000000000000',
  education: '0x656475636174696f6e000000000000000000000000000000000000000000000000',
  transport: '0x7472616e73706f727400000000000000000000000000000000000000000000000000',
  entertainment: '0x656e7465727461696e6d656e74000000000000000000000000000000000000000000',
}

export const CATEGORY_LABELS = {
  food: '🍔 Food',
  games: '🎮 Games',
  education: '📚 Education',
  transport: '🚌 Transport',
  entertainment: '🎬 Entertainment',
}

export const BASE_CHAIN = {
  id: 8453,
  name: 'Base',
  network: 'base',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://mainnet.base.org'] },
  },
  blockExplorers: {
    default: { name: 'BaseScan', url: 'https://basescan.org' },
  },
}
