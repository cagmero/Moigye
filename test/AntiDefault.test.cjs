const { expect } = require("chai");
const hre = require("hardhat");
const { ethers } = hre;

describe("Moigye Anti-Default Verification", function () {
    let sbt, scoreManager, biddingEngine, vault, usdc;
    let owner, user1, user2, user3;

    beforeEach(async function () {
        [owner, user1, user2, user3] = await ethers.getSigners();

        // 1. Deploy MoigyeSBT
        const MoigyeSBT = await ethers.getContractFactory("MoigyeSBT");
        sbt = await MoigyeSBT.deploy();

        // 2. Deploy ScoreManager
        const ScoreManager = await ethers.getContractFactory("ScoreManager");
        scoreManager = await ScoreManager.deploy();
        await scoreManager.setReputationSBT(await sbt.getAddress());
        await sbt.setAuthorizedManager(await scoreManager.getAddress());

        // 3. Deploy BiddingEngine
        const BiddingEngine = await ethers.getContractFactory("BiddingEngine");
        biddingEngine = await BiddingEngine.deploy();

        // 4. Deploy MoigyeUSD (production ready replacement)
        const MoigyeUSD = await ethers.getContractFactory("MoigyeUSD");
        usdc = await MoigyeUSD.deploy("Moigye USD", "mUSD", 18);

        const MoigyeVault = await ethers.getContractFactory("MoigyeVault");
        vault = await MoigyeVault.deploy(await usdc.getAddress(), owner.address);
    });

    describe("Phase 1: Reputation System (SBT)", function () {
        it("Should prevent transferring SBTs", async function () {
            await scoreManager.mintCreditRecord(user1.address);
            const tokenId = await sbt.userTokenId(user1.address);
            expect(tokenId).to.not.equal(0n);

            await expect(
                sbt.connect(user1).transferFrom(user1.address, user2.address, tokenId)
            ).to.be.revertedWith("SBT: Non-transferable");
        });

        it("Should update status to Defaulted via ScoreManager", async function () {
            await scoreManager.mintCreditRecord(user1.address);
            await scoreManager.recordDefault(user1.address);

            const status = await sbt.getStatus(user1.address);
            expect(status).to.equal(2n); // Status.Defaulted
        });
    });

    describe("Phase 2: Financial Lock (Bond)", function () {
        it("Should calculate 70/30 payout split correctly", async function () {
            const monthlyContribution = ethers.parseUnits("100", 18);
            const groupId = 1;
            const members = [user1.address, user2.address, user3.address];

            await biddingEngine.createGyeGroup(groupId, members, monthlyContribution, 0);

            // Mock a win with 10 USDC discount
            const discount = ethers.parseUnits("10", 18);
            await biddingEngine.startDepositWindow(groupId);
            await biddingEngine.startRound1(groupId);
            await biddingEngine.connect(user1).submitBid(groupId, discount);

            const pot = monthlyContribution * BigInt(members.length); // 300
            const totalPayout = pot - discount; // 290
            const expectedImmediate = (totalPayout * 70n) / 100n; // 203
            const expectedBond = totalPayout - expectedImmediate; // 87

            await expect(biddingEngine.endRound1(groupId))
                .to.emit(biddingEngine, "WinnerSelected")
                .withArgs(groupId, user1.address, expectedImmediate, expectedBond, ethers.parseUnits("5", 18));
        });

        it("Should lock 30% bond in MoigyeVault during payout", async function () {
            const totalAmount = ethers.parseUnits("100", 18);
            const roundId = 1;
            const nonce = 1;

            await usdc.mint(await vault.getAddress(), totalAmount);

            // Create EIP712 signature for payout
            const domain = {
                name: "Moigye_Vault",
                version: "1.0.0",
                chainId: (await ethers.provider.getNetwork()).chainId,
                verifyingContract: await vault.getAddress()
            };
            const types = {
                Payout: [
                    { name: "winner", type: "address" },
                    { name: "amount", type: "uint256" },
                    { name: "roundId", type: "uint256" },
                    { name: "nonce", type: "uint256" }
                ]
            };
            const value = {
                winner: user1.address,
                amount: totalAmount,
                roundId: roundId,
                nonce: nonce
            };

            const signature = await owner.signTypedData(domain, types, value);

            const initialBalance = await usdc.balanceOf(user1.address);
            await vault.executePayout(user1.address, totalAmount, roundId, nonce, signature);

            const finalBalance = await usdc.balanceOf(user1.address);
            const payoutImmediate = (totalAmount * 70n) / 100n;
            const lockedBond = totalAmount - payoutImmediate;

            expect(finalBalance - initialBalance).to.equal(payoutImmediate);
            expect(await vault.lockedBonds(roundId, user1.address)).to.equal(lockedBond);
        });
    });
});
