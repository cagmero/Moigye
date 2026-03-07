import { createRequire } from "module";
const require = createRequire(import.meta.url);

require("@nomicfoundation/hardhat-toolbox-mocha-ethers");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
export default {
    solidity: {
        compilers: [
            { version: "0.8.20", settings: { viaIR: true, optimizer: { enabled: true, runs: 200 } } },
            { version: "0.8.23", settings: { viaIR: true, optimizer: { enabled: true, runs: 200 } } }
        ],
    },
    networks: {
        hardhat: {
            type: "edr-simulated",
            chainId: 1337,
        },
        ctcTestnet: {
            type: "http",
            url: "https://rpc.cc3-testnet.creditcoin.network",
            chainId: 102031,
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
        },
        uscTestnetV2: {
            type: "http",
            url: "https://rpc.usc-testnet2.creditcoin.network",
            chainId: 102036,
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
        },
        sepolia: {
            type: "http",
            url: "https://1rpc.io/sepolia",
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
        }
    }
};
