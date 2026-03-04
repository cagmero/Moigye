import {
    createPublicClient,
    createWalletClient,
    http,
    parseAbiItem,
    Log,
    PublicClient,
    WalletClient,
    Account,
} from 'viem';
import { sepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import * as dotenv from 'dotenv';
import { chainKeyConverter, computeQueryId } from './utils';
import { PROVER_ABI } from './constants/abi';

const {
    QueryBuilder,
    QueryableFields
} = require('@gluwa/cc-next-query-builder');

dotenv.config();

// Load Config
const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}`;
const USC_RPC = process.env.USC_RPC || 'https://rpc.usc-testnet.creditcoin.network';

if (!PRIVATE_KEY) {
    console.error("Missing PRIVATE_KEY environment variable");
    process.exit(1);
}

// ABIs
const MoigyeVaultABI = require('../../artifacts/contracts/MoigyeVault.sol/MoigyeVault.json').abi;
const GyeManagerABI = require('../../artifacts/contracts/GyeManager.sol/GyeManager.json').abi;

// Addresses
const GYE_MANAGER_ADDRESS = process.env.GYE_MANAGER_ADDRESS || "0x<YOUR_GYE_MANAGER_ADDRESS>";
const PROVER_ADDRESS = process.env.PROVER_ADDRESS || '0xc43402c66e88f38a5aa6e35113b310e1c19571d4'; // Standard Native Query Verifier address
const MOIGYE_VAULT_ADDRESS = process.env.MOIGYE_VAULT_ADDRESS || "0x<YOUR_MOIGYE_VAULT_ADDRESS>";

const account: Account = privateKeyToAccount(PRIVATE_KEY);

const uscChain = {
    id: 102033,
    name: 'USC-Testnet',
    nativeCurrency: { name: 'Creditcoin', symbol: 'CTC', decimals: 18 },
    rpcUrls: {
        default: { http: [USC_RPC] },
    },
    testnet: true,
} as const;

const uscPublic = createPublicClient({
    chain: uscChain,
    transport: http(USC_RPC),
});

const uscWallet = createWalletClient({
    chain: uscChain,
    transport: http(USC_RPC),
    account,
});

async function processDeposit(log: any, client: PublicClient) {
    const { user, amount, roundId, depositId } = (log as any).args;
    const txHash = log.transactionHash;

    console.log(`\n[Sepolia] Detected Contribution: ${txHash} from ${user} for Round ${roundId}`);

    try {
        console.log(`[Sepolia] Processing proof...`);
        const receipt = await client.waitForTransactionReceipt({ hash: txHash, confirmations: 1 });
        const tx = await client.getTransaction({ hash: txHash });

        const builder = QueryBuilder.createFromTransaction(tx, receipt);
        builder.setAbiProvider(async () => JSON.stringify(MoigyeVaultABI));

        builder
            .addStaticField(QueryableFields.RxStatus)
            .addStaticField(QueryableFields.TxFrom)
            .addStaticField(QueryableFields.TxTo);

        await builder.eventBuilder('ContributionDeposited', () => true, (b: any) => b
            .addAddress().addSignature().addArgument('user').addArgument('amount').addArgument('roundId').addArgument('depositId')
        );

        const fields = builder.build();
        const query = {
            chainId: chainKeyConverter(11155111), // Sepolia
            height: BigInt(tx.blockNumber!),
            index: BigInt(receipt.transactionIndex),
            layoutSegments: fields.map((f: any) => ({
                offset: BigInt(f.offset),
                size: BigInt(f.size),
            })),
        };

        const queryId = computeQueryId(query);
        console.log(`[Sepolia] QueryID: ${queryId}`);

        const cost = await uscPublic.readContract({
            address: PROVER_ADDRESS as `0x${string}`,
            abi: PROVER_ABI,
            functionName: 'computeQueryCost',
            args: [query],
        }) as bigint;

        const hash = await uscWallet.writeContract({
            address: PROVER_ADDRESS as `0x${string}`,
            abi: PROVER_ABI,
            functionName: 'submitQuery',
            args: [query, account.address],
            value: cost,
            account
        } as any);

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

    sepoliaClient.watchContractEvent({
        address: MOIGYE_VAULT_ADDRESS as `0x${string}`,
        abi: MoigyeVaultABI,
        eventName: 'ContributionDeposited',
        onLogs: (logs) => logs.forEach(log => processDeposit(log, sepoliaClient))
    });

    uscPublic.watchContractEvent({
        address: PROVER_ADDRESS as `0x${string}`,
        abi: PROVER_ABI,
        eventName: 'QueryProofVerified',
        onLogs: async (logs) => {
            for (const log of logs) {
                const queryId = (log.args as any).queryId;
                console.log(`✅ Proof Verified: ${queryId}. Initializing GyeManager verify...`);
                try {
                    // In a production environment, we'd fetch the full proof from a Prover API or local storage
                    // For the hackathon, we assume the proof is available via the Native Query Verifier precompile logic
                    // This call would trigger GyeManager.verifyDeposit
                    console.log(`[Bridge] Proof ready for GyeManager sync.`);
                } catch (err) {
                    console.error("❌ Sync failed:", err);
                }
            }
        }
    });

    await new Promise(() => { });
}

main().catch(console.error);
