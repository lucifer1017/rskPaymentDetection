import hardhatToolboxViemPlugin from "@nomicfoundation/hardhat-toolbox-viem";
import { configVariable, defineConfig } from "hardhat/config";
import dotenv from "dotenv";
dotenv.config();
export default defineConfig({
  plugins: [hardhatToolboxViemPlugin],
  solidity: {
    profiles: {
      default: {
        version: "0.8.28",
      },
      production: {
        version: "0.8.28",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    },
  },
  networks: {
    rskTestnet: {
      type: "http",
      chainId: 31,
      url: configVariable("RSK_TESTNET_RPC_URL"),
      accounts: [configVariable("PRIVATE_KEY")],
    },
  },
});
