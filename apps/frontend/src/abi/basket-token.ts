export const basketTokenAbi = [
  // erc-20 reads
  {
    type: "function",
    name: "name",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
  },
  {
    type: "function",
    name: "symbol",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
  },
  {
    type: "function",
    name: "totalSupply",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  // basket reads
  {
    type: "function",
    name: "components",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        components: [
          { name: "token", type: "address" },
          { name: "feed", type: "address" },
          { name: "unitsPerShare", type: "uint256" },
        ],
      },
    ],
  },
  {
    type: "function",
    name: "sharePriceUsd",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "price", type: "uint256" }],
  },
  {
    type: "function",
    name: "balanceValueUsd",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "totalValueUsd",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "quoteMint",
    stateMutability: "view",
    inputs: [{ name: "shares", type: "uint256" }],
    outputs: [{ name: "amounts", type: "uint256[]" }],
  },
  {
    type: "function",
    name: "quoteRedeem",
    stateMutability: "view",
    inputs: [{ name: "shares", type: "uint256" }],
    outputs: [{ name: "amounts", type: "uint256[]" }],
  },
  {
    type: "function",
    name: "maxPriceAge",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  // writes
  {
    type: "function",
    name: "mint",
    stateMutability: "nonpayable",
    inputs: [
      { name: "shares", type: "uint256" },
      { name: "to", type: "address" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "redeem",
    stateMutability: "nonpayable",
    inputs: [
      { name: "shares", type: "uint256" },
      { name: "to", type: "address" },
    ],
    outputs: [],
  },
  // events
  {
    type: "event",
    name: "Minted",
    inputs: [
      { name: "sender", type: "address", indexed: true },
      { name: "to", type: "address", indexed: true },
      { name: "shares", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "Redeemed",
    inputs: [
      { name: "sender", type: "address", indexed: true },
      { name: "to", type: "address", indexed: true },
      { name: "shares", type: "uint256", indexed: false },
    ],
  },
] as const;
