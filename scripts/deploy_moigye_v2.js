const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    const networkName = hre.network.name;

    console.log(`🚀 Starting Moigye Deployment on ${networkName}`);
    console.log(`📍 Deployer: ${deployer.address}`);
    console.log(`💰 Balance: ${hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address))} ETH/CTC`);

    const isHubChain = networkName === "uscTestnetV2" || networkName === "ctcTestnet";
    const isSpokeChain = networkName === "sepolia" || networkName === "baseSepolia";

    if (isHubChain) {
        console.log("\n--- HUB CHAIN DEPLOYMENT (Creditcoin) ---");

        // 1. ScoreManager
        console.log("📝 Deploying ScoreManager...");
        const ScoreManager = await hre.ethers.getContractFactory("ScoreManager");
        const scoreManager = await ScoreManager.deploy();
        await scoreManager.waitForDeployment();
        console.log(`✅ ScoreManager: ${await scoreManager.getAddress()}`);

        // 2. GyeStaking
        console.log("📝 Deploying GyeStaking...");
        const GyeStaking = await hre.ethers.getContractFactory("GyeStaking");
        const gyeStaking = await GyeStaking.deploy();
        await gyeStaking.waitForDeployment();
        console.log(`✅ GyeStaking: ${await gyeStaking.getAddress()}`);

        // 3. BiddingEngine
        console.log("📝 Deploying BiddingEngine...");
        const BiddingEngine = await hre.ethers.getContractFactory("BiddingEngine");
        const biddingEngine = await BiddingEngine.deploy();
        await biddingEngine.waitForDeployment();
        const biddingEngineAddress = await biddingEngine.getAddress();
        console.log(`✅ BiddingEngine: ${biddingEngineAddress}`);

        // 4. GyeManager
        console.log("📝 Deploying GyeManager...");
        const GyeManager = await hre.ethers.getContractFactory("GyeManager");
        const gyeManager = await GyeManager.deploy(biddingEngineAddress);
        await gyeManager.waitForDeployment();
        console.log(`✅ GyeManager: ${await gyeManager.getAddress()}`);

        console.log("\n✨ Hub Deployment Complete!");

    } else if (isSpokeChain) {
        console.log("\n--- SPOKE CHAIN DEPLOYMENT (Eth/Base) ---");

        // 1. Mock USDC
        console.log("📝 Deploying Mock USDC...");
        const MockERC20 = await hre.ethers.getContractFactory("MockERC20");
        const usdc = await MockERC20.deploy("USD Coin", "USDC", 6);
        await usdc.waitForDeployment();
        const usdcAddress = await usdc.getAddress();
        console.log(`✅ Mock USDC: ${usdcAddress}`);

        // 2. MoigyeVault
        console.log("📝 Deploying MoigyeVault...");
        const MoigyeVault = await hre.ethers.getContractFactory("MoigyeVault");
        // Validator address is the deployer for this test setup
        const vault = await MoigyeVault.deploy(usdcAddress, deployer.address);
        await vault.waitForDeployment();
        console.log(`✅ MoigyeVault: ${await vault.getAddress()}`);

        // 3. Mint some USDC
        console.log("💵 Minting test USDC...");
        const tx = await usdc.mint(deployer.address, hre.ethers.parseUnits("1000000", 6));
        await tx.wait();
        console.log("✅ Minted 1,000,000 USDC to deployer");

        console.log("\n✨ Spoke Deployment Complete!");

    } else {
        console.log("❌ Unsupported network. Please use --network sepolia or --network uscTestnetV2");
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
