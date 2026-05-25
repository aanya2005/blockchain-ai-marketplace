"use client";

import { useState } from "react";
import {
  useActiveAccount,
  useActiveWalletChain,
  useSwitchActiveWalletChain,
} from "thirdweb/react";

import { baseSepoliaChain, baseSepoliaChainId } from "@/lib/blockchain/config";
import { createWalletLinkMessage } from "@/lib/blockchain/utils";
import { useAuth } from "@/hooks/use-auth";

type WalletLinkState = {
  status: "idle" | "signing" | "linked" | "error";
  error: string | null;
};

export function useWalletLink() {
  const account = useActiveAccount();
  const activeChain = useActiveWalletChain();
  const switchChain = useSwitchActiveWalletChain();
  const { identity } = useAuth();
  const [state, setState] = useState<WalletLinkState>({ status: "idle", error: null });

  async function linkWallet() {
    if (!identity) {
      setState({ status: "error", error: "Sign in before linking a wallet." });
      return;
    }

    if (!account) {
      setState({ status: "error", error: "Connect a wallet before linking it." });
      return;
    }

    try {
      setState({ status: "signing", error: null });

      if (activeChain?.id !== baseSepoliaChainId) {
        await switchChain(baseSepoliaChain);
      }

      const message = createWalletLinkMessage({
        userId: identity.id,
        address: account.address,
        chainId: baseSepoliaChainId,
      });
      const signature = await account.signMessage({
        message,
        chainId: baseSepoliaChainId,
      });
      const response = await fetch("/api/blockchain/link-wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: account.address,
          chainId: baseSepoliaChainId,
          message,
          signature,
        }),
      });
      const payload = (await response.json()) as {
        error?: { message?: string };
      };

      if (!response.ok) {
        throw new Error(payload.error?.message ?? "Wallet link failed.");
      }

      setState({ status: "linked", error: null });
    } catch (error) {
      setState({
        status: "error",
        error:
          error instanceof Error
            ? error.message
            : "Wallet connection or signature was rejected.",
      });
    }
  }

  return {
    ...state,
    account,
    activeChain,
    isConnected: Boolean(account),
    linkWallet,
  };
}
