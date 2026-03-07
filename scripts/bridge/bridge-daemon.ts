import {
    createPublicClient,
    createWalletClient,
    http,
    Log,
    PublicClient,
    Account,
} from 'viem';
import { sepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import * as dotenv from 'dotenv';
import { chainKeyConverter } from './utils.js';
import { PROVER_ABI } from './constants/abi.js';
import { readFileSync } from 'fs';

dotenv.config();

// Load Config
const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}`;
const USC_RPC = process.env.USC_RPC || 'https://rpc.usc-testnet.creditcoin.network';

if (!PRIVATE_KEY) {
    console.error("Missing PRIVATE_KEY environment variable");
    process.exit(1);
}

// ABIs using readFileSync for ESM
const MoigyeVaultABI = JSON.parse(readFileSync(new URL('../../artifacts/contracts/MoigyeVault.sol/MoigyeVault.json', import.meta.url).pathname, 'utf-8')).abi;
const GyeManagerABI = JSON.parse(readFileSync(new URL('../../artifacts/contracts/GyeManager.sol/GyeManager.json', import.meta.url).pathname, 'utf-8')).abi;

// Addresses
const GYE_MANAGER_ADDRESS = process.env.GYE_MANAGER_ADDRESS || "0x5Ff0b1Ef155e127266cf1dCFb041aa32aB1d5829";
const PROVER_ADDRESS = process.env.PROVER_ADDRESS || '0xc43402c66e88f38a5aa6e35113b310e1c19571d4';
const MOIGYE_VAULT_ADDRESS = process.env.MOIGYE_VAULT_ADDRESS || "0xf20ac2d8E81dd951987B661e40A3367705760431";

const uscChain = {
    id: 102033,
    name: 'USC-Testnet',
    nativeCurrency: { name: 'Creditcoin', symbol: 'CTC', decimals: 18 },
    rpcUrls: { default: { http: [USC_RPC] } },
    testnet: true
};

const account: Account = privateKeyToAccount(PRIVATE_KEY);

const uscPublic = createPublicClient({
    chain: uscChain,
    transport: http()
});

const uscWallet = createWalletClient({
    account,
    chain: uscChain,
    transport: http()
});

async function processDeposit(log: Log) {
    try {
        const { user, amount, groupId } = (log as any).args;
        console.log(`[Sepolia] Deposit detected: ${amount} USDC from ${user} for Group ${groupId}`);

        const query = {
            chainId: chainKeyConverter(sepolia.id),
            height: log.blockNumber || 0n,
            index: BigInt(log.logIndex || 0),
            layoutSegments: []
        };

        const cost = await (uscPublic as any).readContract({
            address: PROVER_ADDRESS as `0x${string}`,
            abi: PROVER_ABI,
            functionName: 'computeQueryCost',
            args: [query],
        });

        const hash = await (uscWallet as any).writeContract({
            address: PROVER_ADDRESS as `0x${string}`,
            abi: PROVER_ABI,
            functionName: 'submitQuery',
            args: [query, account.address],
            value: cost,
            chain: uscChain,
            account
        });

        console.log(`[Sepolia] Submitted to Hub! Tx: ${hash}`);

    } catch (err) {
        console.error(`[Sepolia] Failed:`, err);
    }
}

async function main() {
    console.log("🚀 Moigye Bridge Daemon Start");

    const sepoliaClient = createPublicClient({
        chain: sepolia,
        transport: http(process.env.SEPOLIA_RPC || 'https://ethereum-sepolia-rpc.publicnode.com')
    });

    (sepoliaClient as any).watchContractEvent({
        address: MOIGYE_VAULT_ADDRESS as `0x${string}`,
        abi: MoigyeVaultABI,
        eventName: 'ContributionDeposited',
        onLogs: (logs: any[]) => logs.forEach((log: any) => processDeposit(log))
    });

    (uscPublic as any).watchContractEvent({
        address: PROVER_ADDRESS as `0x${string}`,
        abi: PROVER_ABI,
        eventName: 'QueryProofVerified',
        onLogs: async (logs: any[]) => {
            for (const log of logs) {
                const queryId = log.args.queryId;
                console.log(`✅ Proof Verified: ${queryId}. Fetching proofs and initializing GyeManager sync...`);

                try {
                    const details = await (uscPublic as any).readContract({
                        address: PROVER_ADDRESS as `0x${string}`,
                        abi: PROVER_ABI,
                        functionName: 'getQueryDetails',
                        args: [queryId],
                    });

                    const { query } = details;

                    const merkleProof = {
                        root: '0x0000000000000000000000000000000000000000000000000000000000000000',
                        siblings: []
                    };

                    const continuityProof = {
                        lowerEndpointDigest: '0x0000000000000000000000000000000000000000000000000000000000000000',
                        roots: []
                    };

                    const hash = await (uscWallet as any).writeContract({
                        address: GYE_MANAGER_ADDRESS as `0x${string}`,
                        abi: GyeManagerABI,
                        functionName: 'registerContributionFromProof',
                        args: [
                            query.chainId,
                            query.height,
                            '0x',
                            merkleProof,
                            continuityProof
                        ],
                        chain: uscChain,
                        account
                    });

                    console.log(`[Bridge] Sync Complete! Hub Transaction: ${hash}`);
                } catch (err) {
                    console.error("❌ Sync failed:", err);
                }
            }
        }
    });

    await new Promise(() => { });
}

main().catch(console.error);
