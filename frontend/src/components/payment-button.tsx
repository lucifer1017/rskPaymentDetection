"use client";

import { useAccount, useWriteContract, useWaitForTransactionReceipt, useChainId, useWatchContractEvent, useSwitchChain } from "wagmi";
import { PAYMENT_ACCESS_CONTRACT_ADDRESS, PAYMENT_ACCESS_ABI } from "@/lib/contract";
import { rootstockTestnet } from "@/lib/wagmi";
import { usePaymentAccess } from "@/lib/use-payment-access";
import { formatEther } from "viem";
import { useEffect, useState, useCallback } from "react";

const REQUIRED_CHAIN_ID = 31; // Rootstock Testnet

// Extend Window interface for ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, handler: (chainId: string) => void) => void;
      removeListener: (event: string, handler: (chainId: string) => void) => void;
    };
  }
}

export function PaymentButton() {
  const { address, isConnected, chainId: accountChainId } = useAccount();
  const wagmiChainId = useChainId();
  const { hasAccess, price, paused, refetchAccess, mounted } = usePaymentAccess();

  const { writeContract, data: hash, error, isPending, reset } = useWriteContract();
  const { switchChain, isPending: isSwitchingChain, error: switchError } = useSwitchChain();
  
  const [switchErrorState, setSwitchErrorState] = useState<string | null>(null);
  const [actualChainId, setActualChainId] = useState<number | null>(null);
  const [pendingPaymentAfterSwitch, setPendingPaymentAfterSwitch] = useState(false);

  // Get actual chain ID from wallet
  useEffect(() => {
    if (!isConnected || typeof window === 'undefined') return;

    const getActualChainId = async () => {
      try {
        if (window.ethereum) {
          const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
          const chainId = parseInt(chainIdHex, 16);
          setActualChainId(chainId);
        }
      } catch (err) {
        console.error('Error getting chain ID:', err);
      }
    };

    getActualChainId();

    // Listen for chain changes
    if (window.ethereum) {
      const handleChainChanged = (chainIdHex: string) => {
        const chainId = parseInt(chainIdHex, 16);
        setActualChainId(chainId);
      };

      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum?.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [isConnected]);

  // Use actual chain ID from wallet, fallback to account chain ID, then wagmi chain ID
  const chainId = actualChainId ?? accountChainId ?? wagmiChainId;

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  // Listen for AccessGranted event to update state immediately
  useWatchContractEvent({
    address: PAYMENT_ACCESS_CONTRACT_ADDRESS,
    abi: PAYMENT_ACCESS_ABI,
    eventName: "AccessGranted",
    onLogs: (logs) => {
      const userGranted = logs.some(
        (log) => log.args.account?.toLowerCase() === address?.toLowerCase()
      );
      if (userGranted) {
        refetchAccess();
      }
    },
    enabled: !!address && mounted && isConnected && chainId === REQUIRED_CHAIN_ID,
  });

  // Reset state when transaction is rejected, fails, or user disconnects
  useEffect(() => {
    if (error && !isPending && !isConfirming) {
      reset();
    }
  }, [error, isPending, isConfirming, reset]);

  // Clear switch error when chain changes
  useEffect(() => {
    if (chainId === REQUIRED_CHAIN_ID) {
      setSwitchErrorState(null);
    }
  }, [chainId]);

  // Automatically proceed with payment after network switch completes
  useEffect(() => {
    if (pendingPaymentAfterSwitch && chainId === REQUIRED_CHAIN_ID && !isSwitchingChain && price && address) {
      setPendingPaymentAfterSwitch(false);
      // Small delay to ensure network is fully switched
      setTimeout(() => {
        try {
          writeContract({
            address: PAYMENT_ACCESS_CONTRACT_ADDRESS,
            abi: PAYMENT_ACCESS_ABI,
            functionName: "payForAccess",
            value: price,
          });
        } catch (err) {
          console.error("Payment error after network switch:", err);
        }
      }, 500);
    }
  }, [pendingPaymentAfterSwitch, chainId, isSwitchingChain, price, address, writeContract]);

  // Fallback: Poll for access status after transaction confirmation (with exponential backoff)
  useEffect(() => {
    if (isConfirmed && address && mounted && chainId === REQUIRED_CHAIN_ID) {
      let attempt = 0;
      const maxAttempts = 5;
      const baseDelay = 1000;

      const pollWithBackoff = async () => {
        if (attempt >= maxAttempts) {
          return;
        }

        const delay = baseDelay * Math.pow(2, attempt);
        attempt++;

        setTimeout(async () => {
          const result = await refetchAccess();
          if (result.data === true) {
            return;
          }
          if (attempt < maxAttempts) {
            pollWithBackoff();
          }
        }, delay);
      };

      pollWithBackoff();
    }
  }, [isConfirmed, address, mounted, chainId, refetchAccess]);

  // Handle network switch - returns true if successful, false otherwise
  const handleSwitchNetwork = useCallback(async (): Promise<boolean> => {
    if (chainId === REQUIRED_CHAIN_ID) return true;
    
    setSwitchErrorState(null);
    try {
      await switchChain({ chainId: REQUIRED_CHAIN_ID });
      
      // Wait for the network to actually switch by polling the actual chain ID
      let attempts = 0;
      const maxAttempts = 20; // 10 seconds max wait (20 * 500ms)
      
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (typeof window !== 'undefined' && window.ethereum) {
          try {
            const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
            const currentChainId = parseInt(chainIdHex, 16);
            
            if (currentChainId === REQUIRED_CHAIN_ID) {
              setActualChainId(REQUIRED_CHAIN_ID);
              return true;
            }
          } catch (err) {
            console.error('Error checking chain ID:', err);
          }
        }
        
        attempts++;
      }
      
      // Timeout - network didn't switch
      setSwitchErrorState("Network switch timed out. Please try again.");
      return false;
    } catch (err: any) {
      console.error("Network switch error:", err);
      if (err?.code === 4902) {
        setSwitchErrorState("Rootstock Testnet is not added to your wallet. Please add it manually.");
      } else if (err?.code === 4001) {
        setSwitchErrorState("Network switch was rejected. Please try again.");
      } else {
        setSwitchErrorState(err?.message || "Failed to switch network. Please try again.");
      }
      return false;
    }
  }, [chainId, switchChain]);

  // Handle payment - switch network first if needed, then proceed ONLY after switch completes
  const handlePayment = useCallback(async () => {
    if (!price || !address) return;

    if (chainId !== REQUIRED_CHAIN_ID) {
      setPendingPaymentAfterSwitch(true);
      const switchSuccessful = await handleSwitchNetwork();
      if (!switchSuccessful) {
        setPendingPaymentAfterSwitch(false);
        return;
      }
      return;
    }

    if (chainId !== REQUIRED_CHAIN_ID) {
      setSwitchErrorState("Please switch to Rootstock Testnet first.");
      return;
    }

    try {
      writeContract({
        address: PAYMENT_ACCESS_CONTRACT_ADDRESS,
        abi: PAYMENT_ACCESS_ABI,
        functionName: "payForAccess",
        value: price,
      });
    } catch (err) {
      console.error("Payment error:", err);
    }
  }, [price, address, chainId, handleSwitchNetwork, writeContract]);

  const isLoading = isPending || isConfirming;
  const isOnCorrectNetwork = chainId === REQUIRED_CHAIN_ID;
  const showNetworkWarning = isConnected && !isOnCorrectNetwork && !isSwitchingChain;

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

  return (
    <div className="space-y-4">
      {/* Network Status Indicator */}
      {isConnected && (
        <div className={`p-3 rounded-lg border text-xs font-mono ${
          isOnCorrectNetwork 
            ? "bg-green-500/10 border-green-500/50 text-green-400" 
            : "bg-red-500/10 border-red-500/50 text-red-400"
        }`}>
          <div className="flex items-center justify-between">
            <span>Current Network:</span>
            <span className="font-semibold">
              Chain ID {chainId} {isOnCorrectNetwork ? "✓" : "✗"}
            </span>
          </div>
          <div className="mt-1 text-xs opacity-75">
            Required: Rootstock Testnet (Chain ID {REQUIRED_CHAIN_ID})
          </div>
        </div>
      )}

      {/* Network Warning - Show when on wrong network */}
      {showNetworkWarning && (
        <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
          <div className="space-y-3">
            <div>
              <p className="text-sm font-semibold text-red-400 mb-1">
                ⚠️ Wrong Network Detected
              </p>
              <p className="text-xs text-red-300 mb-2">
                You are connected to Chain ID {chainId}. This app requires Rootstock Testnet (Chain ID {REQUIRED_CHAIN_ID}).
              </p>
            </div>
            <button
              onClick={handleSwitchNetwork}
              disabled={isSwitchingChain}
              className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSwitchingChain ? "Switching Network..." : "Switch to Rootstock Testnet"}
            </button>
            {switchErrorState && (
              <p className="text-xs text-red-300 mt-2">{switchErrorState}</p>
            )}
          </div>
        </div>
      )}

      {/* Network Switching Status */}
      {isSwitchingChain && (
        <div className="p-4 bg-rsk-orange/20 border border-rsk-orange rounded-lg">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-rsk-orange border-t-transparent"></div>
            <p className="text-sm text-rsk-orange font-medium">
              Switching to Rootstock Testnet... Please confirm in your wallet
            </p>
          </div>
        </div>
      )}

      {/* Contract Paused Warning */}
      {paused && (
        <div className="p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
          <p className="text-sm text-yellow-400 font-medium">
            ⏸️ Contract is currently paused. Payments are temporarily disabled.
          </p>
        </div>
      )}

      {/* Payment Button */}
      <button
        onClick={handlePayment}
        disabled={isLoading || !price || hasAccess || paused || (!isOnCorrectNetwork && !isSwitchingChain)}
        className="w-full px-6 py-4 bg-rsk-orange hover:bg-rsk-orange/90 text-white rounded-lg font-semibold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl disabled:hover:shadow-lg"
      >
        {isSwitchingChain
          ? "Switching Network..."
          : isLoading
          ? "Processing Payment..."
          : paused
          ? "Contract Paused"
          : !isOnCorrectNetwork
          ? "Switch Network First"
          : `Pay ${priceFormatted} RBTC for Access`}
      </button>

      {/* Transaction Error */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
          <p className="text-sm text-red-400 font-medium mb-2">
            Transaction Error
          </p>
          <p className="text-xs text-red-300">
            {error.message || "Transaction failed. Please try again."}
          </p>
          {error.message?.includes("revert") && (
            <p className="text-xs text-red-300 mt-2">
              This may be due to insufficient funds, network issues, or the contract being paused.
            </p>
          )}
        </div>
      )}

      {/* Transaction Confirmed */}
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
