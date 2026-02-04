# PaymentAccess Smart Contract

A non-custodial payment-gated access contract for Rootstock Testnet. Users pay RBTC to gain access, and the contract tracks payments and access status.

## What This Directory Contains

- **`contracts/PaymentAccess.sol`** - Main smart contract
- **`test/PaymentAccess.ts`** - Test suite
- **`ignition/modules/PaymentAccess.ts`** - Deployment script
- **`hardhat.config.ts`** - Hardhat configuration for Rootstock Testnet

## Contract Overview

**PaymentAccess** is a single smart contract that:
- Accepts RBTC payments via `payForAccess()` or direct transfers
- Grants access to users who pay at least the fixed price (0.0001 tRBTC)
- Tracks total payments per user
- Allows owner to withdraw funds, pause/unpause the contract

### Security Features
- Uses OpenZeppelin's `Ownable` for access control
- Uses OpenZeppelin's `ReentrancyGuard` for reentrancy protection
- Uses OpenZeppelin's `Pausable` for emergency pause functionality

> **Note**: This contract uses OpenZeppelin libraries but has not been formally audited.

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Set `RSK_TESTNET_RPC_URL` - Rootstock Testnet RPC endpoint
   - Set `PRIVATE_KEY` - Private key of the deployment account

## Compiling

Compile the contract:
```bash
npx hardhat compile
```

## Testing

Run all tests:
```bash
npx hardhat test
```

The test suite covers:
- Contract deployment and initialization
- Payment processing and access granting
- Event emission
- Owner-only functions (withdraw, pause, unpause)
- Edge cases (insufficient payment, additional payments)

## Deployment

Deploy to Rootstock Testnet:
```bash
npx hardhat ignition deploy ignition/modules/PaymentAccess.ts --network rskTestnet
```

Default price: `100_000_000_000_000` wei (0.0001 RBTC)

To deploy with a custom price:
```bash
npx hardhat ignition deploy ignition/modules/PaymentAccess.ts --network rskTestnet --parameters '{"PaymentAccessModule":{"price":"100000000000000"}}'
```

Deployment artifacts are saved in `ignition/deployments/chain-31/`

## Contract Functions

### Public Functions
- `payForAccess()` - Pay for access (payable)
- `hasAccess(address)` - Check if an address has access (view)
- `price()` - Get the required payment amount (view)
- `totalPaid(address)` - Get total amount paid by an address (view)
- `contractBalance()` - Get contract's RBTC balance (view)
- `paused()` - Check if contract is paused (view)

### Owner Functions
- `withdraw()` - Withdraw all contract funds
- `pause()` - Pause the contract (prevents new payments)
- `unpause()` - Unpause the contract
- `transferOwnership(address)` - Transfer ownership
- `renounceOwnership()` - Renounce ownership (irreversible)

### Events
- `PaymentReceived(address indexed payer, uint256 amount, uint256 newTotalPaid)`
- `AccessGranted(address indexed account, uint256 price)`
- `Withdrawn(address indexed owner, uint256 amount)`
- `OwnershipTransferred(address indexed previousOwner, address indexed newOwner)`
- `Paused(address account)`
- `Unpaused(address account)`

## Network Configuration

Configured for **Rootstock Testnet** (Chain ID: 31). Network settings are in `hardhat.config.ts`.
