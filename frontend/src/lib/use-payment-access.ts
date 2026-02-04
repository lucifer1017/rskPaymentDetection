import { useAccount, useReadContract } from "wagmi";
import { PAYMENT_ACCESS_CONTRACT_ADDRESS, PAYMENT_ACCESS_ABI } from "@/lib/contract";
import { useEffect, useState } from "react";

/**
 * Custom hook to centralize contract reads for payment access.
 * This eliminates duplicate network calls and ensures consistent state across components.
 */
export function usePaymentAccess() {
  const [mounted, setMounted] = useState(false);
  const { address } = useAccount();

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: hasAccess, isLoading: isLoadingAccess, refetch: refetchAccess } = useReadContract({
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

  const { data: paused, isLoading: isLoadingPaused } = useReadContract({
    address: PAYMENT_ACCESS_CONTRACT_ADDRESS,
    abi: PAYMENT_ACCESS_ABI,
    functionName: "paused",
    query: {
      enabled: mounted,
    },
  });

  return {
    hasAccess: hasAccess ?? false,
    price: price ?? BigInt(0),
    paused: paused ?? false,
    isLoading: isLoadingAccess || isLoadingPrice || isLoadingPaused,
    refetchAccess,
    mounted,
    address,
  };
}
