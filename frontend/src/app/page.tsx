"use client";

import { WalletButton } from "@/components/wallet-button";
import { AccessStatus } from "@/components/access-status";
import { PaymentButton } from "@/components/payment-button";
import { NetworkSwitcher } from "@/components/network-switcher";
import { PAYMENT_ACCESS_CONTRACT_ADDRESS } from "@/lib/contract";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="mb-12">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-rsk-orange to-rsk-green bg-clip-text text-transparent">
                🔐 Rootstock Payment Access
              </h1>
              <p className="text-foreground/70">
                Non-custodial payment detection & access unlock demo
              </p>
            </div>
            <WalletButton />
          </div>

          <NetworkSwitcher />
        </header>

        <main className="space-y-6">
          <AccessStatus />

          <div className="p-6 bg-secondary border border-border rounded-xl">
            <h2 className="text-xl font-semibold mb-4 text-foreground">
              Unlock Access
            </h2>
            <p className="text-sm text-foreground/70 mb-6">
              Make a payment to unlock access to premium content or features.
              This is a proof-of-concept demo running on Rootstock Testnet.
            </p>
            <PaymentButton />
          </div>

          <div className="p-6 bg-secondary/50 border border-border rounded-xl">
            <h3 className="text-lg font-semibold mb-3 text-foreground">
              How It Works
            </h3>
            <ul className="space-y-2 text-sm text-foreground/70">
              <li className="flex items-start gap-2">
                <span className="text-rsk-orange">1.</span>
                <span>Connect your wallet (MetaMask or injected wallet)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rsk-orange">2.</span>
                <span>Ensure you're on Rootstock Testnet</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rsk-orange">3.</span>
                <span>Click "Pay" to send RBTC to the smart contract</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rsk-orange">4.</span>
                <span>
                  Once payment is confirmed, your access will be granted
                </span>
              </li>
            </ul>
          </div>

          <footer className="pt-8 border-t border-border">
            <p className="text-center text-sm text-foreground/50">
              Built for Rootstock Testnet • Contract:{" "}
              <a
                href={`https://explorer.testnet.rootstock.io/address/${PAYMENT_ACCESS_CONTRACT_ADDRESS}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs text-rsk-orange hover:underline"
              >
                {PAYMENT_ACCESS_CONTRACT_ADDRESS.slice(0, 10)}...
                {PAYMENT_ACCESS_CONTRACT_ADDRESS.slice(-8)}
              </a>
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}
