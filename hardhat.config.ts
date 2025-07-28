import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import '@typechain/hardhat';
import 'dotenv/config';

const config: HardhatUserConfig = {
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {
      chainId: 31337, // Required for local testing
      allowUnlimitedContractSize: true, // Useful for complex contracts
      accounts: {
        accountsBalance: "10000000000000000000000" // 10000 ETH in wei
      }
    },
    base_sepolia: {
      url: 'https://sepolia.base.org',  // Standard public Base Sepolia RPC
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
      chainId: 84532,
      timeout: 60000 // Increase timeout to 60 seconds
    }
  },
  solidity: {
    version: '0.8.28',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: false, // Enable IR compilation for better optimization
    },
  },
  paths: {
    sources: './contracts',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts',
  },
  typechain: {
    outDir: 'typechain-types',
    target: 'ethers-v6',
  },
  etherscan: {
    apiKey: {
      base_sepolia: process.env.SEPOLIA_BASE_SCAN_API_KEY || '',
    },
    customChains: [
      {
        network: "base_sepolia",
        chainId: 84532,
        urls: {
          apiURL: "https://api-sepolia.basescan.org/api",
          browserURL: "https://sepolia.basescan.org"
        }
      },
    ]
  },
  sourcify: {
    enabled: true
  },
  mocha: {
    timeout: 100000 // 100 seconds for long-running tests
  }
};

export default config;