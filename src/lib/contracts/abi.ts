/**
 * ABI for the INFINITV8Investment ERC-1155 smart contract.
 *
 * Generated from contracts/src/INFINITV8Investment.sol.
 * Uses `as const` for full type inference with viem / wagmi.
 */
export const INFINITV8InvestmentABI = [
  // ─── Constructor ────────────────────────────────────────────────
  {
    type: "constructor",
    inputs: [
      { name: "_treasury", type: "address", internalType: "address" },
      { name: "_uri", type: "string", internalType: "string" },
    ],
    stateMutability: "nonpayable",
  },

  // ─── Investment Functions ───────────────────────────────────────
  {
    type: "function",
    name: "invest",
    inputs: [
      { name: "projectId", type: "uint256", internalType: "uint256" },
      { name: "paymentToken", type: "address", internalType: "address" },
      { name: "amount", type: "uint256", internalType: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "investETH",
    inputs: [
      { name: "projectId", type: "uint256", internalType: "uint256" },
    ],
    outputs: [],
    stateMutability: "payable",
  },

  // ─── Admin Functions ───────────────────────────────────────────
  {
    type: "function",
    name: "configureProject",
    inputs: [
      { name: "projectId", type: "uint256", internalType: "uint256" },
      { name: "minInvestment", type: "uint256", internalType: "uint256" },
      { name: "targetAmount", type: "uint256", internalType: "uint256" },
      { name: "active", type: "bool", internalType: "bool" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setProjectActive",
    inputs: [
      { name: "projectId", type: "uint256", internalType: "uint256" },
      { name: "active", type: "bool", internalType: "bool" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setTreasury",
    inputs: [
      { name: "newTreasury", type: "address", internalType: "address" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setAcceptedToken",
    inputs: [
      { name: "token", type: "address", internalType: "address" },
      { name: "accepted", type: "bool", internalType: "bool" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setEthAccepted",
    inputs: [{ name: "accepted", type: "bool", internalType: "bool" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setEthPrice",
    inputs: [
      { name: "priceUsd", type: "uint256", internalType: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setURI",
    inputs: [{ name: "newuri", type: "string", internalType: "string" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "withdrawToTreasury",
    inputs: [
      { name: "token", type: "address", internalType: "address" },
      { name: "amount", type: "uint256", internalType: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "pause",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "unpause",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },

  // ─── View / Pure Functions ─────────────────────────────────────
  {
    type: "function",
    name: "getProjectInfo",
    inputs: [
      { name: "projectId", type: "uint256", internalType: "uint256" },
    ],
    outputs: [
      { name: "active", type: "bool", internalType: "bool" },
      { name: "minInvestment", type: "uint256", internalType: "uint256" },
      { name: "totalRaised", type: "uint256", internalType: "uint256" },
      { name: "targetAmount", type: "uint256", internalType: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "treasury",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "projects",
    inputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    outputs: [
      { name: "active", type: "bool", internalType: "bool" },
      { name: "minInvestment", type: "uint256", internalType: "uint256" },
      { name: "totalRaised", type: "uint256", internalType: "uint256" },
      { name: "targetAmount", type: "uint256", internalType: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "acceptedTokens",
    inputs: [{ name: "", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "ethAccepted",
    inputs: [],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "ethPriceUsd",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "userInvestment",
    inputs: [
      { name: "", type: "address", internalType: "address" },
      { name: "", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "MANAGER_ROLE",
    inputs: [],
    outputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "TREASURY_ROLE",
    inputs: [],
    outputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
    stateMutability: "view",
  },

  // ─── ERC-1155 Standard Functions ───────────────────────────────
  {
    type: "function",
    name: "balanceOf",
    inputs: [
      { name: "account", type: "address", internalType: "address" },
      { name: "id", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "balanceOfBatch",
    inputs: [
      { name: "accounts", type: "address[]", internalType: "address[]" },
      { name: "ids", type: "uint256[]", internalType: "uint256[]" },
    ],
    outputs: [{ name: "", type: "uint256[]", internalType: "uint256[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isApprovedForAll",
    inputs: [
      { name: "account", type: "address", internalType: "address" },
      { name: "operator", type: "address", internalType: "address" },
    ],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "setApprovalForAll",
    inputs: [
      { name: "operator", type: "address", internalType: "address" },
      { name: "approved", type: "bool", internalType: "bool" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "safeTransferFrom",
    inputs: [
      { name: "from", type: "address", internalType: "address" },
      { name: "to", type: "address", internalType: "address" },
      { name: "id", type: "uint256", internalType: "uint256" },
      { name: "value", type: "uint256", internalType: "uint256" },
      { name: "data", type: "bytes", internalType: "bytes" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "safeBatchTransferFrom",
    inputs: [
      { name: "from", type: "address", internalType: "address" },
      { name: "to", type: "address", internalType: "address" },
      { name: "ids", type: "uint256[]", internalType: "uint256[]" },
      { name: "values", type: "uint256[]", internalType: "uint256[]" },
      { name: "data", type: "bytes", internalType: "bytes" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "uri",
    inputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    outputs: [{ name: "", type: "string", internalType: "string" }],
    stateMutability: "view",
  },

  // ─── AccessControl Functions ───────────────────────────────────
  {
    type: "function",
    name: "supportsInterface",
    inputs: [
      { name: "interfaceId", type: "bytes4", internalType: "bytes4" },
    ],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "hasRole",
    inputs: [
      { name: "role", type: "bytes32", internalType: "bytes32" },
      { name: "account", type: "address", internalType: "address" },
    ],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getRoleAdmin",
    inputs: [{ name: "role", type: "bytes32", internalType: "bytes32" }],
    outputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "grantRole",
    inputs: [
      { name: "role", type: "bytes32", internalType: "bytes32" },
      { name: "account", type: "address", internalType: "address" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "revokeRole",
    inputs: [
      { name: "role", type: "bytes32", internalType: "bytes32" },
      { name: "account", type: "address", internalType: "address" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "renounceRole",
    inputs: [
      { name: "role", type: "bytes32", internalType: "bytes32" },
      { name: "callerConfirmation", type: "address", internalType: "address" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "DEFAULT_ADMIN_ROLE",
    inputs: [],
    outputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
    stateMutability: "view",
  },

  // ─── Pausable Functions ────────────────────────────────────────
  {
    type: "function",
    name: "paused",
    inputs: [],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },

  // ─── Events ────────────────────────────────────────────────────
  {
    type: "event",
    name: "InvestmentMade",
    inputs: [
      { name: "investor", type: "address", indexed: true, internalType: "address" },
      { name: "projectId", type: "uint256", indexed: true, internalType: "uint256" },
      { name: "paymentToken", type: "address", indexed: false, internalType: "address" },
      { name: "paymentAmount", type: "uint256", indexed: false, internalType: "uint256" },
      { name: "usdValue", type: "uint256", indexed: false, internalType: "uint256" },
      { name: "tokensMinted", type: "uint256", indexed: false, internalType: "uint256" },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "ProjectConfigured",
    inputs: [
      { name: "projectId", type: "uint256", indexed: true, internalType: "uint256" },
      { name: "minInvestment", type: "uint256", indexed: false, internalType: "uint256" },
      { name: "targetAmount", type: "uint256", indexed: false, internalType: "uint256" },
      { name: "active", type: "bool", indexed: false, internalType: "bool" },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "TreasuryUpdated",
    inputs: [
      { name: "oldTreasury", type: "address", indexed: true, internalType: "address" },
      { name: "newTreasury", type: "address", indexed: true, internalType: "address" },
    ],
    anonymous: false,
  },

  // ─── ERC-1155 Events ──────────────────────────────────────────
  {
    type: "event",
    name: "TransferSingle",
    inputs: [
      { name: "operator", type: "address", indexed: true, internalType: "address" },
      { name: "from", type: "address", indexed: true, internalType: "address" },
      { name: "to", type: "address", indexed: true, internalType: "address" },
      { name: "id", type: "uint256", indexed: false, internalType: "uint256" },
      { name: "value", type: "uint256", indexed: false, internalType: "uint256" },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "TransferBatch",
    inputs: [
      { name: "operator", type: "address", indexed: true, internalType: "address" },
      { name: "from", type: "address", indexed: true, internalType: "address" },
      { name: "to", type: "address", indexed: true, internalType: "address" },
      { name: "ids", type: "uint256[]", indexed: false, internalType: "uint256[]" },
      { name: "values", type: "uint256[]", indexed: false, internalType: "uint256[]" },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "ApprovalForAll",
    inputs: [
      { name: "account", type: "address", indexed: true, internalType: "address" },
      { name: "operator", type: "address", indexed: true, internalType: "address" },
      { name: "approved", type: "bool", indexed: false, internalType: "bool" },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "URI",
    inputs: [
      { name: "value", type: "string", indexed: false, internalType: "string" },
      { name: "id", type: "uint256", indexed: true, internalType: "uint256" },
    ],
    anonymous: false,
  },

  // ─── AccessControl Events ─────────────────────────────────────
  {
    type: "event",
    name: "RoleGranted",
    inputs: [
      { name: "role", type: "bytes32", indexed: true, internalType: "bytes32" },
      { name: "account", type: "address", indexed: true, internalType: "address" },
      { name: "sender", type: "address", indexed: true, internalType: "address" },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "RoleRevoked",
    inputs: [
      { name: "role", type: "bytes32", indexed: true, internalType: "bytes32" },
      { name: "account", type: "address", indexed: true, internalType: "address" },
      { name: "sender", type: "address", indexed: true, internalType: "address" },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "RoleAdminChanged",
    inputs: [
      { name: "role", type: "bytes32", indexed: true, internalType: "bytes32" },
      { name: "previousAdminRole", type: "bytes32", indexed: true, internalType: "bytes32" },
      { name: "newAdminRole", type: "bytes32", indexed: true, internalType: "bytes32" },
    ],
    anonymous: false,
  },

  // ─── Pausable Events ──────────────────────────────────────────
  {
    type: "event",
    name: "Paused",
    inputs: [
      { name: "account", type: "address", indexed: false, internalType: "address" },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "Unpaused",
    inputs: [
      { name: "account", type: "address", indexed: false, internalType: "address" },
    ],
    anonymous: false,
  },

  // ─── Errors ────────────────────────────────────────────────────
  {
    type: "error",
    name: "AccessControlUnauthorizedAccount",
    inputs: [
      { name: "account", type: "address", internalType: "address" },
      { name: "neededRole", type: "bytes32", internalType: "bytes32" },
    ],
  },
  {
    type: "error",
    name: "AccessControlBadConfirmation",
    inputs: [],
  },
  {
    type: "error",
    name: "EnforcedPause",
    inputs: [],
  },
  {
    type: "error",
    name: "ExpectedPause",
    inputs: [],
  },
  {
    type: "error",
    name: "ReentrancyGuardReentrantCall",
    inputs: [],
  },
  {
    type: "error",
    name: "ERC1155InsufficientBalance",
    inputs: [
      { name: "sender", type: "address", internalType: "address" },
      { name: "balance", type: "uint256", internalType: "uint256" },
      { name: "needed", type: "uint256", internalType: "uint256" },
      { name: "tokenId", type: "uint256", internalType: "uint256" },
    ],
  },
  {
    type: "error",
    name: "ERC1155InvalidApprover",
    inputs: [
      { name: "approver", type: "address", internalType: "address" },
    ],
  },
  {
    type: "error",
    name: "ERC1155InvalidOperator",
    inputs: [
      { name: "operator", type: "address", internalType: "address" },
    ],
  },
  {
    type: "error",
    name: "ERC1155InvalidReceiver",
    inputs: [
      { name: "receiver", type: "address", internalType: "address" },
    ],
  },
  {
    type: "error",
    name: "ERC1155InvalidSender",
    inputs: [
      { name: "sender", type: "address", internalType: "address" },
    ],
  },
  {
    type: "error",
    name: "ERC1155InvalidArrayLength",
    inputs: [
      { name: "idsLength", type: "uint256", internalType: "uint256" },
      { name: "valuesLength", type: "uint256", internalType: "uint256" },
    ],
  },
  {
    type: "error",
    name: "ERC1155MissingApprovalForAll",
    inputs: [
      { name: "operator", type: "address", internalType: "address" },
      { name: "owner", type: "address", internalType: "address" },
    ],
  },
] as const;
