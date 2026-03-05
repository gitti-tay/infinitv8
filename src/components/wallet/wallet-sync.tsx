"use client";

import { useEffect, useRef } from "react";
import { useAccount } from "wagmi";
import { useSession } from "next-auth/react";

export function WalletSync() {
  const { address, isConnected } = useAccount();
  const { data: session } = useSession();
  const lastSynced = useRef<string | null>(null);

  useEffect(() => {
    if (isConnected && address && session?.user && address !== lastSynced.current) {
      lastSynced.current = address;
      fetch("/api/user/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: address }),
      }).catch(console.error);
    }
  }, [address, isConnected, session]);

  return null;
}
