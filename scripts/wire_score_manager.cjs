#!/usr/bin/env node
/**
 * Wire the deployed ScoreManager into GyeManager using hardhat network config.
 * 
 * Usage: npx hardhat run scripts/wire_score_manager.cjs --network ctcTestnet
 */

const GYE_MANAGER_ADDRESS = "0xC6AF175200807DeE213f58D4C375a574284ba2f0";
const NEW_SCORE_MANAGER = "0xc4B94c1b7807bCd84cb84D523e83C709d4755aea";

async function main() {
    const hre = require("hardhat");
    const [signer] = await hre.ethers.getSigners();

    console.log(`\n📍 Signer:        ${signer.address}`);
    console.log(`📋 GyeManager:    ${GYE_MANAGER_ADDRESS}`);
    console.log(`🎯 ScoreManager:  ${NEW_SCORE_MANAGER}`);

    const gyeManager = await hre.ethers.getContractAt(
        ["function scoreManager() view returns (address)",
            "function owner() view returns (address)",
            "function setScoreManager(address _scoreManager) external"],
        GYE_MANAGER_ADDRESS,
        signer
    );

    const owner = await gyeManager.owner();
    const current = await gyeManager.scoreManager();
    console.log(`\n👑 Owner:          ${owner}`);
    console.log(`🔗 Current SM:    ${current}`);

    if (owner.toLowerCase() !== signer.address.toLowerCase()) {
        console.error("❌ You are not the owner!");
        process.exit(1);
    }

    if (current.toLowerCase() === NEW_SCORE_MANAGER.toLowerCase()) {
        console.log("✅ Already wired correctly — nothing to do.");
        return;
    }

    console.log("\n⏳ Calling setScoreManager...");
    const tx = await gyeManager.setScoreManager(NEW_SCORE_MANAGER);
    console.log(`   tx hash: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`   status:  ${receipt.status === 1 ? "✅ SUCCESS" : "❌ FAILED"}`);

    const updated = await gyeManager.scoreManager();
    console.log(`\n🔍 New scoreManager in GyeManager: ${updated}`);
    console.log(updated.toLowerCase() === NEW_SCORE_MANAGER.toLowerCase()
        ? "✅ Wired correctly!"
        : "❌ Mismatch — something went wrong.");
}

main()
    .then(() => process.exit(0))
    .catch(err => { console.error("❌", err.message); process.exit(1); });
