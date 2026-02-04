# PaymentAccess Frontend

Next.js frontend for the PaymentAccess smart contract on Rootstock Testnet. Users can connect their wallet, switch networks, and pay for access.

## What This Directory Contains

- **`src/app/`** - Next.js app router pages and layout
- **`src/components/`** - React components (wallet, payment, network switching)
- **`src/lib/`** - Utilities (contract ABI, Wagmi config, hooks)
- **`public/`** - Static assets

## Features

- **Wallet Connection** - Connect MetaMask or injected wallet
- **Automatic Network Switching** - Automatically switches to Rootstock Testnet (Chain ID 31) when needed
- **Payment Processing** - Pay RBTC to unlock access via smart contract
- **Real-time Status** - Shows access status, payment history, and contract state
- **Error Handling** - Handles wallet errors, network issues, and transaction failures
- **Event Listening** - Automatically updates UI when access is granted

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
   - Create `.env.local` file
   - Set `NEXT_PUBLIC_CONTRACT_ADDRESS` - Deployed PaymentAccess contract address

## Running

Development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

Build for production:
```bash
npm run build
npm start
```

## Components

- **`WalletButton`** - Connect/disconnect wallet
- **`NetworkSwitcher`** - Automatically switches to Rootstock Testnet
- **`AccessStatus`** - Displays user's access status and payment info
- **`PaymentButton`** - Handles payment transaction with automatic network switching
- **`ErrorBoundary`** - Catches and displays React errors

## Key Functionality

### Network Switching
- Automatically detects if user is on wrong network
- Prompts user to switch to Rootstock Testnet (Chain ID 31)
- Verifies network switch before proceeding with payment
- Shows network status indicator

### Payment Flow
1. User clicks "Pay for Access" button
2. If on wrong network, automatically switches to Rootstock Testnet
3. MetaMask popup appears for transaction confirmation
4. After confirmation, listens for `AccessGranted` event
5. UI updates automatically when access is granted

### State Management
- Uses Wagmi hooks for blockchain interactions
- React Query for data fetching and caching
- Custom hook `usePaymentAccess` centralizes contract reads

## Configuration

- **Wagmi Config** - Configured in `src/lib/wagmi.ts` for Rootstock Testnet
- **Contract ABI** - Defined in `src/lib/contract.ts`
- **Styling** - Tailwind CSS with Rootstock brand colors

## Network Requirements

- **Required Network**: Rootstock Testnet (Chain ID: 31)
- **Wallet**: MetaMask or any injected wallet provider
- **Currency**: tRBTC (Rootstock Testnet RBTC)
