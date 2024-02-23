import * as dotenv from "dotenv";
dotenv.config();
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import '@openzeppelin/hardhat-upgrades';

const providerApiKey = process.env.RPC_PROVIDER_API_KEY 
const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        // https://docs.soliditylang.org/en/latest/using-the-compiler.html#optimizer-options
        runs: 200,
      },
    }
  },
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      accounts: [{
        privateKey: `${process.env.ACCOUNT_1_PK}`,
        balance: "1000000000000000000000000"
      },
      {
        privateKey: `${process.env.ACCOUNT_2_PK}`,
        balance: "1000000000000000000000000"
      },
      {
        privateKey: `${process.env.ACCOUNT_3_PK}`,
        balance: "1000000000000000000000000"
      }
      ],
      forking: {
        url: `https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`,
      },
    },
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`,
      accounts: [`${process.env.ACCOUNT_1_PK}`, `${process.env.ACCOUNT_2_PK}`, `${process.env.ACCOUNT_3_PK}`]
    },
  }

};

export default config;
