import { createPublicClient, createWalletClient, http, PublicClient, WalletClient, Account } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';
import * as fs from 'fs';
import * as path from 'path';

const cc_next_testnet = {
    id: 102033,
    name: 'CCNext-Testnet',
    nativeCurrency: { name: 'Creditcoin', symbol: 'CTC', decimals: 18 },
    rpcUrls: { default: { http: ['https://rpc.usc-testnet.creditcoin.network'] } },
    testnet: true,
} as const;

import { readFileSync } from 'fs';

// ABIs
const BiddingEngineABI = JSON.parse(readFileSync(new URL('../../artifacts/contracts/BiddingEngine.sol/BiddingEngine.json', import.meta.url).pathname, 'utf-8')).abi;
const MoigyeVaultABI = JSON.parse(readFileSync(new URL('../../artifacts/contracts/MoigyeVault.sol/MoigyeVault.json', import.meta.url).pathname, 'utf-8')).abi;

// Addresses
const BIDDING_ENGINE_ADDRESS = process.env.BIDDING_ENGINE_ADDRESS || "0x<YOUR_BIDDING_ENGINE_ADDRESS>";
const MOIGYE_VAULT_ADDRESS = process.env.MOIGYE_VAULT_ADDRESS || "0x<YOUR_MOIGYE_VAULT_ADDRESS>";

const TYPES = {
    Payout: [
        { name: 'winner', type: 'address' },
        { name: 'amount', type: 'uint256' },
        { name: 'roundId', type: 'uint256' },
        { name: 'nonce', type: 'uint256' },
    ],
};

async function main() {
    console.log("🚀 Starting Moigye Validator Service...");

    const privateKey = process.env.PRIVATE_KEY as `0x${string}`;
    if (!privateKey) throw new Error("PRIVATE_KEY missing");
    const account: Account = privateKeyToAccount(privateKey);

    const uscClient = createPublicClient({ chain: cc_next_testnet, transport: http() });

    const sepoliaPublic = createPublicClient({ chain: sepolia, transport: http() });
    const sepoliaWallet = createWalletClient({ chain: sepolia, transport: http(), account });

    console.log(`Listening for WinnerSelected events on BiddingEngine (${BIDDING_ENGINE_ADDRESS})...`);

    uscClient.watchContractEvent({
        address: BIDDING_ENGINE_ADDRESS as `0x${string}`,
        abi: BiddingEngineABI,
        eventName: 'WinnerSelected',
        onLogs: async (logs) => {
            for (const log of logs) {
                const { roundId, winner, payout } = log.args as any;
                const nonce = BigInt(Date.now()); // Hackathon simple nonce

                console.log(`\n🏆 Winner Selected for Round ${roundId}: ${winner}`);
                console.log(`💰 Payout: ${payout} USDC`);

                try {
                    const domain = {
                        name: 'Moigye_Vault',
                        version: '1.0.0',
                        chainId: 11155111, // Sepolia
                        verifyingContract: MOIGYE_VAULT_ADDRESS as `0x${string}`,
                    };

                    console.log(`Signing Payout for ${winner}...`);
                    const signature = await sepoliaWallet.signTypedData({
                        domain,
                        types: TYPES,
                        primaryType: 'Payout',
                        message: { winner, amount: payout, roundId, nonce },
                    });

                    console.log(`Executing payout on Sepolia...`);
                    const hash = await sepoliaWallet.writeContract({
                        address: MOIGYE_VAULT_ADDRESS as `0x${string}`,
                        abi: MoigyeVaultABI,
                        functionName: 'executePayout',
                        args: [winner, payout, roundId, nonce, signature],
                        account
                    } as any);

                    console.log(`✅ Payout Successful! Tx: ${hash}`);
                } catch (error) {
                    console.error("❌ Payout execution failed:", error);
                }
            }
        },
    });

    await new Promise(() => { });
}

main().catch(console.error);
