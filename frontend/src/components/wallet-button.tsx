"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useEffect, useState } from "react";

export function WalletButton() {
  const [mounted, setMounted] = useState(false);
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  // Ensure component only renders wallet UI after client-side hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Show loading state during SSR and initial client render
  if (!mounted) {
    return (
      <div className="px-6 py-3 bg-simple-button/50 border border-border rounded-lg animate-pulse">
        <div className="h-5 w-32 bg-border/50 rounded"></div>
      </div>
    );
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3">
        <div className="px-4 py-2 bg-secondary border border-border rounded-lg">
          <span className="text-sm text-foreground font-mono">
            {address.slice(0, 6)}...{address.slice(-4)}
          </span>
        </div>
        <button
          onClick={() => disconnect()}
          className="px-4 py-2 bg-simple-button hover:bg-simple-button/80 text-white rounded-lg transition-colors border border-border"
        >
          Disconnect
        </button>
      </div>
    );
  }

  // Filter to only show MetaMask connector (prioritize MetaMask-specific connector, fallback to injected)
  const metaMaskConnector =
    connectors.find(
      (connector) =>
        connector.name.toLowerCase().includes("metamask") ||
        connector.id === "metaMaskSDK"
    ) || connectors.find((connector) => connector.id === "injected");

  if (!metaMaskConnector) {
    return (
      <button
        disabled
        className="px-6 py-3 bg-simple-button/50 text-white/50 rounded-lg border border-border cursor-not-allowed font-medium"
      >
        MetaMask not found
      </button>
    );
  }

  return (
    <button
      onClick={() => connect({ connector: metaMaskConnector })}
      disabled={isPending}
      className="px-6 py-3 bg-simple-button hover:bg-simple-button/80 text-white rounded-lg transition-colors border border-border disabled:opacity-50 disabled:cursor-not-allowed font-medium"
    >
      {isPending ? "Connecting..." : "Connect MetaMask"}
    </button>
  );
}
