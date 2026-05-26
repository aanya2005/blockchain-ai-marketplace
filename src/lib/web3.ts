"use client";

import { BrowserProvider, Contract, ethers } from "ethers";
import { BASE_SEPOLIA_CHAIN_ID_HEX, BASE_SEPOLIA_PARAMS, MARKETPLACE_ABI, MARKETPLACE_CONTRACT_ADDRESS } from "@/lib/contract";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export function hasContractAddress() {
  return Boolean(MARKETPLACE_CONTRACT_ADDRESS && MARKETPLACE_CONTRACT_ADDRESS.startsWith("0x"));
}

export async function getProvider() {
  if (!window.ethereum) throw new Error("MetaMask or Coinbase Wallet is required.");
  return new BrowserProvider(window.ethereum);
}

export async function connectWallet() {
  if (!window.ethereum) throw new Error("Install MetaMask or Coinbase Wallet first.");
  await window.ethereum.request({ method: "eth_requestAccounts" });
  await ensureBaseSepolia();
  const provider = await getProvider();
  const signer = await provider.getSigner();
  return signer.getAddress();
}

export async function ensureBaseSepolia() {
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
  const provider = await getProvider();
  if (!hasContractAddress()) throw new Error("Missing NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS.");
  return new Contract(MARKETPLACE_CONTRACT_ADDRESS, MARKETPLACE_ABI, provider);
}

export async function getWriteContract() {
  const provider = await getProvider();
  const signer = await provider.getSigner();
  if (!hasContractAddress()) throw new Error("Missing NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS.");
  return new Contract(MARKETPLACE_CONTRACT_ADDRESS, MARKETPLACE_ABI, signer);
}

export { ethers };
