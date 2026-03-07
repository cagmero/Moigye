# Moigye CRE Agent

This folder contains the Autonomous Yield & Settlement Agent for the Moigye protocol, built for the Chainlink Convergence Hackathon.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Chainlink CRE CLI](https://docs.chain.link/cre/) (Early Access)
- A Sepolia RPC URL (e.g., Alchemy or Infura)
- A Private Key for the Agent (must have Sepolia ETH and be authorized on `MoigyeVault`)

## Installation

1. Install the CRE SDK in the project root:
   ```bash
   pnpm add @chainlink/cre-sdk
   ```

2. If you don't have the CRE CLI, follow the official [Chainlink Documentation](https://docs.chain.link/cre/) to install it.

## Compilation

Before simulating, you must compile the TypeScript workflow into WASM:

```bash
pnpm exec cre-compile -w yield-agent.ts -o yield-agent.wasm
```

## Simulation

To test the agent locally and generate a transaction hash, run:

```bash
cre simulate yield-agent.wasm \
  --env SEPOLIA_RPC_URL=your_rpc_url \
  --env PRIVATE_KEY=your_private_key \
  --config simulation-config.json
```

### Simulation Config (`simulation-config.json`)
```json
{
  "chains": {
    "16015286601757825753": {
      "rpcUrl": "${SEPOLIA_RPC_URL}",
      "privateKey": "${PRIVATE_KEY}"
    }
  }
}
```

### Strategy Logic
The agent follows a strict **Autonomous Yield Aggregation** strategy:
1. **Trigger**: Hourly Cron check.
2. **Fetch**: Pulls live APY rates from Aave and Compound mock APIs.
3. **Analyze**: Compares rates and checks `MoigyeVault` idle balance.
4. **Execute**: If idle balance > 1000 MoigyeUSD, it calls `optimizeYield` on the Hub contract to migrate funds to the higher-yielding protocol.
