// scripts/fund_user.mjs
// Mints MoigyeUSD to a target wallet on Sepolia (spoke chain)
// Usage: node --env-file=.env scripts/fund_user.mjs
import { ethers } from "ethers";
import * as dotenv from "dotenv";
dotenv.config();

// ── Config ────────────────────────────────────────────────────────────────────
const TARGET_ADDRESS = "0xA72AE11555AA16aA602A8BD3C89006F75d7738F5";
const MOIGYE_USD_ADDRESS = process.env.MOIGYE_USD_ADDRESS || "0x4ed7c06655c1b138c84014c119902c0039725807";
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL;

if (!PRIVATE_KEY || !SEPOLIA_RPC_URL) {
    console.error("❌ Missing PRIVATE_KEY or SEPOLIA_RPC_URL in .env");
    process.exit(1);
}

// MoigyeUSD minimal ABI — only what we need
const MOIGYE_USD_ABI = [
    "function mint(address to, uint256 amount) external",
    "function balanceOf(address account) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)",
    "function owner() view returns (address)",
];

async function main() {
    const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const moigyeUSD = new ethers.Contract(MOIGYE_USD_ADDRESS, MOIGYE_USD_ABI, wallet);

    const decimals = await moigyeUSD.decimals();
    const symbol = await moigyeUSD.symbol();
    const owner = await moigyeUSD.owner();

    console.log(`\n🔗  Network  : Ethereum Sepolia`);
    console.log(`📍  Deployer : ${wallet.address}`);
    console.log(`👑  Token Owner: ${owner}`);
    console.log(`🪙  Token   : ${symbol} (${decimals} decimals)`);
    console.log(`🎯  Target  : ${TARGET_ADDRESS}`);
    console.log(`📋  Contract: ${MOIGYE_USD_ADDRESS}\n`);

    if (owner.toLowerCase() !== wallet.address.toLowerCase()) {
        console.error(`❌ This wallet is not the owner of ${symbol}. Only the owner can mint.`);
        console.error(`   Owner is: ${owner}`);
        process.exit(1);
    }

    // Mint 100,000 MoigyeUSD (with correct decimals)
    const MINT_AMOUNT = ethers.parseUnits("100000", decimals);
    console.log(`📦  Minting 100,000 ${symbol} to ${TARGET_ADDRESS}...`);

    const balanceBefore = await moigyeUSD.balanceOf(TARGET_ADDRESS);
    console.log(`   Balance before: ${ethers.formatUnits(balanceBefore, decimals)} ${symbol}`);

    const tx = await moigyeUSD.mint(TARGET_ADDRESS, MINT_AMOUNT, { gasLimit: 100_000 });
    console.log(`   Tx sent: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`   Confirmed in block ${receipt?.blockNumber}`);

    const balanceAfter = await moigyeUSD.balanceOf(TARGET_ADDRESS);
    console.log(`\n✅  Balance after : ${ethers.formatUnits(balanceAfter, decimals)} ${symbol}`);
    console.log(`🎉  Funded ${TARGET_ADDRESS} successfully!\n`);
}

main().catch(err => { console.error("❌", err.message ?? err); process.exit(1); });
