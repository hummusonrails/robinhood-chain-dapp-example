export const basketFactoryAbi = [
  // reads
  {
    type: "function",
    name: "allBaskets",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "address[]" }],
  },
  {
    type: "function",
    name: "basketCount",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "basketAt",
    stateMutability: "view",
    inputs: [{ name: "index", type: "uint256" }],
    outputs: [{ name: "", type: "address" }],
  },
  {
    type: "function",
    name: "isBasket",
    stateMutability: "view",
    inputs: [{ name: "basket", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
  },
  // writes
  {
    type: "function",
    name: "createBasket",
    stateMutability: "nonpayable",
    inputs: [
      { name: "name", type: "string" },
      { name: "symbol", type: "string" },
      {
        name: "components",
        type: "tuple[]",
        components: [
          { name: "token", type: "address" },
          { name: "feed", type: "address" },
          { name: "unitsPerShare", type: "uint256" },
        ],
      },
      { name: "maxPriceAge", type: "uint256" },
    ],
    outputs: [{ name: "basket", type: "address" }],
  },
  // events
  {
    type: "event",
    name: "BasketCreated",
    inputs: [
      { name: "basket", type: "address", indexed: true },
      { name: "creator", type: "address", indexed: true },
      { name: "name", type: "string", indexed: false },
      { name: "symbol", type: "string", indexed: false },
    ],
  },
] as const;
