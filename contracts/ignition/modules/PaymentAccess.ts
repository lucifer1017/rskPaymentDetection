import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

// Deployment module for the PaymentAccess contract, following the latest Hardhat Ignition style.
// Exposes a configurable `price` parameter with a sensible default (0.0001 ether/RBTC).
export default buildModule("PaymentAccessModule", (m) => {
  // Default price: 0.0001 ether/RBTC in wei (100_000_000_000_000 wei)
  const price = m.getParameter("price", 100_000_000_000_000n);

  const paymentAccess = m.contract("PaymentAccess", [price]);

  return { paymentAccess };
});

