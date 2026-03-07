# Moigye Protocol: Context & Architecture Overview

This document provides a comprehensive technical state-of-the-union for the Moigye protocol. It is designed to give LLMs or new developers immediate context on the project's architecture, deployment status, and chronological development.

## 📝 Project Mission
Moigye is a cross-chain **ROSCA (Rotating Savings and Credit Association)** protocol. It enables users to pool funds and take turns receiving the "pot" through a bidding mechanism, secured by a 2-layer Sybil-resistance system and a financial guarantee bond.

---

## 🏛️ System Architecture

Moigye operates on a **Hub-and-Spoke** model:

### 1. Hub Chain (Creditcoin Testnet — Chain ID: 102031)
The "Brain" of the protocol. It handles identity, reputation, and coordination.
- **GyeManager**: Orchestrates the creation and participation in ROSCA groups (circles). Enforces minimum reputation scores for entry.
- **BiddingEngine**: Manages the competitive bidding process to determine the pot winner for each round.
- **ScoreManager**: Tracks user credit scores. It mints "Debt Proofs" or "Reputation Credits" and interfaces with the SBT.
- **MoigyeSBT (Soulbound Token)**: A non-transferable ERC-721 representing user status (Active, Trusted, or Defaulted).
- **GyeStaking**: Handles the utility staking for the protocol's governance/incentives.
- **USCOracle**: Provides real-time pricing and verification for cross-chain stablecoin values.

### 2. Spoke Chain (Ethereum Sepolia — Chain ID: 11155111)
The "Vault" of the protocol. It handles the actual capital (MoigyeUSD).
- **MoigyeVault**: The custody contract on Ethereum. It locks the "Guarantee Bond" (30% of payout) to prevent defaults.
- **MoigyeUSD (mUSD)**: A custom production-ready stablecoin mockup (6 decimals) used for all protocol transactions.

### 3. Off-Chain Infrastructure
- **Bridge Relayer/Validator**: A custom Node.js service that monitors the Hub for `WinnerSelected` events and triggers the typed-data-signed payout on the Spoke chain.
- **Chainlink CRE (Convergence)**: An autonomous agent that monitors `MoigyeVault` idle liquidity and rebalances it into DeFi protocols (e.g., Aave/Compound) to generate yield for the pool.

---

## 🚀 Deployment Status (as of 2026-03-08)

All contracts are **Live on Testnet**. Hardhat mocks have been fully replaced.

### Hub (Creditcoin)
| Contract | Address |
|---|---|
| GyeManager | `0xC6AF175200807DeE213f58D4C375a574284ba2f0` |
| BiddingEngine | `0xa513E6E4b8f2a923D98304ec87F64353C4D5C853` |
| ScoreManager | `0x0165878A594ca255338adfa4d48449f69242Eb8F` |
| GyeStaking | `0x60CeeEb9A7172Fd20339692B19e0228087e17AA9` |
| MoigyeSBT | `0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D` |

### Spoke (Sepolia)
| Contract | Address |
|---|---|
| MoigyeVault | `0xF3A7e3D340258aeE748f2B773c2C01d1B5d84b00` |
| MoigyeUSD | `0x4ed7c06655c1b138c84014c119902c0039725807` |

---

## 📅 Chronological Context (Recent Development)

1. **Refactor from Boilerplate**: The project was migrated from a legacy boilerplate (Polaris) to a clean, production-ready "Moigye" project.
2. **Sybil-Resistance Implementation**: Added a 2-layer defense:
   - **On-Chain**: `GyeManager` now checks `ScoreManager` scores before allowing a user to join a group.
   - **Off-Chain**: Integrated Privy DID blacklisting via Supabase to "Ban" default-prone users even if they switch wallets.
3. **Hardhat v3 Migration**: Successfully navigated Hardhat v3 (EDR) plugin resolution issues by implementing standalone `ethers.js` deployment scripts.
4. **Environment Sync**: Synchronized the `.env`, frontend `constants.ts`, and `yield-agent.ts` with the final production addresses.

---

## 🛠 Remaining Work (TODO)
- [ ] Connect the frontend to the live `MoigyeVault` for deposit/withdraw actions.
- [ ] Finalize the Chainlink CRE simulation with real Sepolia RPCs.
- [ ] Integrate the Supabase `is_banned` flag into the final group-join button logic.
