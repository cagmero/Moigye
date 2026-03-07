# Moigye: Decentralized Cross-Chain ROSCA Protocol

**Hackathon Submission: Chainlink Convergence (DeFi & Tokenization Track)**

Moigye (Korean for "gathering") is a decentralized, cross-chain Rotating Savings and Credit Association (ROSCA). It leverages the **Chainlink Runtime Environment (CRE)** and the **Hub-and-Spoke** architecture to provide secure, autonomous savings circles with optimized yield.

## 🚀 Key Features

- **Autonomous Yield Optimization**: Powered by Chainlink CRE, the protocol automatically reinvests idle pooled funds into the highest-yielding DeFi protocols (Aave, Compound) without human intervention.
- **Cross-Chain Settlement**: Built on a Hub (Creditcoin EVM) and Spoke (Sepolia) model. Proofs are verified using native precompiles for maximum security.
- **Blind Bidding (Nak-chal-gye)**: Dynamic yield dividends generated through a blind discount bidding engine.
- **On-Chain Credit Scoring**: Automated score management based on participation and reliability.

## 🏗 Architecture

### 1. Hub Chain (Creditcoin Testnet)
- **GyeManager.sol**: The source of truth for pool state, winners, and settlement schedules.
- **BiddingEngine.sol**: Logic for handling blind bids and calculating prize dividends.
- **ScoreManager.sol**: Tracks user reliability scores.

### 2. Spoke Chain (Ethereum Sepolia)
- **MoigyeVault.sol**: The custody contract. Users deposit USDC here. Funds are managed by the CRE Agent.

### 3. Chainlink CRE Agent
- **Autonomous Yield Rebalancer**: An agentic workflow that monitors Sepolia liquidity and optimizes off-chain yield capture.

## 🛠 Project Structure

- `/contracts`: Core Solidity smart contracts.
- `/chainlink-cre`: CRE Agent scripts and simulation guides.
- `/scripts/bridge`: Bridge daemons for cross-chain proof relay.
- `/frontend`: Next.js (App Router) minimalist dashboard.

## 🏁 Quick Start

### Deployed Contracts (Creditcoin BUIDL-CTC Hackathon)
- **GyeManager**: `0x5Ff0b1Ef155e127266cf1dCFb041aa32aB1d5829`
- **BiddingEngine**: `0x0587000b1dDe351c6769A40e556F62C6066aF9d8`
- **MoigyeVault (Sepolia)**: `0xf20ac2d8E81dd951987B661e40A3367705760431`
- **ScoreManager**: `0xf20ac2d8E81dd951987B661e40A3367705760431`
- **GyeStaking**: `0x04402E108411eC07F514839cAb4e72912Ad8B988`

### Smart Contracts
1. Install dependencies: `pnpm install`
2. Compile: `pnpm exec hardhat compile`

### CRE Agent
Navigate to `/chainlink-cre` and follow the [Agent README](./chainlink-cre/README.md) to compile and simulate the autonomous workflow using `pnpm`.

### Frontend
1. Navigate to `/frontend`
2. `pnpm install`
3. `pnpm start` (or `pnpm dev` for local development)

## ⚖️ Autonomous Yield Aggregation logic

The Moigye CRE Agent implemented in `chainlink-cre/yield-agent.ts` performs the following automated steps:
1. **Dynamic APY Comparison**: Fetches live yield rates from Aave V3 and Compound V3 via mock HTTP endpoints.
2. **On-Chain Liquidity Check**: Queries the idle USDC balance in the `MoigyeVault` on Sepolia.
3. **Smart Rebalancing**: If common liquidity exceeds 1,000 USDC, the agent selects the highest-yielding protocol and generates a signed report for the vault's `optimizeYield` function.
4. **Professional Logging**: Outputs high-resolution status logs suitable for hackathon demonstrations.

## 🎥 Hackathon Demo Video
The terminal logs in the CRE Agent simulation demonstrate the protocol's ability to autonomously fetch off-chain APY data, query on-chain balances, and execute rebalancing transactions without any external triggers.

---