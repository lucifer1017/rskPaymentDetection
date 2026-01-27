"use client";

import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { PAYMENT_ACCESS_CONTRACT_ADDRESS, PAYMENT_ACCESS_ABI } from "@/lib/contract";
import { formatEther } from "viem";
import { useState, useEffect } from "react";

export function PaymentButton() {
  const [mounted, setMounted] = useState(false);
  const { address, isConnected } = useAccount();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: hasAccess, refetch: refetchAccess } = useReadContract({
    address: PAYMENT_ACCESS_CONTRACT_ADDRESS,
    abi: PAYMENT_ACCESS_ABI,
    functionName: "hasAccess",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && mounted,
    },
  });

  const { data: price } = useReadContract({
    address: PAYMENT_ACCESS_CONTRACT_ADDRESS,
    abi: PAYMENT_ACCESS_ABI,
    functionName: "price",
    query: {
      enabled: mounted,
    },
  });

  const { writeContract, data: hash, error, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  useEffect(() => {
    if (isConfirmed && address && mounted) {
      const timer = setTimeout(() => {
        refetchAccess();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isConfirmed, address, mounted, refetchAccess]);

  const handlePayment = async () => {
    if (!price || !address) return;

    setIsProcessing(true);
    try {
      writeContract({
        address: PAYMENT_ACCESS_CONTRACT_ADDRESS,
        abi: PAYMENT_ACCESS_ABI,
        functionName: "payForAccess",
        value: price,
      });
    } catch (err) {
      console.error("Payment error:", err);
      setIsProcessing(false);
    }
  };

  if (!mounted) {
    return (
      <div className="p-4 bg-secondary/50 border border-border rounded-lg">
        <p className="text-foreground/70 text-center text-sm">
          Connect your wallet to make a payment
        </p>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="p-4 bg-secondary/50 border border-border rounded-lg">
        <p className="text-foreground/70 text-center text-sm">
          Connect your wallet to make a payment
        </p>
      </div>
    );
  }

  if (hasAccess) {
    return (
      <div className="p-6 bg-rsk-green/10 border border-rsk-green rounded-xl">
        <div className="flex items-center gap-3">
          <div className="text-2xl">🎉</div>
          <div>
            <h3 className="font-semibold text-rsk-green mb-1">
              Access Granted!
            </h3>
            <p className="text-sm text-foreground/70">
              You have successfully unlocked access to this content.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const priceFormatted = price ? formatEther(price) : "0";
  const isLoading = isPending || isConfirming || isProcessing;

  return (
    <div className="space-y-4">
      <button
        onClick={handlePayment}
        disabled={isLoading || !price || hasAccess}
        className="w-full px-6 py-4 bg-rsk-orange hover:bg-rsk-orange/90 text-white rounded-lg font-semibold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl disabled:hover:shadow-lg"
      >
        {isLoading
          ? "Processing Payment..."
          : `Pay ${priceFormatted} RBTC for Access`}
      </button>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
          <p className="text-sm text-red-400">
            {error.message || "Transaction failed. Please try again."}
          </p>
        </div>
      )}

      {isConfirmed && !hasAccess && (
        <div className="p-4 bg-rsk-green/10 border border-rsk-green rounded-lg">
          <p className="text-sm text-rsk-green font-medium">
            ✓ Transaction confirmed! Updating access status...
          </p>
        </div>
      )}
    </div>
  );
}
