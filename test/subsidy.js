const { ethers, getNamedAccounts } = require("hardhat");
const chai = require("chai");
const { solidity } = require("ethereum-waffle");
chai.use(solidity);
const { expect } = chai;

const rarityUtils = require("./utils/rarity.js");
const { BigNumber, constants } = require("ethers");

const randomAddress = "0x52dF56A3fa758c4542Fc92ad8485ED7183f2ab4d";
const nullAddress = "0x0000000000000000000000000000000000000000";

const setup = deployments.createFixture(async () => {
  const [deployer, nondeployer] = await ethers.getSigners();
  await deployments.fixture(["Apple_Subsidy_1"]);
  await deployments.get("Apple_Subsidy_1");
  subsidy = await ethers.getContract("Apple_Subsidy_1");
  const summoners = await rarityUtils.newSummoners(deployer, nondeployer);
  return [subsidy, summoners];
});

describe("Subsidy", function () {
  let apple,
    subsidy,
    deployer,
    nondeployer,
    deployerSummoner,
    nondeployerSummoner;

  beforeEach(async () => {
    const users = await getNamedAccounts();
    deployer = await ethers.getSigner(users.deployer);
    nondeployer = await ethers.getSigner(users.nondeployer);
    [subsidy, [deployerSummoner, nondeployerSummoner]] = await setup();
    apple = await ethers.getContract("Apple");
    await apple
      .connect(deployer)
      .burnApprove(
        deployerSummoner,
        subsidy.address,
        constants.WeiPerEther.mul(999999999)
      );

    await apple
      .connect(nondeployer)
      .burnApprove(
        nondeployerSummoner,
        subsidy.address,
        constants.WeiPerEther.mul(999999999)
      );

    await apple.connect(deployer).addMinter(deployer.address);
    await apple
      .connect(deployer)
      .mint(deployerSummoner, constants.WeiPerEther.mul(999999999));
    await apple
      .connect(deployer)
      .mint(nondeployerSummoner, constants.WeiPerEther.mul(999999999));
  });

  it("should deploy subsidy", async () => {
    expect(await subsidy.resource()).to.equal(apple.address);
    expect((await subsidy.startDate()).toNumber()).to.not.equal(
      BigNumber.from(0)
    );
    expect((await subsidy.endDate()).toNumber()).to.not.equal(
      BigNumber.from(0)
    );
    expect(await subsidy.owner()).to.equal(deployer.address);
    expect(await ethers.provider.getBalance(subsidy.address)).to.equal(
      constants.WeiPerEther.mul(2)
    );
    expect((await subsidy.getSummoners()).length).to.equal(0);
  });

  describe("score", () => {
    it("should fail if start date not met", async () => {
      try {
        const start = await subsidy.startDate();
        await ethers.provider.send("evm_setNextBlockTimestamp", [
          start.toNumber() - 30,
        ]);
        await ethers.provider.send("evm_mine");
        await subsidy.score(deployerSummoner, constants.WeiPerEther);
        throw new Error();
      } catch (err) {
        expect(err.message).to.contain("Competition not started");
      }
    });

    it("should fail if end date passed", async () => {
      try {
        const end = await subsidy.endDate();
        await ethers.provider.send("evm_setNextBlockTimestamp", [
          end.toNumber() + 1,
        ]);
        await ethers.provider.send("evm_mine");
        await subsidy.score(deployerSummoner, constants.WeiPerEther);
        throw new Error();
      } catch (err) {
        expect(err.message).to.contain("Competition closed");
      }
    });

    it("should fail if not NFT owner", async () => {
      try {
        const start = await subsidy.startDate();
        await ethers.provider.send("evm_setNextBlockTimestamp", [
          start.toNumber() + 30,
        ]);
        await ethers.provider.send("evm_mine");
        await subsidy.score(nondeployerSummoner, constants.WeiPerEther);
        throw new Error();
      } catch (err) {
        expect(err.message).to.contain("Must own NFT");
      }
    });

    it("should succeed if competion is valid", async () => {
      const start = await subsidy.startDate();
      await ethers.provider.send("evm_setNextBlockTimestamp", [
        start.toNumber() + 1,
      ]);
      await ethers.provider.send("evm_mine");
      const amount = constants.WeiPerEther.mul(3);
      const result = await subsidy.score(deployerSummoner, amount);
      const receipt = await result.wait();
      const log = receipt.events?.filter((x) => {
        return x.event == "Score";
      })[0];
      // Check score
      const score = await subsidy.scores(deployerSummoner);
      expect(score).to.equal(amount.mul(log.args[1]));
      expect((await subsidy.getSummoners()).length).to.equal(1);
      expect(await subsidy.totalBurned()).to.equal(amount);

      // Score again
      const result1 = await subsidy.score(deployerSummoner, amount);
      const receipt1 = await result1.wait();
      const log1 = receipt1.events?.filter((x) => {
        return x.event == "Score";
      })[0];

      const newScore = await subsidy.scores(deployerSummoner);
      expect(newScore).to.equal(score.add(amount.mul(log1.args[1])));
      expect((await subsidy.getSummoners()).length).to.equal(1);
      expect(await subsidy.totalBurned()).to.equal(amount.mul(2));
    });
  });

  describe("claim", () => {
    it("should fail end date not met", async () => {
      try {
        const end = await subsidy.endDate();
        await ethers.provider.send("evm_setNextBlockTimestamp", [
          end.toNumber() - 30,
        ]);
        await ethers.provider.send("evm_mine");
        await subsidy.claim(deployerSummoner);
        throw new Error();
      } catch (err) {
        expect(err.message).to.contain("Competition not over");
      }
    });

    it("should fail not NFT owner", async () => {
      try {
        const start = await subsidy.startDate();
        await ethers.provider.send("evm_setNextBlockTimestamp", [
          start.toNumber() + 30,
        ]);
        await ethers.provider.send("evm_mine");
        await subsidy.score(nondeployerSummoner, constants.WeiPerEther);
        throw new Error();
      } catch (err) {
        expect(err.message).to.contain("Must own NFT");
      }
    });

    it("should fail if summoner lost", async () => {
      try {
        const start = await subsidy.startDate();
        await ethers.provider.send("evm_setNextBlockTimestamp", [
          start.toNumber() + 1,
        ]);
        await ethers.provider.send("evm_mine");
        await subsidy
          .connect(nondeployer)
          .score(nondeployerSummoner, constants.WeiPerEther.mul(300));
        await subsidy.score(deployerSummoner, constants.WeiPerEther.mul(3));
        expect((await subsidy.getSummoners()).length).to.equal(2);
        const end = await subsidy.endDate();
        await ethers.provider.send("evm_setNextBlockTimestamp", [
          end.toNumber() + 1,
        ]);
        await ethers.provider.send("evm_mine");
        await subsidy.claim(deployerSummoner);
        throw new Error();
      } catch (err) {
        expect(err.message).to.contain("Not the winner");
        expect(await subsidy.claimed()).to.equal(false);
      }
    });

    it("should succeed if summoner won", async () => {
      const start = await subsidy.startDate();
      await ethers.provider.send("evm_setNextBlockTimestamp", [
        start.toNumber() + 1,
      ]);
      await ethers.provider.send("evm_mine");
      await subsidy
        .connect(nondeployer)
        .score(nondeployerSummoner, constants.WeiPerEther.mul(300));
      await subsidy.score(deployerSummoner, constants.WeiPerEther.mul(3));
      const end = await subsidy.endDate();
      await ethers.provider.send("evm_setNextBlockTimestamp", [
        end.toNumber() + 1,
      ]);
      await ethers.provider.send("evm_mine");

      const balance = await ethers.provider.getBalance(nondeployer.address);

      await subsidy.connect(nondeployer).claim(nondeployerSummoner);
      expect(await ethers.provider.getBalance(subsidy.address)).to.equal(
        BigNumber.from(0)
      );
      expect(await ethers.provider.getBalance(nondeployer.address)).to.equal(
        balance.add(constants.WeiPerEther.mul(2))
      );
      expect(await subsidy.claimed()).to.equal(true);
    });

    it("should fail if claimed", async () => {
      try {
        const start = await subsidy.startDate();
        await ethers.provider.send("evm_setNextBlockTimestamp", [
          start.toNumber() + 1,
        ]);
        await ethers.provider.send("evm_mine");
        await subsidy
          .connect(nondeployer)
          .score(nondeployerSummoner, constants.WeiPerEther.mul(300));
        await subsidy.score(deployerSummoner, constants.WeiPerEther.mul(3));
        const end = await subsidy.endDate();
        await ethers.provider.send("evm_setNextBlockTimestamp", [
          end.toNumber() + 1,
        ]);
        await ethers.provider.send("evm_mine");
        await subsidy.connect(nondeployer).claim(nondeployerSummoner);
        await subsidy.connect(nondeployer).claim(nondeployerSummoner);
      } catch (err) {
        expect(err.message).to.contain("Already Claimed");
      }
    });
  });

  describe("withdrawl", () => {
    it("should fail if competition started", async () => {
      try {
        const start = await subsidy.startDate();
        await ethers.provider.send("evm_setNextBlockTimestamp", [
          start.toNumber() + 30,
        ]);
        await ethers.provider.send("evm_mine");
        await subsidy.withdrawl();
        throw new Error();
      } catch (err) {
        expect(err.message).to.contain("Cannot withdrawl");
      }
    });

    it("should fail if not owner", async () => {
      try {
        const start = await subsidy.startDate();
        await ethers.provider.send("evm_setNextBlockTimestamp", [
          start.toNumber() - 1,
        ]);
        await ethers.provider.send("evm_mine");
        await subsidy.connect(nondeployer).withdrawl();
        throw new Error();
      } catch (err) {
        expect(err.message).to.contain("Must be owner");
      }
    });

    it("should succeed if competition has not started", async () => {
      const start = await subsidy.startDate();
      await ethers.provider.send("evm_setNextBlockTimestamp", [
        start.toNumber() - 100,
      ]);
      await ethers.provider.send("evm_mine");
      const balance = await ethers.provider.getBalance(deployer.address);
      await subsidy.withdrawl();
      const newBalance = await ethers.provider.getBalance(deployer.address);
      expect(newBalance).to.equal(balance.add(constants.WeiPerEther.mul(2)));
      expect(await ethers.provider.getBalance(subsidy.address)).to.equal(
        BigNumber.from(0)
      );
    });

    it("should succeed if competition is 7 days past", async () => {
      const end = await subsidy.endDate();
      await ethers.provider.send("evm_setNextBlockTimestamp", [
        end.add(BigNumber.from(86400 * 8)).toNumber(),
      ]);
      await ethers.provider.send("evm_mine");
      const balance = await ethers.provider.getBalance(deployer.address);
      await subsidy.withdrawl();
      const newBalance = await ethers.provider.getBalance(deployer.address);
      expect(newBalance).to.equal(balance.add(constants.WeiPerEther.mul(2)));
      expect(await ethers.provider.getBalance(subsidy.address)).to.equal(
        BigNumber.from(0)
      );
    });
  });
});
