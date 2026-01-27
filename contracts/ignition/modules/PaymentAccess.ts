import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

// Deployment module for the PaymentAccess contract, following the latest Hardhat Ignition style.
// Exposes a configurable `price` parameter with a sensible default (0.001 ether/RBTC).
export default buildModule("PaymentAccessModule", (m) => {
  // Default price: 0.001 ether/RBTC in wei
  const price = m.getParameter("price", 1_000_000_000_000_000n);

  const paymentAccess = m.contract("PaymentAccess", [price]);

  return { paymentAccess };
});

