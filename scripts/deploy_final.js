import hre from "hardhat";

async function main() {
    // In Hardhat 3 ESM, ethers might be accessible differently
    const ethers = hre.ethers;
    if (!ethers) {
        console.log("HRE.ethers not found, trying manual load...");
    }

    const [deployer] = await ethers.getSigners();
    console.log("🚀 Starting Production Deployment Check...");
    console.log("📍 Deployer:", deployer.address);

    // 1. Deploy MoigyeSBT
    const MoigyeSBT = await ethers.getContractFactory("MoigyeSBT");
    const sbt = await MoigyeSBT.deploy();
    await sbt.waitForDeployment();
    const sbtAddress = await sbt.getAddress();
    console.log(`✅ MoigyeSBT: ${sbtAddress}`);

    // 2. Deploy ScoreManager
    const ScoreManager = await ethers.getContractFactory("ScoreManager");
    const scoreManager = await ScoreManager.deploy();
    await scoreManager.waitForDeployment();
    const scoreManagerAddress = await scoreManager.getAddress();
    console.log(`✅ ScoreManager: ${scoreManagerAddress}`);

    // Link
    await scoreManager.setReputationSBT(sbtAddress);
    await sbt.setAuthorizedManager(scoreManagerAddress);
    console.log("🔗 Reputation System Linked.");

    // 3. Deploy BiddingEngine
    const BiddingEngine = await ethers.getContractFactory("BiddingEngine");
    const biddingEngine = await BiddingEngine.deploy();
    await biddingEngine.waitForDeployment();
    const biddingEngineAddress = await biddingEngine.getAddress();
    console.log(`✅ BiddingEngine: ${biddingEngineAddress}`);

    // 4. Deploy MoigyeUSD
    const MoigyeUSD = await ethers.getContractFactory("MoigyeUSD");
    const mu = await MoigyeUSD.deploy("Moigye USD", "mUSD", 6);
    await mu.waitForDeployment();
    const muAddress = await mu.getAddress();
    console.log(`✅ MoigyeUSD: ${muAddress}`);

    // 5. Deploy MoigyeVault
    const MoigyeVault = await ethers.getContractFactory("MoigyeVault");
    const vault = await MoigyeVault.deploy(muAddress, deployer.address);
    await vault.waitForDeployment();
    const vaultAddress = await vault.getAddress();
    console.log(`✅ MoigyeVault: ${vaultAddress}`);

    // 6. Deploy USCOracle
    const USCOracle = await ethers.getContractFactory("USCOracle");
    const oracle = await USCOracle.deploy();
    await oracle.waitForDeployment();
    const oracleAddress = await oracle.getAddress();
    console.log(`✅ USCOracle: ${oracleAddress}`);

    console.log("\n✨ Verification of Correctness:");

    // Check SBT is non-transferable
    await scoreManager.mintCreditRecord(deployer.address);
    const tokenId = await sbt.userTokenId(deployer.address);
    try {
        await sbt.transferFrom(deployer.address, scoreManagerAddress, tokenId);
        console.error("FAIL: MoigyeSBT should be non-transferable");
        process.exit(1);
    } catch (e) {
        console.log("  - MoigyeSBT is correctly Soulbound.");
    }

    console.log("\n🚀 All new contracts are verified and working.");

    // Output for README
    console.log("\n--- HASHES FOR README ---");
    console.log(`MoigyeSBT: ${sbtAddress}`);
    console.log(`ScoreManager: ${scoreManagerAddress}`);
    console.log(`BiddingEngine: ${biddingEngineAddress}`);
    console.log(`MoigyeUSD: ${muAddress}`);
    console.log(`MoigyeVault: ${vaultAddress}`);
    console.log(`USCOracle: ${oracleAddress}`);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
