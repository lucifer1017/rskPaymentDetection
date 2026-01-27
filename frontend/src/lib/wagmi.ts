import { http, createConfig } from "wagmi";
import { defineChain } from "viem";
import { injected } from "wagmi/connectors";

export const rootstockTestnet = defineChain({
  id: 31,
  name: "Rootstock Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "RBTC",
    symbol: "RBTC",
  },
  rpcUrls: {
    default: {
      http: ["https://public-node.testnet.rsk.co"],
    },
  },
  blockExplorers: {
    default: {
      name: "RSK Testnet Explorer",
      url: "https://explorer.testnet.rootstock.io",
    },
  },
  testnet: true,
});

export const config = createConfig({
  chains: [rootstockTestnet],
  connectors: [injected()],
  transports: {
    [rootstockTestnet.id]: http("https://public-node.testnet.rsk.co"),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
