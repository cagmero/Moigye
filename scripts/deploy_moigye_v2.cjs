const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    const networkName = hre.network.name;

    console.log(`🚀 Starting Moigye Deployment on ${networkName}`);
    console.log(`📍 Deployer: ${deployer.address}`);
    console.log(`💰 Balance: ${hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address))} ETH/CTC`);

    const isHubChain = networkName === "uscTestnetV2" || networkName === "ctcTestnet" || networkName === "hardhat" || networkName === "localhost";
    const isSpokeChain = networkName === "sepolia" || networkName === "baseSepolia";

    if (isHubChain) {
        console.log("\n--- HUB CHAIN DEPLOYMENT (Creditcoin) ---");

        // 1. MoigyeSBT
        console.log("📝 Deploying MoigyeSBT...");
        const MoigyeSBT = await hre.ethers.getContractFactory("MoigyeSBT");
        const sbt = await MoigyeSBT.deploy();
        await sbt.waitForDeployment();
        const sbtAddress = await sbt.getAddress();
        console.log(`✅ MoigyeSBT: ${sbtAddress}`);

        // 2. ScoreManager
        console.log("📝 Deploying ScoreManager...");
        const ScoreManager = await hre.ethers.getContractFactory("ScoreManager");
        const scoreManager = await ScoreManager.deploy();
        await scoreManager.waitForDeployment();
        const scoreManagerAddress = await scoreManager.getAddress();
        console.log(`✅ ScoreManager: ${scoreManagerAddress}`);

        // Link SBT and ScoreManager
        console.log("🔗 Linking SBT and ScoreManager...");
        await scoreManager.setReputationSBT(sbtAddress);
        await sbt.setAuthorizedManager(scoreManagerAddress);

        // 3. GyeStaking
        console.log("📝 Deploying GyeStaking...");
        const GyeStaking = await hre.ethers.getContractFactory("GyeStaking");
        const gyeStaking = await GyeStaking.deploy();
        await gyeStaking.waitForDeployment();
        console.log(`✅ GyeStaking: ${await gyeStaking.getAddress()}`);

        // 4. BiddingEngine
        console.log("📝 Deploying BiddingEngine...");
        const BiddingEngine = await hre.ethers.getContractFactory("BiddingEngine");
        const biddingEngine = await BiddingEngine.deploy();
        await biddingEngine.waitForDeployment();
        const biddingEngineAddress = await biddingEngine.getAddress();
        console.log(`✅ BiddingEngine: ${biddingEngineAddress}`);

        // 5. GyeManager
        console.log("📝 Deploying GyeManager...");
        const GyeManager = await hre.ethers.getContractFactory("GyeManager");
        const gyeManager = await GyeManager.deploy(biddingEngineAddress);
        await gyeManager.waitForDeployment();
        console.log(`✅ GyeManager: ${await gyeManager.getAddress()}`);

        // 6. USCOracle
        console.log("📝 Deploying USCOracle...");
        const USCOracle = await hre.ethers.getContractFactory("USCOracle");
        const oracle = await USCOracle.deploy();
        await oracle.waitForDeployment();
        console.log(`✅ USCOracle: ${await oracle.getAddress()}`);

        console.log("\n✨ Hub Deployment Complete!");
    }

    if (isSpokeChain || networkName === "hardhat" || networkName === "localhost") {
        console.log("\n--- SPOKE CHAIN DEPLOYMENT (Eth/Base) ---");

        // 1. MoigyeUSD
        console.log("📝 Deploying MoigyeUSD...");
        const MoigyeUSD = await hre.ethers.getContractFactory("MoigyeUSD");
        const usdc = await MoigyeUSD.deploy("Moigye USD", "mUSD", 18);
        await usdc.waitForDeployment();
        const usdcAddress = await usdc.getAddress();
        console.log(`✅ MoigyeUSD: ${usdcAddress}`);

        // 2. MoigyeVault
        console.log("📝 Deploying MoigyeVault...");
        const MoigyeVault = await hre.ethers.getContractFactory("MoigyeVault");
        const vault = await MoigyeVault.deploy(usdcAddress, deployer.address);
        await vault.waitForDeployment();
        console.log(`✅ MoigyeVault: ${await vault.getAddress()}`);

        // 3. Mint some mUSD
        console.log("💵 Minting test mUSD...");
        const tx = await usdc.mint(deployer.address, hre.ethers.parseUnits("1000000", 18));
        await tx.wait();
        console.log("✅ Minted 1,000,000 mUSD to deployer");

        console.log("\n✨ Spoke Deployment Complete!");
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
