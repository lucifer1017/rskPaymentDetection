import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("PaymentAccessModule", (m) => {
  const price = m.getParameter("price", 100_000_000_000_000n);

  const paymentAccess = m.contract("PaymentAccess", [price]);

  return { paymentAccess };
});

