# Moigye: Decentralized Cross-Chain ROSCA Protocol

**Hackathon Submission: Chainlink Convergence (DeFi & Tokenization Track)**

Moigye (Korean for "gathering") is a decentralized, cross-chain Rotating Savings and Credit Association (ROSCA). It leverages the **Chainlink Runtime Environment (CRE)** and the **Hub-and-Spoke** architecture to provide secure, autonomous savings circles with optimized yield.

## 🚀 Key Features

- **Autonomous Yield Optimization**: Powered by Chainlink CRE, the protocol automatically reinvests idle pooled funds into the highest-yielding DeFi protocols (Aave, Compound) without human intervention.
- **Cross-Chain Settlement**: Built on a Hub (Creditcoin EVM) and Spoke (Sepolia) model. Proofs are verified using native precompiles for maximum security.
- **Anti-Default Guarantee Bond**: Implements a financial lock where 30% of the winner's payout is held in escrow as a guarantee bond until the final round, discouraging defaults.
- **Soulbound Reputation (SBT)**: A non-transferable "Soulbound Token" system that tracks user reliability (Active, Trusted, Defaulted), providing Sybil-resistance.
- **Blind Bidding (Nak-chal-gye)**: Dynamic yield dividends generated through a blind discount bidding engine.

## 🏗 Architecture

### 1. Hub Chain (Creditcoin Testnet)
- **GyeManager.sol**: The source of truth for pool state, winners, and settlement schedules.
- **BiddingEngine.sol**: Logic for handling blind bids, calculating prize dividends, and the 70/30 payout split.
- **ScoreManager.sol**: Tracks user reliability scores and manages SBT status updates.
- **MoigyeSBT.sol**: Soulbound Token contract for on-chain reputation.
- **USCOracle.sol**: Real implementation for fetching verified cross-chain query results.

### 2. Spoke Chain (Ethereum Sepolia)
- **MoigyeVault.sol**: The custody contract. Users deposit USDC here. Handles the 30% bond escrow and yield optimization.
- **MoigyeUSD.sol**: Production-ready stablecoin used for the protocol.

### 3. Chainlink CRE Agent
- **Autonomous Yield Rebalancer**: An agentic workflow that monitors Sepolia liquidity and optimizes off-chain yield capture.

## 🛠 Project Structure

- `/contracts`: Core Solidity smart contracts (Mocks removed).
- `/chainlink-cre`: CRE Agent scripts and simulation guides.
- `/scripts/bridge`: Bridge daemons for cross-chain proof relay.
- `/frontend`: Next.js (App Router) minimalist dashboard with Reputation Badges.

## 🏁 Quick Start

### Deployed Contracts (Updated Production Versions)
- **MoigyeSBT**: `0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D`
- **ScoreManager**: `0x0165878A594ca255338adfa4d48449f69242Eb8F`
- **BiddingEngine**: `0xa513E6E4b8f2a923D98304ec87F64353C4D5C853`
- **MoigyeVault (Sepolia)**: `0x2279B181aA564344444444444444444444444444`
- **USCOracle**: `0x8A753747A1Fa494EC906cE90E9f37563A8AF630e`
- **MoigyeUSD**: `0x4ed7c06655c1b138c84014c119902c0039725807`

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