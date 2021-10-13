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
  await deployments.fixture(["FruitFarm"]);
  await deployments.get("FruitFarm");
  farm = await ethers.getContract("FruitFarm");
  const summoners = await rarityUtils.newSummoners(deployer, nondeployer);
  return [farm, summoners];
});

describe("FruitFarm", function () {
  let farm, apple, deployer, nondeployer, deployerSummoner, nondeployerSummoner;

  before(async () => {
    const users = await getNamedAccounts();
    deployer = await ethers.getSigner(users.deployer);
    nondeployer = await ethers.getSigner(users.nondeployer);
  });

  beforeEach(async () => {
    [farm, [deployerSummoner, nondeployerSummoner]] = await setup();
    apple = await ethers.getContract("Apple");
  });

  it("should deploy farm", async () => {
    expect(await farm.isPaused()).to.equal(false);
    expect(await farm.getDisaster()).to.equal(nullAddress);
    expect(await farm.getOwner()).to.equal(deployer.address);
    expect(await farm.getMultipliers()).to.eql([3, 3, 3, 3]);
  });

  describe("addPauser", () => {
    it("should error if not owner", async function () {
      try {
        await farm.connect(nondeployer).addPauser(nondeployer.address);
      } catch (err) {
        expect(err.message).to.contain("Must be owner");
      }
    });

    it("should add a pauser", async function () {
      await farm.connect(deployer).addPauser(nondeployer.address);
      expect(await farm.pausers(nondeployer.address)).to.equal(true);
    });
  });

  describe("removePauser", () => {
    it("should error if not owner", async function () {
      try {
        await farm.connect(nondeployer).removePauser(nondeployer.address);
      } catch (err) {
        expect(err.message).to.contain("Must be owner");
      }
    });

    it("should remove a pauser", async function () {
      await farm.connect(deployer).addPauser(nondeployer.address);
      expect(await farm.pausers(nondeployer.address)).to.equal(true);
      await farm.connect(deployer).removePauser(nondeployer.address);
      expect(await farm.pausers(nondeployer.address)).to.equal(false);
    });
  });

  describe("pause", () => {
    it("should error if not pauser", async function () {
      try {
        await farm.connect(deployer).pause();
        expect(await farm.isPaused()).to.equal(true);
      } catch (err) {
        expect(err.message).to.contain("Pause denied");
      }
    });

    it("should set pause", async function () {
      await farm.connect(deployer).addPauser(nondeployer.address);
      await farm.connect(nondeployer).pause();
      expect(await farm.isPaused()).to.equal(true);
    });
  });

  describe("unpause", () => {
    it("should error if not pauser", async function () {
      try {
        await farm.connect(deployer).unpause();
      } catch (err) {
        expect(err.message).to.contain("Unpause denied");
        expect(await farm.isPaused()).to.equal(false);
      }
    });

    it("should unpause", async function () {
      await farm.connect(deployer).addPauser(nondeployer.address);
      await farm.connect(nondeployer).unpause();
      expect(await farm.isPaused()).to.equal(false);
    });
  });

  describe("setDisaster", () => {
    it("should error if not owner", async function () {
      try {
        await farm.connect(nondeployer).setDisaster(randomAddress);
      } catch (err) {
        expect(err.message).to.contain("Must be owner");
        expect(await farm.getDisaster()).to.equal(nullAddress);
      }
    });

    it("should set disaster", async function () {
      await farm.connect(deployer).setDisaster(randomAddress);
      expect(await farm.getDisaster()).to.equal(randomAddress);
      expect(await farm.pausers(randomAddress)).to.equal(true);
      expect(await farm.isPaused()).to.equal(true);
    });
  });

  describe("clearDisaster", () => {
    it("should error if not owner or disaster", async function () {
      try {
        await farm.connect(deployer).setDisaster(randomAddress);
        await farm.connect(nondeployer).clearDisaster();
      } catch (err) {
        expect(err.message).to.contain("Must be owner or disaster");
        expect(await farm.getDisaster()).to.equal(randomAddress);
      }
    });

    it("should clear disaster if owner", async function () {
      await farm.connect(deployer).setDisaster(randomAddress);
      await farm.connect(deployer).clearDisaster();
      expect(await farm.getDisaster()).to.equal(nullAddress);
    });

    it("should clear disaster if disaster", async function () {
      await farm.connect(deployer).setDisaster(nondeployer.address);
      await farm.connect(nondeployer).clearDisaster();
      expect(await farm.getDisaster()).to.equal(nullAddress);
      expect(await farm.pausers(randomAddress)).to.equal(false);
      expect(await farm.isPaused()).to.equal(false);
    });
  });

  describe("farm", () => {
    it("should error if paused", async function () {
      try {
        await farm.connect(deployer).addPauser(nondeployer.address);
        await farm.connect(nondeployer).pause();
        await farm.connect(nondeployer).farm(nondeployerSummoner, 0);
      } catch (err) {
        expect(err.message).to.contain("Farm not available");
      }
    });

    it("should farm apples resource", async function () {
      await rarityUtils.contracts.rarity
        .connect(nondeployer)
        .approve(farm.address, nondeployerSummoner);
      const result = await farm
        .connect(nondeployer)
        .farm(nondeployerSummoner, 0);
      expect(await apple.balanceOf(nondeployerSummoner)).to.equal(
        constants.WeiPerEther.mul(3)
      );

      const receipt = await result.wait();
      const log = receipt.events?.filter((x) => {
        return x.event == "FarmResource";
      })[0];

      expect(log.args[0]).to.equal(nondeployerSummoner);
      expect(log.args[1]).to.equal(apple.address);
      expect(log.args[2]).to.equal(constants.WeiPerEther.mul(3));
    });
  });
});
