import { cre, EVMClient, CronCapability, TxStatus, encodeCallMsg, prepareReportRequest } from "@chainlink/cre-sdk";
import { encodeFunctionData, parseAbi, formatUnits, toHex, hexToBigInt } from "viem";

/**
 * Moigye Autonomous Yield & Settlement Agent (Chainlink CRE)
 * 
 * Target: DeFi & Tokenization Hackathon
 * Description: Dynamically aggregates yield by comparing off-chain APY rates
 * and rebalancing idle MoigyeUSD from MoigyeVault (Sepolia) to the highest-yielding protocol.
 */

// --- Configuration ---
const MOIGYE_VAULT_ADDRESS = "0xF3A7e3D340258aeE748f2B773c2C01d1B5d84b00";
const MOIGYE_USD_ADDRESS = "0x4ed7c06655c1b138c84014c119902c0039725807";

const PROTOCOLS = {
    AAVE: "0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9",
    COMPOUND: "0xc00e94Cb662C3520282E6f5717214004A7f26888"
};

const APY_API_AAVE = "https://api.mock-defi.com/aave/apy";
const APY_API_COMPOUND = "https://api.mock-defi.com/compound/apy";

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

            // 1. Fetch Off-Chain APY Rates
            runtime.log("🔍 Fetching real-time APY rates from DeFi protocols...");

            const fetchAPY = async (url: string, name: string) => {
                // Mocking the response for simulation
                const mockRates: Record<string, number> = {
                    [APY_API_AAVE]: 5.2,
                    [APY_API_COMPOUND]: 4.8
                };
                const apy = mockRates[url] || 0;
                runtime.log(`📈 ${name} Current APY: ${apy}%`);
                return apy;
            };

            const aaveApy = await fetchAPY(APY_API_AAVE, "Aave V3");
            const compoundApy = await fetchAPY(APY_API_COMPOUND, "Compound V3");

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
