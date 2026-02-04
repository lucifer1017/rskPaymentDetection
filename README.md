# Rootstock Payment Detection & Access Unlock Demo

A proof-of-concept demonstrating payment detection and access unlocking on Rootstock Testnet. Users pay RBTC to a smart contract to gain access, and the frontend displays their access status.

## 🎯 Project Overview

Two main components:

1. **Smart Contract** (`contracts/`) - Solidity contract that accepts RBTC payments and grants access
2. **Frontend** (`frontend/`) - Next.js app for wallet connection, payments, and access status

## 🔄 Project Flow

1. **User connects wallet** → MetaMask connects to Rootstock Testnet
2. **Network switching** → Frontend automatically switches to Rootstock Testnet (Chain ID 31) if needed
3. **Access check** → Frontend queries contract to check if user has access
4. **Payment** → User clicks "Pay" button, sends 0.0001 tRBTC to contract
5. **Transaction** → Contract receives payment, emits events, grants access
6. **UI update** → Frontend listens for events and updates access status automatically

### Smart Contract

- Fixed price: 0.0001 tRBTC (set at deployment)
- Tracks access per address
- Emits `PaymentReceived` and `AccessGranted` events
- Owner can withdraw funds and pause/unpause contract

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

5. **Configure frontend contract address**
   - Create `.env.local` in `frontend/` directory:
     ```
     NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourContractAddress
     ```
   - Use the address from step 4 deployment output

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

- **[Contracts README](https://github.com/lucifer1017/rskPaymentDetection/blob/main/contracts/README.md)** - Contract documentation, testing, and deployment
- **[Frontend README](https://github.com/lucifer1017/rskPaymentDetection/blob/main/frontend/README.md)** - Frontend setup and component overview


## 🔑 Key Features

- **Non-custodial** - Users control their own funds
- **OpenZeppelin libraries** - Uses Ownable, ReentrancyGuard, and Pausable
- **Emergency pause** - Owner can pause/unpause the contract
- **Event-driven updates** - Frontend listens for contract events
- **Automatic network switching** - Switches to Rootstock Testnet when needed
- **Error handling** - Handles wallet errors and transaction failures

> **Note**: This contract uses OpenZeppelin libraries but has not been formally audited. Security review recommended before mainnet deployment.

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
