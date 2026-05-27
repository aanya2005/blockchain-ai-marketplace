"use client";

import { BrowserProvider, Contract, ethers } from "ethers";
import { BASE_SEPOLIA_CHAIN_ID_HEX, BASE_SEPOLIA_PARAMS, MARKETPLACE_ABI, MARKETPLACE_CONTRACT_ADDRESS } from "@/lib/contract";

export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

const DEMO_ADDRESS = "0x1111111111111111111111111111111111111111";
const DEMO_SELLER = "0x2222222222222222222222222222222222222222";
const DEMO_BUYER = "0x3333333333333333333333333333333333333333";

function demoTx(label = "demo") {
  return {
    hash: `0x${label.padEnd(64, "0").slice(0, 64)}`,
    wait: async () => ({ status: 1 }),
  };
}

const demoDatasets = [
  {
    id: 1n,
    seller: DEMO_SELLER,
    title: "Labeled Urban Traffic Images",
    description: "12K street scenes with bounding boxes for vehicles, bikes, pedestrians, weather, and time-of-day metadata.",
    category: "Computer Vision",
    tags: "traffic, autonomous ai, bounding boxes",
    dataCid: "bafybeidemoDataCidOne",
    metadataCid: "bafybeidemoMetadataCidOne",
    sizeLabel: "38 GB",
    priceWei: ethers.parseEther("0.001"),
    active: true,
    createdAt: 1716200000n,
    totalSales: 8n,
  },
  {
    id: 2n,
    seller: DEMO_SELLER,
    title: "Anonymized Support Chats",
    description: "Multilingual customer support conversations cleaned for training classification and chatbot models.",
    category: "Language",
    tags: "chat, multilingual, support",
    dataCid: "bafybeidemoDataCidTwo",
    metadataCid: "bafybeidemoMetadataCidTwo",
    sizeLabel: "4.2 GB",
    priceWei: ethers.parseEther("0.0008"),
    active: true,
    createdAt: 1716300000n,
    totalSales: 5n,
  },
  {
    id: 3n,
    seller: DEMO_SELLER,
    title: "DeFi Transaction Signals",
    description: "On-chain transaction patterns tagged for anomaly and fraud detection research.",
    category: "Finance",
    tags: "defi, fraud, anomaly detection",
    dataCid: "bafybeidemoDataCidThree",
    metadataCid: "bafybeidemoMetadataCidThree",
    sizeLabel: "890 MB",
    priceWei: ethers.parseEther("0.0015"),
    active: true,
    createdAt: 1716400000n,
    totalSales: 12n,
  },
];

const demoBounties = [
  {
    id: 1n,
    creator: DEMO_BUYER,
    title: "Need 5,000 labeled MRI scans",
    description: "Submit anonymized images with labels and metadata.",
    category: "Medical",
    budgetWei: ethers.parseEther("0.002"),
    deadline: BigInt(Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60),
    active: true,
    acceptedSubmissionId: 0n,
    createdAt: 1716500000n,
  },
  {
    id: 2n,
    creator: DEMO_BUYER,
    title: "10,000 voice clips with accents",
    description: "Short speech samples from diverse speakers for ASR model training.",
    category: "Speech",
    budgetWei: ethers.parseEther("0.0014"),
    deadline: BigInt(Math.floor(Date.now() / 1000) + 21 * 24 * 60 * 60),
    active: true,
    acceptedSubmissionId: 0n,
    createdAt: 1716600000n,
  },
];

const demoSubmissions = [
  {
    id: 1n,
    bountyId: 1n,
    submitter: DEMO_ADDRESS,
    dataCid: "bafybeidemoSubmissionData",
    metadataCid: "bafybeidemoSubmissionMetadata",
    note: "Demo submission",
    accepted: false,
    createdAt: 1716700000n,
  },
];

const mockContract = {
  datasetCount: async () => BigInt(demoDatasets.length),
  purchaseCount: async () => 1n,
  bountyCount: async () => BigInt(demoBounties.length),
  platformFeesCollected: async () => ethers.parseEther("0.0001"),
  datasets: async (id: bigint | number) => demoDatasets[Number(id) - 1] || demoDatasets[0],
  bounties: async (id: bigint | number) => demoBounties[Number(id) - 1] || demoBounties[0],
  bountySubmissions: async (id: bigint | number) => demoSubmissions[Number(id) - 1] || demoSubmissions[0],
  getBountySubmissions: async (bountyId: bigint | number) => demoSubmissions.filter((s) => s.bountyId === BigInt(bountyId)).map((s) => s.id),
  getSellerDatasets: async (_seller: string) => demoDatasets.map((d) => d.id),
  getBuyerPurchases: async (_buyer: string) => [1n],
  purchases: async (_id: bigint | number) => ({
    id: 1n,
    datasetId: 1n,
    buyer: DEMO_ADDRESS,
    seller: DEMO_SELLER,
    amountWei: ethers.parseEther("0.001"),
    status: 1,
    createdAt: 1716800000n,
    resolvedAt: 0n,
  }),
  listDataset: async () => demoTx("listDataset"),
  buyDataset: async () => demoTx("buyDataset"),
  createBounty: async () => demoTx("createBounty"),
  submitBounty: async () => demoTx("submitBounty"),
  acceptBountySubmission: async () => demoTx("acceptBountySubmission"),
  releasePayment: async () => demoTx("releasePayment"),
  refundPurchase: async () => demoTx("refundPurchase"),
};

declare global {
  interface Window {
    ethereum?: any;
  }
}

export function hasContractAddress() {
  if (DEMO_MODE) return true;
  return Boolean(MARKETPLACE_CONTRACT_ADDRESS && MARKETPLACE_CONTRACT_ADDRESS.startsWith("0x"));
}

export async function getProvider() {
  if (!window.ethereum) throw new Error("MetaMask or Coinbase Wallet is required. Turn on NEXT_PUBLIC_DEMO_MODE=true to run without a wallet.");
  return new BrowserProvider(window.ethereum);
}

export async function connectWallet() {
  if (DEMO_MODE) return DEMO_ADDRESS;
  if (!window.ethereum) throw new Error("Install MetaMask or Coinbase Wallet first.");
  await window.ethereum.request({ method: "eth_requestAccounts" });
  await ensureBaseSepolia();
  const provider = await getProvider();
  const signer = await provider.getSigner();
  return signer.getAddress();
}

export async function ensureBaseSepolia() {
  if (DEMO_MODE) return;
  if (!window.ethereum) throw new Error("Wallet not found.");
  const chainId = await window.ethereum.request({ method: "eth_chainId" });
  if (chainId === BASE_SEPOLIA_CHAIN_ID_HEX) return;
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: BASE_SEPOLIA_CHAIN_ID_HEX }],
    });
  } catch (error: any) {
    if (error?.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [BASE_SEPOLIA_PARAMS],
      });
      return;
    }
    throw error;
  }
}

export async function getReadContract() {
  if (DEMO_MODE) return mockContract as any;
  const provider = await getProvider();
  if (!hasContractAddress()) throw new Error("Missing NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS.");
  return new Contract(MARKETPLACE_CONTRACT_ADDRESS, MARKETPLACE_ABI, provider);
}

export async function getWriteContract() {
  if (DEMO_MODE) return mockContract as any;
  const provider = await getProvider();
  const signer = await provider.getSigner();
  if (!hasContractAddress()) throw new Error("Missing NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS.");
  return new Contract(MARKETPLACE_CONTRACT_ADDRESS, MARKETPLACE_ABI, signer);
}

export { ethers };
