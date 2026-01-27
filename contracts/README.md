# PaymentAccess Smart Contract

A minimal, non-custodial payment-gated access contract for Rootstock Testnet. The contract detects RBTC payments and grants access to users who pay the required amount.

## Contract Overview

**PaymentAccess** is a simple smart contract that:
- Accepts RBTC payments via `payForAccess()` or direct transfers
- Grants access to users who pay at least the fixed price (0.0001 tRBTC)
- Emits events for payment received and access granted
- Allows the owner to withdraw accumulated funds
- Tracks total payments per user

### Key Features
- Fixed price payment (immutable, set at deployment)
- Per-user access tracking
- Reentrancy protection
- Owner withdrawal functionality
- Event emission for all state changes

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- A wallet with Rootstock Testnet RBTC for deployment

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Fill in the required variables (see `.env.example` for details):
     - `RSK_TESTNET_RPC_URL` - Rootstock Testnet RPC endpoint
     - `PRIVATE_KEY` - Private key of the deployment account

## Testing

Run all tests:
```bash
npx hardhat test
```

The test suite covers:
- Contract deployment and initialization
- Payment processing and access granting
- Event emission verification
- Owner-only withdrawal functionality
- Edge cases (insufficient payment, additional payments, etc.)

## Deployment

### Deploy to Rootstock Testnet

1. Ensure your `.env` file is configured with:
   - `RSK_TESTNET_RPC_URL`
   - `PRIVATE_KEY` (account with testnet RBTC)

2. Deploy the contract:
```bash
npx hardhat ignition deploy ignition/modules/PaymentAccess.ts --network rskTestnet
```

3. The deployment will output:
   - Contract address
   - Transaction hash
   - Deployment artifacts in `ignition/deployments/chain-31/`

### Custom Price (Optional)

To deploy with a custom price (in wei):
```bash
npx hardhat ignition deploy ignition/modules/PaymentAccess.ts --network rskTestnet --parameters '{"PaymentAccessModule":{"price":"100000000000000"}}'
```

Default price: `100_000_000_000_000` wei (0.0001 RBTC)

## Contract Functions

### Public Functions
- `payForAccess()` - Pay for access (payable)
- `hasAccess(address)` - Check if an address has access (view)
- `price()` - Get the required payment amount (view)
- `totalPaid(address)` - Get total amount paid by an address (view)
- `contractBalance()` - Get contract's RBTC balance (view)

### Owner Functions
- `withdraw()` - Withdraw all contract funds (owner only)

### Events
- `PaymentReceived(address indexed payer, uint256 amount, uint256 newTotalPaid)`
- `AccessGranted(address indexed account, uint256 price)`
- `Withdrawn(address indexed owner, uint256 amount)`

## Project Structure

```
contracts/
├── contracts/
│   └── PaymentAccess.sol      # Main contract
├── test/
│   └── PaymentAccess.ts       # Test suite
├── ignition/
│   └── modules/
│       └── PaymentAccess.ts   # Deployment script
├── hardhat.config.ts           # Hardhat configuration
└── .env.example               # Environment variables template
```

## Network Configuration

The project is configured for **Rootstock Testnet** (Chain ID: 31). To deploy to other networks, update `hardhat.config.ts` accordingly.

