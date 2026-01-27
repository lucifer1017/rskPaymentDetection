"use client";

import { useAccount, useReadContract } from "wagmi";
import { PAYMENT_ACCESS_CONTRACT_ADDRESS, PAYMENT_ACCESS_ABI } from "@/lib/contract";
import { formatEther } from "viem";
import { useEffect, useState } from "react";

export function AccessStatus() {
  const [mounted, setMounted] = useState(false);
  const { address } = useAccount();

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: hasAccess, isLoading: isLoadingAccess } = useReadContract({
    address: PAYMENT_ACCESS_CONTRACT_ADDRESS,
    abi: PAYMENT_ACCESS_ABI,
    functionName: "hasAccess",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && mounted,
    },
  });

  const { data: price, isLoading: isLoadingPrice } = useReadContract({
    address: PAYMENT_ACCESS_CONTRACT_ADDRESS,
    abi: PAYMENT_ACCESS_ABI,
    functionName: "price",
    query: {
      enabled: mounted,
    },
  });

  // Show consistent placeholder during SSR
  if (!mounted) {
    return (
      <div className="p-6 bg-secondary border border-border rounded-xl">
        <p className="text-foreground/70 text-center">
          Connect your wallet to check access status
        </p>
      </div>
    );
  }

  if (!address) {
    return (
      <div className="p-6 bg-secondary border border-border rounded-xl">
        <p className="text-foreground/70 text-center">
          Connect your wallet to check access status
        </p>
      </div>
    );
  }

  if (isLoadingAccess || isLoadingPrice) {
    return (
      <div className="p-6 bg-secondary border border-border rounded-xl">
        <div className="animate-pulse space-y-3">
          <div className="h-6 bg-border/50 rounded w-1/2"></div>
          <div className="h-4 bg-border/50 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  const priceFormatted = price ? formatEther(price) : "0";

  return (
    <div className="p-6 bg-secondary border border-border rounded-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Access Status</h3>
        <div
          className={`px-4 py-2 rounded-lg font-medium ${
            hasAccess
              ? "bg-rsk-green text-black"
              : "bg-rsk-orange/20 text-rsk-orange border border-rsk-orange"
          }`}
        >
          {hasAccess ? "✓ Access Granted" : "🔒 Access Locked"}
        </div>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-foreground/70">Payment Required:</span>
          <span className="text-foreground font-mono font-semibold">
            {priceFormatted} RBTC
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-foreground/70">Your Address:</span>
          <span className="text-foreground font-mono">
            {address.slice(0, 8)}...{address.slice(-6)}
          </span>
        </div>
      </div>
    </div>
  );
}
