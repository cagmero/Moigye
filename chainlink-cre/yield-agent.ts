import { cre, EVMClient, CronCapability, TxStatus, encodeCallMsg, prepareReportRequest } from "@chainlink/cre-sdk";
import { encodeFunctionData, parseAbi, formatUnits, toHex, hexToBigInt } from "viem";

/**
 * Moigye Autonomous Yield & Settlement Agent (Chainlink CRE)
 * 
 * Target: DeFi & Tokenization Hackathon
 * Description: Dynamically aggregates yield by comparing off-chain APY rates
 * and rebalancing idle MoigyeUSD from MoigyeVault to the highest-yielding protocol.
 */

// --- Configuration ---
// MoigyeVault on Sepolia (spoke chain) — update with deployed vault address
const MOIGYE_VAULT_ADDRESS = process.env.MOIGYE_VAULT_ADDRESS ?? "0xF3A7e3D340258aeE748f2B773c2C01d1B5d84b00";
// mUSD token — on CTC testnet (hub) or Sepolia (spoke depending on config)
const MOIGYE_USD_ADDRESS = process.env.MOIGYE_USD_ADDRESS ?? "0xb6414BD71C42290892DadcEb4616d8A09628c0cf";

const PROTOCOLS = {
    AAVE: "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2", // Aave V3 Pool on Sepolia
    COMPOUND: "0xc3d688B66703497DAA19211EEdff47f25384cdc3", // Compound V3 USDC on Sepolia
};

// Real DeFi Llama Yield API — no API key required, publicly accessible
const DEFI_LLAMA_POOL_API = "https://yields.llama.fi/pools";
// Specific pool IDs from DeFi Llama for Aave V3 / Compound on Sepolia-equivalent
const AAVE_POOL_ID = "a349fea4-d780-4e16-973e-70ca9b606db3"; // Aave V3 USDC Ethereum
const COMPOUND_POOL_ID = "8a20fa32-4786-4c0e-b3c2-9a959a6e1f4b"; // Compound V3 USDC Ethereum

const CHAIN_SELECTOR = 16015286601757825753n; // Ethereum Sepolia

const VAULT_ABI = parseAbi([
    "function optimizeYield(address target, uint256 amount) external",
    "function balanceOf(address account) external view returns (uint256)"
]);

const MOIGYE_USD_ABI = parseAbi([
    "function balanceOf(address account) external view returns (uint256)"
]);

// --- Workflow ---

export const workflow = [
    cre.handler(
        // Trigger: Every 1 hour
        new CronCapability().trigger({ schedule: "0 * * * *" }),

        async (runtime) => {
            runtime.log("🚀 Moigye Yield Agent: Starting autonomous rebalance check...");

            const evm = new EVMClient(CHAIN_SELECTOR);

            // 1. Fetch Real APY Rates from DeFi Llama (no API key required)
            runtime.log("🔍 Fetching real-time APY rates from DeFi Llama yield API...");

            const fetchPoolAPY = async (poolId: string, name: string): Promise<number> => {
                try {
                    const res = await fetch(`${DEFI_LLAMA_POOL_API}?pool=${poolId}`);
                    const json = await res.json() as { data: Array<{ apy?: number }> };
                    const apy = json?.data?.[0]?.apy ?? 0;
                    runtime.log(`📈 ${name} Real APY: ${apy.toFixed(2)}%`);
                    return apy;
                } catch (err) {
                    runtime.log(`⚠️  Failed to fetch ${name} APY, defaulting to 0. Error: ${err}`);
                    return 0;
                }
            };

            const aaveApy = await fetchPoolAPY(AAVE_POOL_ID, "Aave V3 USDC");
            const compoundApy = await fetchPoolAPY(COMPOUND_POOL_ID, "Compound V3 USDC");

            // 2. Check On-Chain State: Idle MoigyeUSD in MoigyeVault
            runtime.log(`📡 Querying MoigyeVault (${MOIGYE_VAULT_ADDRESS}) for idle liquidity...`);

            const balanceData = await evm.callContract(runtime, {
                call: encodeCallMsg({
                    from: MOIGYE_VAULT_ADDRESS as `0x${string}`, // View as self
                    to: MOIGYE_USD_ADDRESS as `0x${string}`,
                    data: encodeFunctionData({
                        abi: MOIGYE_USD_ABI,
                        functionName: "balanceOf",
                        args: [MOIGYE_VAULT_ADDRESS as `0x${string}`]
                    })
                })
            }).result();

            // balanceData.data is Uint8Array
            const idleBalance = balanceData.data ? hexToBigInt(toHex(balanceData.data)) : 0n;
            runtime.log(`💰 Vault Status: ${formatUnits(idleBalance, 6)} MoigyeUSD idle.`);

            // 3. Autonomous Decision Engine
            if (idleBalance > 1000n * 10n ** 6n) {
                const bestProtocol = aaveApy >= compoundApy ? "AAVE" : "COMPOUND";
                const targetAddress = PROTOCOLS[bestProtocol];

                runtime.log(`⚖️ Decision: High liquidity detected. Routing to ${bestProtocol} (${targetAddress}) for optimal yield.`);

                // 4. Execution: Submit Rebalance Report
                runtime.log("✍️ Generating settlement report for on-chain execution...");

                const reportPayload = encodeFunctionData({
                    abi: VAULT_ABI,
                    functionName: "optimizeYield",
                    args: [targetAddress as `0x${string}`, idleBalance]
                });

                // Generate signing request for the DON
                const report = runtime.report(prepareReportRequest(reportPayload)).result();

                const tx = await evm.writeReport(runtime, {
                    receiver: MOIGYE_VAULT_ADDRESS,
                    report: report
                }).result();

                if (tx.txStatus === TxStatus.SUCCESS) {
                    runtime.log("✅ Settlement Executed! Funds migrated to yield strategy.");
                } else {
                    runtime.log(`❌ Settlement Status: ${tx.txStatus}`);
                }
            } else {
                runtime.log("💤 Liquidity threshold not met (< 1000 MoigyeUSD). Maintaining current state.");
            }

            runtime.log("🏁 Cycle Complete. Next check in 60 minutes.");

            return {
                timestamp: runtime.now().toISOString(),
                status: "FINISHED",
                decision: idleBalance > 1000n * 10n ** 6n ? "REBALANCED" : "IDLE"
            };
        }
    )
];
