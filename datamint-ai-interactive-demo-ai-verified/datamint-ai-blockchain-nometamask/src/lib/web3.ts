"use client";

import { BrowserProvider, Contract, ethers } from "ethers";
import { BASE_SEPOLIA_CHAIN_ID_HEX, BASE_SEPOLIA_PARAMS, MARKETPLACE_ABI, MARKETPLACE_CONTRACT_ADDRESS } from "@/lib/contract";

export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

const DEMO_STORE_KEY = "datamint-ai-demo-store-v2";
const DEMO_ADDRESS = "0x1111111111111111111111111111111111111111";
const DEMO_SELLER = DEMO_ADDRESS;
const DEMO_BUYER = DEMO_ADDRESS;

type StoredDataset = {
  id: string;
  seller: string;
  title: string;
  description: string;
  category: string;
  tags: string;
  dataCid: string;
  metadataCid: string;
  sizeLabel: string;
  priceWei: string;
  active: boolean;
  createdAt: string;
  totalSales: string;
};

type StoredBounty = {
  id: string;
  creator: string;
  title: string;
  description: string;
  category: string;
  budgetWei: string;
  deadline: string;
  active: boolean;
  acceptedSubmissionId: string;
  createdAt: string;
};

type StoredSubmission = {
  id: string;
  bountyId: string;
  submitter: string;
  dataCid: string;
  metadataCid: string;
  note: string;
  accepted: boolean;
  createdAt: string;
};

type StoredPurchase = {
  id: string;
  datasetId: string;
  buyer: string;
  seller: string;
  amountWei: string;
  status: number;
  createdAt: string;
  resolvedAt: string;
};

type DemoStore = {
  datasets: StoredDataset[];
  bounties: StoredBounty[];
  submissions: StoredSubmission[];
  purchases: StoredPurchase[];
};

function nowSec() {
  return Math.floor(Date.now() / 1000).toString();
}

function makeHash(label = "demo") {
  const labelHex = [...label].map((char) => char.charCodeAt(0).toString(16)).join("");
  const randomHex = `${Date.now().toString(16)}${Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(16)}`;
  return `0x${`${labelHex}${randomHex}`.padEnd(64, "0").slice(0, 64)}`;
}

function demoTx(label = "demo") {
  return {
    hash: makeHash(label),
    wait: async () => ({ status: 1 }),
  };
}

const starterStore: DemoStore = {
  datasets: [
    {
      id: "1",
      seller: DEMO_SELLER,
      title: "Labeled Urban Traffic Images",
      description: "12K street scenes with bounding boxes for vehicles, bikes, pedestrians, weather, and time-of-day metadata.",
      category: "Computer Vision",
      tags: "traffic, autonomous ai, bounding boxes",
      dataCid: "bafybeidemoDataCidOne",
      metadataCid: "bafybeidemoMetadataCidOne",
      sizeLabel: "38 GB",
      priceWei: ethers.parseEther("0.001").toString(),
      active: true,
      createdAt: "1716200000",
      totalSales: "8",
    },
    {
      id: "2",
      seller: DEMO_SELLER,
      title: "Anonymized Support Chats",
      description: "Multilingual customer support conversations cleaned for training classification and chatbot models.",
      category: "Language",
      tags: "chat, multilingual, support",
      dataCid: "bafybeidemoDataCidTwo",
      metadataCid: "bafybeidemoMetadataCidTwo",
      sizeLabel: "4.2 GB",
      priceWei: ethers.parseEther("0.0008").toString(),
      active: true,
      createdAt: "1716300000",
      totalSales: "5",
    },
    {
      id: "3",
      seller: DEMO_SELLER,
      title: "DeFi Transaction Signals",
      description: "On-chain transaction patterns tagged for anomaly and fraud detection research.",
      category: "Finance",
      tags: "defi, fraud, anomaly detection",
      dataCid: "bafybeidemoDataCidThree",
      metadataCid: "bafybeidemoMetadataCidThree",
      sizeLabel: "890 MB",
      priceWei: ethers.parseEther("0.0015").toString(),
      active: true,
      createdAt: "1716400000",
      totalSales: "12",
    },
  ],
  bounties: [
    {
      id: "1",
      creator: DEMO_BUYER,
      title: "Need 5,000 labeled MRI scans",
      description: "Submit anonymized images with labels and metadata.",
      category: "Medical",
      budgetWei: ethers.parseEther("0.002").toString(),
      deadline: String(Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60),
      active: true,
      acceptedSubmissionId: "0",
      createdAt: "1716500000",
    },
    {
      id: "2",
      creator: DEMO_BUYER,
      title: "10,000 voice clips with accents",
      description: "Short speech samples from diverse speakers for ASR model training.",
      category: "Speech",
      budgetWei: ethers.parseEther("0.0014").toString(),
      deadline: String(Math.floor(Date.now() / 1000) + 21 * 24 * 60 * 60),
      active: true,
      acceptedSubmissionId: "0",
      createdAt: "1716600000",
    },
  ],
  submissions: [
    {
      id: "1",
      bountyId: "1",
      submitter: DEMO_ADDRESS,
      dataCid: "bafybeidemoSubmissionData",
      metadataCid: "bafybeidemoSubmissionMetadata",
      note: "Demo submission",
      accepted: false,
      createdAt: "1716700000",
    },
  ],
  purchases: [
    {
      id: "1",
      datasetId: "1",
      buyer: DEMO_ADDRESS,
      seller: DEMO_SELLER,
      amountWei: ethers.parseEther("0.001").toString(),
      status: 1,
      createdAt: "1716800000",
      resolvedAt: "0",
    },
  ],
};

function cloneStarterStore(): DemoStore {
  return JSON.parse(JSON.stringify(starterStore));
}

function loadDemoStore(): DemoStore {
  if (typeof window === "undefined") return cloneStarterStore();

  const raw = window.localStorage.getItem(DEMO_STORE_KEY);
  if (!raw) {
    const initial = cloneStarterStore();
    window.localStorage.setItem(DEMO_STORE_KEY, JSON.stringify(initial));
    return initial;
  }

  try {
    const parsed = JSON.parse(raw) as DemoStore;
    if (!Array.isArray(parsed.datasets) || !Array.isArray(parsed.bounties) || !Array.isArray(parsed.submissions) || !Array.isArray(parsed.purchases)) {
      throw new Error("Invalid demo store");
    }
    return parsed;
  } catch {
    const initial = cloneStarterStore();
    window.localStorage.setItem(DEMO_STORE_KEY, JSON.stringify(initial));
    return initial;
  }
}

function saveDemoStore(store: DemoStore) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DEMO_STORE_KEY, JSON.stringify(store));
  window.dispatchEvent(new Event("datamint-demo-store-updated"));
}

function toDataset(dataset: StoredDataset) {
  return {
    ...dataset,
    id: BigInt(dataset.id),
    priceWei: BigInt(dataset.priceWei),
    createdAt: BigInt(dataset.createdAt),
    totalSales: BigInt(dataset.totalSales),
  };
}

function toBounty(bounty: StoredBounty) {
  return {
    ...bounty,
    id: BigInt(bounty.id),
    budgetWei: BigInt(bounty.budgetWei),
    deadline: BigInt(bounty.deadline),
    acceptedSubmissionId: BigInt(bounty.acceptedSubmissionId),
    createdAt: BigInt(bounty.createdAt),
  };
}

function toSubmission(submission: StoredSubmission) {
  return {
    ...submission,
    id: BigInt(submission.id),
    bountyId: BigInt(submission.bountyId),
    createdAt: BigInt(submission.createdAt),
  };
}

function toPurchase(purchase: StoredPurchase) {
  return {
    ...purchase,
    id: BigInt(purchase.id),
    datasetId: BigInt(purchase.datasetId),
    amountWei: BigInt(purchase.amountWei),
    createdAt: BigInt(purchase.createdAt),
    resolvedAt: BigInt(purchase.resolvedAt),
  };
}

function nextId(items: Array<{ id: string }>) {
  return String(items.reduce((max, item) => Math.max(max, Number(item.id)), 0) + 1);
}

function sameAddress(a: string, b: string) {
  return a.toLowerCase() === b.toLowerCase();
}

const mockContract = {
  datasetCount: async () => BigInt(loadDemoStore().datasets.length),
  purchaseCount: async () => BigInt(loadDemoStore().purchases.length),
  bountyCount: async () => BigInt(loadDemoStore().bounties.length),
  platformFeesCollected: async () => ethers.parseEther("0.0001"),

  datasets: async (id: bigint | number | string) => {
    const store = loadDemoStore();
    const dataset = store.datasets.find((item) => item.id === String(id)) || store.datasets[0];
    return toDataset(dataset);
  },

  bounties: async (id: bigint | number | string) => {
    const store = loadDemoStore();
    const bounty = store.bounties.find((item) => item.id === String(id)) || store.bounties[0];
    return toBounty(bounty);
  },

  bountySubmissions: async (id: bigint | number | string) => {
    const store = loadDemoStore();
    const submission = store.submissions.find((item) => item.id === String(id)) || store.submissions[0];
    return toSubmission(submission);
  },

  getBountySubmissions: async (bountyId: bigint | number | string) => {
    const store = loadDemoStore();
    return store.submissions.filter((item) => item.bountyId === String(bountyId)).map((item) => BigInt(item.id));
  },

  getSellerDatasets: async (seller: string) => {
    const store = loadDemoStore();
    return store.datasets.filter((item) => sameAddress(item.seller, seller)).map((item) => BigInt(item.id));
  },

  getBuyerPurchases: async (buyer: string) => {
    const store = loadDemoStore();
    return store.purchases.filter((item) => sameAddress(item.buyer, buyer)).map((item) => BigInt(item.id));
  },

  purchases: async (id: bigint | number | string) => {
    const store = loadDemoStore();
    const purchase = store.purchases.find((item) => item.id === String(id)) || store.purchases[0];
    return toPurchase(purchase);
  },

  listDataset: async (
    title: string,
    description: string,
    category: string,
    tags: string,
    dataCid: string,
    metadataCid: string,
    sizeLabel: string,
    priceWei: bigint,
  ) => {
    const store = loadDemoStore();
    const id = nextId(store.datasets);
    store.datasets.push({
      id,
      seller: DEMO_ADDRESS,
      title,
      description,
      category,
      tags,
      dataCid,
      metadataCid,
      sizeLabel,
      priceWei: priceWei.toString(),
      active: true,
      createdAt: nowSec(),
      totalSales: "0",
    });
    saveDemoStore(store);
    return demoTx(`list-dataset-${id}`);
  },

  buyDataset: async (datasetId: bigint | number | string) => {
    const store = loadDemoStore();
    const dataset = store.datasets.find((item) => item.id === String(datasetId));
    if (!dataset) throw new Error("Dataset not found.");

    const id = nextId(store.purchases);
    store.purchases.push({
      id,
      datasetId: dataset.id,
      buyer: DEMO_ADDRESS,
      seller: dataset.seller,
      amountWei: dataset.priceWei,
      status: 1,
      createdAt: nowSec(),
      resolvedAt: "0",
    });
    dataset.totalSales = String(Number(dataset.totalSales) + 1);
    saveDemoStore(store);
    return demoTx(`buy-dataset-${dataset.id}`);
  },

  createBounty: async (title: string, description: string, category: string, deadline: number | bigint, options?: { value?: bigint }) => {
    const store = loadDemoStore();
    const id = nextId(store.bounties);
    store.bounties.push({
      id,
      creator: DEMO_ADDRESS,
      title,
      description,
      category,
      budgetWei: (options?.value || 0n).toString(),
      deadline: String(deadline),
      active: true,
      acceptedSubmissionId: "0",
      createdAt: nowSec(),
    });
    saveDemoStore(store);
    return demoTx(`create-bounty-${id}`);
  },

  submitBounty: async (bountyId: bigint | number | string, dataCid: string, metadataCid: string, note: string) => {
    const store = loadDemoStore();
    const bounty = store.bounties.find((item) => item.id === String(bountyId));
    if (!bounty) throw new Error("Bounty not found.");
    if (!bounty.active) throw new Error("Bounty is already closed.");

    const id = nextId(store.submissions);
    store.submissions.push({
      id,
      bountyId: bounty.id,
      submitter: DEMO_ADDRESS,
      dataCid,
      metadataCid,
      note,
      accepted: false,
      createdAt: nowSec(),
    });
    saveDemoStore(store);
    return demoTx(`submit-bounty-${bounty.id}-${id}`);
  },

  acceptBountySubmission: async (bountyId: bigint | number | string, submissionId: bigint | number | string) => {
    const store = loadDemoStore();
    const bounty = store.bounties.find((item) => item.id === String(bountyId));
    const submission = store.submissions.find((item) => item.id === String(submissionId));
    if (!bounty) throw new Error("Bounty not found.");
    if (!submission) throw new Error("Submission not found.");

    bounty.active = false;
    bounty.acceptedSubmissionId = submission.id;
    submission.accepted = true;
    saveDemoStore(store);
    return demoTx(`accept-bounty-${bounty.id}-${submission.id}`);
  },

  releasePayment: async (purchaseId: bigint | number | string) => {
    const store = loadDemoStore();
    const purchase = store.purchases.find((item) => item.id === String(purchaseId));
    if (!purchase) throw new Error("Purchase not found.");
    purchase.status = 2;
    purchase.resolvedAt = nowSec();
    saveDemoStore(store);
    return demoTx(`release-payment-${purchase.id}`);
  },

  refundPurchase: async (purchaseId: bigint | number | string) => {
    const store = loadDemoStore();
    const purchase = store.purchases.find((item) => item.id === String(purchaseId));
    if (!purchase) throw new Error("Purchase not found.");
    purchase.status = 3;
    purchase.resolvedAt = nowSec();
    saveDemoStore(store);
    return demoTx(`refund-purchase-${purchase.id}`);
  },
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

export function resetDemoData() {
  if (typeof window === "undefined") return;
  saveDemoStore(cloneStarterStore());
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
