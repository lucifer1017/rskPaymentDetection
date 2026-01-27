# Rootstock Payment Detection & Access Unlock Demo

A minimal, non-custodial proof-of-concept demonstrating how a Rootstock smart contract can detect RBTC payments and unlock access to content or features. This project showcases payment confirmation logic without building a full payment system.

## 🎯 Project Overview

This demo consists of two main components:

1. **Smart Contract** (`contracts/`) - A Solidity contract deployed on Rootstock Testnet that handles payment detection and access management
2. **Frontend** (`frontend/`) - A Next.js web application that interacts with the contract, allowing users to connect wallets, make payments, and view access status

## 🔄 How It Works

### Payment Flow

1. **User connects wallet** → MetaMask or injected wallet connects to Rootstock Testnet
2. **Network verification** → Frontend automatically switches to Rootstock Testnet (or prompts user to add it)
3. **Access check** → Frontend queries the contract to check if the user already has access
4. **Payment** → User clicks "Pay" button, sending 0.0001 tRBTC to the contract
5. **Transaction confirmation** → Contract receives payment, emits events, and grants access
6. **Access granted** → Frontend automatically updates to show unlocked status

### Smart Contract Logic

- **Fixed Price**: Contract requires exactly 0.0001 tRBTC (configurable at deployment)
- **Access Tracking**: Each address's access status is stored in a mapping
- **Event Emission**: Contract emits `PaymentReceived` and `AccessGranted` events
- **Owner Withdrawal**: Contract owner can withdraw accumulated funds

## 📁 Project Structure

```
rskPaymentDetection/
├── contracts/              # Smart contract code
│   ├── contracts/
│   │   └── PaymentAccess.sol    # Main contract
│   ├── test/
│   │   └── PaymentAccess.ts     # Test suite
│   ├── ignition/
│   │   └── modules/
│   │       └── PaymentAccess.ts  # Deployment script
│   └── README.md                # Contract documentation
│
├── frontend/               # Next.js frontend
│   ├── src/
│   │   ├── app/                  # Next.js app router
│   │   ├── components/           # React components
│   │   │   ├── wallet-button.tsx
│   │   │   ├── access-status.tsx
│   │   │   ├── payment-button.tsx
│   │   │   └── network-switcher.tsx
│   │   └── lib/                  # Utilities
│   │       ├── contract.ts       # Contract ABI & address
│   │       ├── wagmi.ts          # Wagmi configuration
│   │       └── colors.ts         # Rootstock theme colors
│   └── README.md
│
└── README.md              # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v18+)
- npm or yarn
- MetaMask or compatible wallet
- Rootstock Testnet RBTC (for testing)

### Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd rskPaymentDetection
```

2. **Set up contracts**
```bash
cd contracts
npm install
cp .env.example .env
# Edit .env with your RSK_TESTNET_RPC_URL and PRIVATE_KEY
```

3. **Set up frontend**
```bash
cd ../frontend
npm install
```

4. **Deploy contract** (if not already deployed)
```bash
cd ../contracts
npx hardhat ignition deploy ignition/modules/PaymentAccess.ts --network rskTestnet
```

5. **Update frontend contract address**
   - Copy the deployed contract address
   - Update `frontend/src/lib/contract.ts` with the new address
   - Copy the ABI from `contracts/ignition/deployments/chain-31/artifacts/PaymentAccessModule#PaymentAccess.json`

6. **Run frontend**
```bash
cd ../frontend
npm run dev
```

7. **Open browser**
   - Navigate to `http://localhost:3000`
   - Connect your MetaMask wallet
   - Ensure you're on Rootstock Testnet
   - Make a payment to unlock access

## 🧪 Testing

### Contract Tests
```bash
cd contracts
npx hardhat test
```

### Frontend Development
```bash
cd frontend
npm run dev
```

## 📚 Documentation

- **[Contracts README](https://github.com/lucifer1017/rskPaymentDetection/blob/main/contracts/README.md)** - Detailed contract documentation, deployment guide, and API reference


## 🔑 Key Features

- ✅ **Non-custodial** - Users control their own funds
- ✅ **Minimal** - Simple, focused proof-of-concept
- ✅ **Event-driven** - Real-time updates via contract events
- ✅ **Production-grade** - Proper error handling, reentrancy protection, and security best practices
- ✅ **Testnet-ready** - Configured for Rootstock Testnet

## 🌐 Network

- **Network**: Rootstock Testnet
- **Chain ID**: 31
- **Currency**: tRBTC (Testnet RBTC)
- **RPC**: `https://public-node.testnet.rsk.co`
- **Explorer**: `https://explorer.testnet.rootstock.io`

## 📝 Scope

**In Scope:**
- Single contract with fixed RBTC payment amount
- Payment detection and access unlocking
- Simple frontend showing locked/unlocked state
- Testnet-focused demo

**Out of Scope:**
- Subscriptions
- Refunds
- Streaming payments
- Custody solutions
- External payment APIs

## 🛠️ Tech Stack

**Smart Contracts:**
- Solidity ^0.8.24
- Hardhat ^3.1.5
- Viem ^2.45.0
- Hardhat Ignition

**Frontend:**
- Next.js 16
- React 19
- Wagmi ^3.4.1
- Tailwind CSS v4
- TypeScript

## 📄 License

MIT
