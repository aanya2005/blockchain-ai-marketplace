"use client";

import { useEffect, useState } from "react";
import { Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { connectWallet } from "@/lib/web3";
import { truncateAddress } from "@/lib/utils";

export function WalletButton() {
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!window.ethereum) return;
    window.ethereum.request({ method: "eth_accounts" }).then((accounts: string[]) => {
      if (accounts?.[0]) setAddress(accounts[0]);
    });
  }, []);

  async function onConnect() {
    setError("");
    setLoading(true);
    try {
      const connected = await connectWallet();
      setAddress(connected);
    } catch (err: any) {
      setError(err?.message || "Could not connect wallet.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button onClick={onConnect} disabled={loading} className="gap-2">
        <Wallet className="h-4 w-4" /> {address ? truncateAddress(address) : loading ? "Connecting..." : "Connect Wallet"}
      </Button>
      {error && <p className="max-w-xs text-right text-xs text-red-600">{error}</p>}
    </div>
  );
}
