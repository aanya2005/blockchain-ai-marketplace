export const DatasetEscrowAbi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "registryAddress",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "datasetId",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "buyer",
        type: "address",
      },
    ],
    name: "DuplicatePurchase",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidAmount",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidRegistry",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidSeller",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "purchaseId",
        type: "bytes32",
      },
    ],
    name: "PurchaseNotFunded",
    type: "error",
  },
  {
    inputs: [],
    name: "TransferFailed",
    type: "error",
  },
  {
    inputs: [],
    name: "UnauthorizedSeller",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "purchaseId",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "datasetId",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "buyer",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "seller",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "PurchaseFunded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "purchaseId",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "datasetId",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "buyer",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "PurchaseRefunded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "purchaseId",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "datasetId",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "buyer",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "seller",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "PurchaseReleased",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "datasetId",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "seller",
        type: "address",
      },
    ],
    name: "fundPurchase",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "purchaseId",
        type: "bytes32",
      },
    ],
    name: "getPurchase",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "buyer",
            type: "address",
          },
          {
            internalType: "address",
            name: "seller",
            type: "address",
          },
          {
            internalType: "bytes32",
            name: "datasetId",
            type: "bytes32",
          },
          {
            internalType: "uint256",
            name: "amount",
            type: "uint256",
          },
          {
            internalType: "enum DatasetEscrow.PurchaseStatus",
            name: "status",
            type: "uint8",
          },
          {
            internalType: "uint256",
            name: "createdAt",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "releasedAt",
            type: "uint256",
          },
        ],
        internalType: "struct DatasetEscrow.Purchase",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "datasetId",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "buyer",
        type: "address",
      },
    ],
    name: "hasPurchased",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "registry",
    outputs: [
      {
        internalType: "contract IDatasetRegistry",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "purchaseId",
        type: "bytes32",
      },
    ],
    name: "releasePurchase",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;
