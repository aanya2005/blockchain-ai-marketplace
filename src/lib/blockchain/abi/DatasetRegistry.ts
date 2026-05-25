export const DatasetRegistryAbi = [
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "datasetId",
        type: "bytes32",
      },
    ],
    name: "DatasetAlreadyRegistered",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "datasetId",
        type: "bytes32",
      },
    ],
    name: "DatasetNotRegistered",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidCid",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidDatasetHash",
    type: "error",
  },
  {
    inputs: [],
    name: "UnauthorizedDatasetOwner",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "datasetId",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "DatasetDeactivated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "datasetId",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "datasetHash",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "string",
        name: "cid",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "metadataUri",
        type: "string",
      },
    ],
    name: "DatasetRegistered",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "datasetId",
        type: "bytes32",
      },
    ],
    name: "deactivateDataset",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "datasetId",
        type: "bytes32",
      },
    ],
    name: "getDataset",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "owner",
            type: "address",
          },
          {
            internalType: "bytes32",
            name: "datasetHash",
            type: "bytes32",
          },
          {
            internalType: "string",
            name: "cid",
            type: "string",
          },
          {
            internalType: "string",
            name: "metadataUri",
            type: "string",
          },
          {
            internalType: "uint256",
            name: "registeredAt",
            type: "uint256",
          },
          {
            internalType: "bool",
            name: "active",
            type: "bool",
          },
        ],
        internalType: "struct DatasetRegistry.DatasetRecord",
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
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "getOwnerDatasets",
    outputs: [
      {
        internalType: "bytes32[]",
        name: "",
        type: "bytes32[]",
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
        internalType: "bytes32",
        name: "datasetHash",
        type: "bytes32",
      },
      {
        internalType: "string",
        name: "cid",
        type: "string",
      },
      {
        internalType: "string",
        name: "metadataUri",
        type: "string",
      },
    ],
    name: "registerDataset",
    outputs: [],
    stateMutability: "nonpayable",
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
        name: "expectedOwner",
        type: "address",
      },
    ],
    name: "verifyOwnership",
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
] as const;
