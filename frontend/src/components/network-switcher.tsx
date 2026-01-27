"use client";

import { useChainId, useSwitchChain, useAccount } from "wagmi";
import { rootstockTestnet } from "@/lib/wagmi";
import { useEffect, useState } from "react";

export function NetworkSwitcher() {
  const [mounted, setMounted] = useState(false);
  const [chainNotAdded, setChainNotAdded] = useState(false);
  const chainId = useChainId();
  const { isConnected } = useAccount();
  const { switchChain, isPending, error } = useSwitchChain();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-switch to Rootstock Testnet when wallet is connected and on wrong network
  useEffect(() => {
    if (!mounted || !isConnected) return;
    if (chainId === rootstockTestnet.id) return;

    // Attempt automatic switch
    switchChain(
      { chainId: rootstockTestnet.id },
      {
        onError: (err: Error & { code?: number }) => {
          // Error code 4902 means chain not added to wallet
          if (err.code === 4902) {
            setChainNotAdded(true);
          }
        },
      }
    );
  }, [mounted, isConnected, chainId, switchChain]);

  // Don't render during SSR
  if (!mounted) {
    return null;
  }

  // Already on correct network
  if (chainId === rootstockTestnet.id) {
    return null;
  }

  // Chain not added to wallet - show helpful message
  if (chainNotAdded || error) {
    return (
      <div className="p-4 bg-rsk-orange/20 border border-rsk-orange rounded-lg mb-6">
        <div className="space-y-3">
          <div>
            <p className="text-sm font-semibold text-rsk-orange mb-1">
              ⚠️ Rootstock Testnet Not Found
            </p>
            <p className="text-xs text-foreground/70 mb-2">
              Please add Rootstock Testnet to your MetaMask wallet to continue.
            </p>
          </div>
          <a
            href="https://explorer.testnet.rootstock.io/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-rsk-orange hover:bg-rsk-orange/90 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Add Rootstock Testnet to MetaMask
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
          <p className="text-xs text-foreground/50">
            After adding, refresh this page and the network will switch automatically.
          </p>
        </div>
      </div>
    );
  }

  // Attempting to switch
  return (
    <div className="p-4 bg-rsk-orange/20 border border-rsk-orange rounded-lg mb-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-rsk-orange mb-1">
            🔄 Switching Network
          </p>
          <p className="text-xs text-foreground/70">
            Please confirm the network switch in your wallet
          </p>
        </div>
        <div className="animate-spin rounded-full h-5 w-5 border-2 border-rsk-orange border-t-transparent"></div>
      </div>
    </div>
  );
}
