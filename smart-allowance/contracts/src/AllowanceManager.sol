// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AllowanceManager
 * @notice Smart contract for managing children's allowances with privacy-first payments
 * @dev Deployed on Base Mainnet for Synthesis Hackathon 2025
 * Tracks: Agents that Pay + Agents that Keep Secrets
 */
contract AllowanceManager {

    // ─── Structs ───────────────────────────────────────────────────────────────

    struct Child {
        address wallet;
        string  aliasName;           // Privacy alias e.g. "StarGazer#4821"
        uint256 balance;         // Current balance in wei
        uint256 weeklyLimit;     // Max spend per week (wei)
        uint256 monthlyLimit;    // Max spend per month (wei)
        uint256 weeklySpent;     // Spent this week (wei)
        uint256 monthlySpent;    // Spent this month (wei)
        uint256 weekStart;       // Timestamp of current week start
        uint256 monthStart;      // Timestamp of current month start
        bool    active;
        address parent;
    }

    struct Transaction {
        address child;
        address merchant;
        uint256 amount;
        string  category;
        string  merchantName;
        bool    approved;
        uint256 timestamp;
    }

    // ─── State ─────────────────────────────────────────────────────────────────

    address public owner;

    // child wallet => Child
    mapping(address => Child) public children;

    // alias => child wallet  (privacy: lookup by alias)
    mapping(bytes32 => address) private aliasToWallet;

    // child wallet => alias hash
    mapping(address => bytes32) private walletToAliasHash;

    // parent => child wallets
    mapping(address => address[]) public parentChildren;

    // category allowed: childWallet => category => allowed
    mapping(address => mapping(string => bool)) public categoryAllowed;

    // AI agent address — only this address can approve/deny payments
    address public aiAgent;

    // Transaction log
    Transaction[] public transactions;

    // ─── Events ────────────────────────────────────────────────────────────────

    event ChildAdded(address indexed parent, address indexed child, string aliasName);
    event AllowanceFunded(address indexed parent, address indexed child, uint256 amount);
    event PaymentProcessed(address indexed child, address indexed merchant, uint256 amount, string category, bool approved);
    event LimitsUpdated(address indexed child, uint256 weeklyLimit, uint256 monthlyLimit);
    event CategoryUpdated(address indexed child, string category, bool allowed);
    event AIAgentUpdated(address indexed newAgent);

    // ─── Modifiers ─────────────────────────────────────────────────────────────

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyParentOf(address childWallet) {
        require(children[childWallet].parent == msg.sender, "Not parent");
        _;
    }

    modifier onlyAIAgent() {
        require(msg.sender == aiAgent || msg.sender == owner, "Not AI agent");
        _;
    }

    modifier childExists(address childWallet) {
        require(children[childWallet].active, "Child not registered");
        _;
    }

    // ─── Constructor ───────────────────────────────────────────────────────────

    constructor() {
        owner = msg.sender;
        aiAgent = msg.sender; // Initially owner acts as AI agent
    }

    // ─── Parent Functions ──────────────────────────────────────────────────────

    /**
     * @notice Add a child wallet with spending limits and privacy alias
     */
    function addChild(
        address childWallet,
        string calldata aliasName,
        uint256 weeklyLimit,
        uint256 monthlyLimit
    ) external {
        require(childWallet != address(0), "Invalid wallet");
        require(bytes(aliasName).length > 0 && bytes(aliasName).length <= 32, "Invalid alias");
        require(!children[childWallet].active, "Child already registered");

        bytes32 aliasHash = keccak256(abi.encodePacked(aliasName));
        require(aliasToWallet[aliasHash] == address(0), "Alias taken");

        children[childWallet] = Child({
            wallet: childWallet,
            aliasName: aliasName,
            balance: 0,
            weeklyLimit: weeklyLimit,
            monthlyLimit: monthlyLimit,
            weeklySpent: 0,
            monthlySpent: 0,
            weekStart: block.timestamp,
            monthStart: block.timestamp,
            active: true,
            parent: msg.sender
        });

        aliasToWallet[aliasHash] = childWallet;
        walletToAliasHash[childWallet] = aliasHash;
        parentChildren[msg.sender].push(childWallet);

        // Default allowed categories
        categoryAllowed[childWallet]["food"] = true;
        categoryAllowed[childWallet]["education"] = true;
        categoryAllowed[childWallet]["clothing"] = true;

        emit ChildAdded(msg.sender, childWallet, aliasName);
    }

    /**
     * @notice Fund a child's allowance balance
     */
    function fundChild(address childWallet)
        external
        payable
        onlyParentOf(childWallet)
        childExists(childWallet)
    {
        require(msg.value > 0, "Must send ETH");
        children[childWallet].balance += msg.value;
        emit AllowanceFunded(msg.sender, childWallet, msg.value);
    }

    /**
     * @notice Update spending limits for a child
     */
    function updateLimits(
        address childWallet,
        uint256 weeklyLimit,
        uint256 monthlyLimit
    ) external onlyParentOf(childWallet) childExists(childWallet) {
        children[childWallet].weeklyLimit = weeklyLimit;
        children[childWallet].monthlyLimit = monthlyLimit;
        emit LimitsUpdated(childWallet, weeklyLimit, monthlyLimit);
    }

    /**
     * @notice Set category permissions for a child
     */
    function setCategory(
        address childWallet,
        string calldata category,
        bool allowed
    ) external onlyParentOf(childWallet) childExists(childWallet) {
        categoryAllowed[childWallet][category] = allowed;
        emit CategoryUpdated(childWallet, category, allowed);
    }

    /**
     * @notice Parent withdraws unused balance back
     */
    function withdrawFromChild(address childWallet, uint256 amount)
        external
        onlyParentOf(childWallet)
        childExists(childWallet)
    {
        require(children[childWallet].balance >= amount, "Insufficient balance");
        children[childWallet].balance -= amount;
        payable(msg.sender).transfer(amount);
    }

    // ─── AI Agent Functions ────────────────────────────────────────────────────

    /**
     * @notice AI agent processes a payment on behalf of child
     * @dev Only the trusted AI agent (Claude backend) can call this
     */
    function processPayment(
        address childWallet,
        address payable merchant,
        uint256 amount,
        string calldata category,
        string calldata merchantName,
        bool approved
    ) external onlyAIAgent childExists(childWallet) {
        Child storage child = children[childWallet];

        // Reset counters if time periods rolled over
        _resetIfNewWeek(child);
        _resetIfNewMonth(child);

        if (approved) {
            require(child.balance >= amount, "Insufficient balance");
            require(child.weeklySpent + amount <= child.weeklyLimit, "Weekly limit exceeded");
            require(child.monthlySpent + amount <= child.monthlyLimit, "Monthly limit exceeded");
            require(categoryAllowed[childWallet][category], "Category not allowed");

            child.balance -= amount;
            child.weeklySpent += amount;
            child.monthlySpent += amount;

            // Transfer to merchant
            merchant.transfer(amount);
        }

        transactions.push(Transaction({
            child: childWallet,
            merchant: merchant,
            amount: amount,
            category: category,
            merchantName: merchantName,
            approved: approved,
            timestamp: block.timestamp
        }));

        emit PaymentProcessed(childWallet, merchant, amount, category, approved);
    }

    // ─── View Functions ────────────────────────────────────────────────────────

    function getChild(address childWallet) external view returns (Child memory) {
        return children[childWallet];
    }

    function getAlias(address childWallet) external view returns (string memory) {
        return children[childWallet].aliasName;
    }

    /**
     * @notice Resolve alias to wallet — privacy preserved, on-chain lookup
     */
    function resolveAlias(string calldata aliasName) external view returns (address) {
        bytes32 aliasHash = keccak256(abi.encodePacked(aliasName));
        return aliasToWallet[aliasHash];
    }

    function getSpendingStats(address childWallet)
        external
        view
        returns (
            uint256 weeklySpent,
            uint256 monthlySpent,
            uint256 weeklyLimit,
            uint256 monthlyLimit,
            uint256 balance
        )
    {
        Child storage c = children[childWallet];
        return (c.weeklySpent, c.monthlySpent, c.weeklyLimit, c.monthlyLimit, c.balance);
    }

    function getParentChildren(address parent) external view returns (address[] memory) {
        return parentChildren[parent];
    }

    function getTransactionCount() external view returns (uint256) {
        return transactions.length;
    }

    function isCategoryAllowed(address childWallet, string calldata category)
        external view returns (bool)
    {
        return categoryAllowed[childWallet][category];
    }

    // ─── Admin ─────────────────────────────────────────────────────────────────

    function setAIAgent(address newAgent) external onlyOwner {
        aiAgent = newAgent;
        emit AIAgentUpdated(newAgent);
    }

    // ─── Internal ──────────────────────────────────────────────────────────────

    function _resetIfNewWeek(Child storage child) internal {
        if (block.timestamp >= child.weekStart + 7 days) {
            child.weeklySpent = 0;
            child.weekStart = block.timestamp;
        }
    }

    function _resetIfNewMonth(Child storage child) internal {
        if (block.timestamp >= child.monthStart + 30 days) {
            child.monthlySpent = 0;
            child.monthStart = block.timestamp;
        }
    }

    // Prevent accidental ETH sends to contract
    receive() external payable {
        revert("Use fundChild()");
    }
}
