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
  await deployments.fixture(["Meal"]);
  await deployments.get("Meal");
  meal = await ethers.getContract("Meal");
  const summoners = await rarityUtils.newSummoners(deployer, nondeployer);
  return [meal, summoners];
});

describe("Meal", function () {
  let meal, corn, deployer, nondeployer, deployerSummoner, nondeployerSummoner;

  before(async () => {
    const users = await getNamedAccounts();
    deployer = await ethers.getSigner(users.deployer);
    nondeployer = await ethers.getSigner(users.nondeployer);
    corn = await ethers.getContract("Corn");
  });

  beforeEach(async () => {
    [meal, [deployerSummoner, nondeployerSummoner]] = await setup();
  });

  it("should deploy resource", async () => {
    expect(await meal.totalSupply()).to.equal(0);
    expect(await meal.getAbilityIncreasers()).to.eql([0, 0, 0, 0, 0, 0]);
    expect(await meal.getAbilityDecreasers()).to.eql([0, 0, 0, 0, 0, 0]);
    expect(await meal.getPointIncreasers()).to.eql([0, 0, 0]);
    expect(await meal.getPointDecreasers()).to.eql([0, 0, 0]);
    expect(await meal.weight()).to.equal(5);
  });

  describe("Add Minter", () => {
    it("should error if not deployer", async function () {
      try {
        expect(
          await meal.connect(nondeployer).addMinter(randomAddress)
        ).to.be.revertedWith("Must be owner");
      } catch (err) {
        // Should be able to remove this in the future if they fix the reverted with chai matcher
        expect(err.message).to.contain("Must be owner");
      }
    });

    it("add a minter if owner", async function () {
      try {
        expect(await meal.minters(nondeployer.address)).to.be.equal(false);
        const result = await meal
          .connect(deployer)
          .addMinter(nondeployer.address);
        expect(await meal.minters(nondeployer.address)).to.be.equal(true);
      } catch (err) {}
    });
  });

  describe("Remove Minter", () => {
    it("should error if not owner", async function () {
      try {
        expect(
          await meal.connect(nondeployer).removeMinter(randomAddress)
        ).to.be.revertedWith("Must be owner");
      } catch (err) {
        // Should be able to remove this in the future if they fix the reverted with chai matcher
        expect(err.message).to.contain("Must be owner");
      }
    });

    it("remove minter if owner", async function () {
      try {
        await meal.connect(deployer).addMinter(nondeployer.address);
        expect(await meal.minters(nondeployer.address)).to.be.equal(true);
        const result = await meal
          .connect(deployer)
          .removeMinter(nondeployer.address);
        expect(await meal.minters(nondeployer.address)).to.be.equal(false);
      } catch (err) {}
    });
  });

  describe("Mint", () => {
    it("should error if paused", async function () {
      try {
        await meal.connect(deployer).pause();
        await meal.connect(nondeployer).mint(11, 11);
      } catch (err) {
        expect(err.message).to.contain("Contract is paused");
      }
    });
    it("should error if owner", async function () {
      try {
        expect(await meal.minters(deployer.address)).to.be.equal(false);
        expect(await meal.connect(deployer).mint(11, 11)).to.be.revertedWith(
          "Mint Access Denied"
        );
      } catch (err) {
        // Should be able to remove this in the future if they fix the reverted with chai matcher
        expect(err.message).to.contain("Mint Access Denied");
      }
    });

    it("should error if nondeployer", async function () {
      try {
        expect(await meal.minters(nondeployer.address)).to.be.equal(false);
        expect(await meal.connect(nondeployer).mint(11, 11)).to.be.revertedWith(
          "Mint Access Denied"
        );
      } catch (err) {
        // Should be able to remove this in the future if they fix the reverted with chai matcher
        expect(err.message).to.contain("Mint Access Denied");
      }
    });

    it("should mint if address is minter", async function () {
      await meal.connect(deployer).addMinter(nondeployer.address);
      expect(await meal.minters(nondeployer.address)).to.be.equal(true);
      await meal.connect(nondeployer).mint(11, 13);
      expect(await meal.connect(nondeployer).balanceOf(11)).to.equal(13);
    });
  });

  describe("Burn", () => {
    it("should error if paused", async function () {
      try {
        await meal.connect(deployer).pause();
        await meal.connect(deployer).burn(nondeployerSummoner, 1);
      } catch (err) {
        expect(err.message).to.contain("Contract is paused");
      }
    });
    it("should error if not owner of NFT", async function () {
      try {
        await meal.connect(deployer).addMinter(nondeployer.address);
        await meal.connect(nondeployer).mint(nondeployerSummoner, 11);
        await meal.connect(deployer).burn(nondeployerSummoner, 1);
        // expect().to.be.revertedWith("Mint Access Denied");
      } catch (err) {
        // Should be able to remove this in the future if they fix the reverted with chai matcher
        expect(err.message).to.contain("Must be owner");
      }
    });

    it("should error if balance too low", async function () {
      try {
        await meal.connect(deployer).addMinter(nondeployer.address);
        await meal.connect(nondeployer).mint(nondeployerSummoner, 11);
        await meal.connect(nondeployer).burn(nondeployerSummoner, 12);
      } catch (err) {
        expect(err.message).to.contain("Balance too low");
      }
    });

    it("should succeed if owner of NFT", async function () {
      await meal.connect(deployer).addMinter(nondeployer.address);
      await meal.connect(nondeployer).mint(nondeployerSummoner, 11);
      const totalSupply = await meal.totalSupply();
      await meal.connect(nondeployer).burn(nondeployerSummoner, 1);
      expect(await meal.balanceOf(nondeployerSummoner)).to.be.equal(10);
      expect(await meal.totalSupply()).to.be.equal(totalSupply.sub(1));
    });
  });

  describe("burnApprove", () => {
    it("should error if not NFT owner", async function () {
      try {
        expect(
          await meal
            .connect(nondeployer)
            .burnApprove(deployerSummoner, nondeployer.address, 1000)
        ).to.be.revertedWith("Mint Access Denied");
      } catch (err) {
        expect(err.message).to.contain("Must be owner");
      }
    });

    it("should succeed if owner of NFT", async function () {
      await meal
        .connect(nondeployer)
        .burnApprove(nondeployerSummoner, deployer.address, 1000);
      expect(
        await meal.burnAllowance(deployer.address, nondeployerSummoner)
      ).to.equal(1000);
    });
  });

  describe("burnFrom", () => {
    it("should error if paused", async function () {
      try {
        await meal.connect(deployer).pause();
        await meal.connect(deployer).burnFrom(nondeployerSummoner, 1001);
      } catch (err) {
        expect(err.message).to.contain("Contract is paused");
      }
    });
    it("should error if amount is greater than approval", async function () {
      try {
        await meal.connect(deployer).addMinter(nondeployer.address);
        await meal.connect(nondeployer).mint(nondeployerSummoner, 1000);
        await meal
          .connect(nondeployer)
          .burnApprove(nondeployerSummoner, deployer.address, 1000);
        await meal.connect(deployer).burnFrom(nondeployerSummoner, 1001);
      } catch (err) {
        expect(err.message).to.contain("Requested Burn greater than approval");
      }
    });

    it("should succeed if approved and balance exists", async function () {
      await meal.connect(deployer).addMinter(nondeployer.address);
      await meal.connect(nondeployer).mint(nondeployerSummoner, 10000);
      await meal
        .connect(nondeployer)
        .burnApprove(nondeployerSummoner, deployer.address, 1000);
      expect(
        await meal.burnAllowance(deployer.address, nondeployerSummoner)
      ).to.equal(1000);
      const supply = await meal.totalSupply();
      const summonerSupply = await meal.balanceOf(nondeployerSummoner);
      await meal.connect(deployer).burnFrom(nondeployerSummoner, 1000);
      expect(
        await meal.burnAllowance(deployer.address, nondeployerSummoner)
      ).to.equal(0);
      expect(await meal.totalSupply()).to.equal(supply.sub(1000));
      expect(await meal.balanceOf(nondeployerSummoner)).to.equal(
        summonerSupply.sub(1000)
      );
    });
  });

  describe("transfer", () => {
    it("should error if paused", async function () {
      try {
        await meal.connect(deployer).addMinter(deployer.address);
        await meal.connect(deployer).mint(deployerSummoner, 1000);
        await meal.connect(deployer).pause();
        await meal
          .connect(deployer)
          .transfer(deployerSummoner, nondeployerSummoner, 500);
        expect(await meal.balanceOf(nondeployerSummoner)).to.equal(500);
      } catch (err) {
        expect(err.message).to.contain("Contract is paused");
      }
    });
    it("should error if you don't own the NFT", async function () {
      try {
        await meal.connect(deployer).addMinter(deployer.address);
        await meal.connect(deployer).mint(deployerSummoner, 1000);
        await meal
          .connect(nondeployer)
          .transfer(deployerSummoner, nondeployerSummoner, 500);
      } catch (err) {
        expect(err.message).to.contain("Must be owner");
      }
    });

    it("should succeed if you own the NFT", async function () {
      await meal.connect(deployer).addMinter(deployer.address);
      await meal.connect(deployer).mint(deployerSummoner, 1000);
      expect(await meal.balanceOf(nondeployerSummoner)).to.equal(0);
      await meal
        .connect(deployer)
        .transfer(deployerSummoner, nondeployerSummoner, 500);
      expect(await meal.balanceOf(nondeployerSummoner)).to.equal(500);
    });
  });

  describe("approve", () => {
    it("should error if you don't own the NFT", async function () {
      try {
        await meal.connect(deployer).addMinter(deployer.address);
        await meal.connect(deployer).mint(deployerSummoner, 1000);
        await meal
          .connect(nondeployer)
          .approve(deployerSummoner, nondeployerSummoner, 500);
      } catch (err) {
        expect(err.message).to.contain("Must be owner");
      }
    });

    it("should succeed if you own the NFT", async function () {
      await meal.connect(deployer).addMinter(deployer.address);
      await meal.connect(deployer).mint(deployerSummoner, 1000);
      expect(
        await meal.allowance(deployerSummoner, nondeployerSummoner)
      ).to.equal(0);
      await meal
        .connect(deployer)
        .approve(deployerSummoner, nondeployerSummoner, 500);
      expect(
        await meal.allowance(deployerSummoner, nondeployerSummoner)
      ).to.equal(500);
    });
  });

  describe("transferFrom", () => {
    it("should error if paused", async function () {
      try {
        await meal.connect(deployer).addMinter(deployer.address);
        await meal.connect(deployer).mint(deployerSummoner, 1000);
        await meal
          .connect(deployer)
          .approve(deployerSummoner, nondeployerSummoner, 500);
        await meal.connect(deployer).pause();
        await meal
          .connect(nondeployer)
          .transferFrom(
            deployerSummoner,
            deployerSummoner,
            nondeployerSummoner,
            500
          );
      } catch (err) {
        expect(err.message).to.contain("Contract is paused");
      }
    });

    it("should error if you don't own the NFT", async function () {
      try {
        await meal.connect(deployer).addMinter(deployer.address);
        await meal.connect(deployer).mint(deployerSummoner, 1000);
        await meal
          .connect(deployer)
          .approve(deployerSummoner, nondeployerSummoner, 500);
        await meal
          .connect(nondeployer)
          .transferFrom(
            deployerSummoner,
            deployerSummoner,
            nondeployerSummoner,
            500
          );
      } catch (err) {
        expect(err.message).to.contain("Must be owner");
      }
    });

    it("should error if you are not approved", async function () {
      try {
        await meal.connect(deployer).addMinter(deployer.address);
        await meal.connect(deployer).mint(deployerSummoner, 1000);
        // await meal.connect(deployer).approve(deployerSummoner, nondeployerSummoner, 500);
        await meal
          .connect(nondeployer)
          .transferFrom(
            nondeployerSummoner,
            deployerSummoner,
            nondeployerSummoner,
            500
          );
      } catch (err) {
        expect(err.message).to.contain("Transfer amount greater than approval");
      }
    });

    it("should error if amount exceeds approval", async function () {
      try {
        await meal.connect(deployer).addMinter(deployer.address);
        await meal.connect(deployer).mint(deployerSummoner, 1000);
        await meal
          .connect(deployer)
          .approve(deployerSummoner, nondeployerSummoner, 500);
        await meal
          .connect(nondeployer)
          .transferFrom(
            nondeployerSummoner,
            deployerSummoner,
            nondeployerSummoner,
            501
          );
      } catch (err) {
        expect(err.message).to.contain("Transfer amount greater than approval");
      }
    });

    it("should succeed if you are approved", async function () {
      await meal.connect(deployer).addMinter(deployer.address);
      await meal.connect(deployer).mint(deployerSummoner, 1000);
      await meal
        .connect(deployer)
        .approve(deployerSummoner, nondeployerSummoner, 500);
      expect(await meal.balanceOf(nondeployerSummoner)).to.equal(0);
      expect(
        await meal.allowance(deployerSummoner, nondeployerSummoner)
      ).to.equal(500);
      await meal
        .connect(nondeployer)
        .transferFrom(
          nondeployerSummoner,
          deployerSummoner,
          nondeployerSummoner,
          500
        );

      expect(await meal.balanceOf(nondeployerSummoner)).to.equal(500);
      expect(
        await meal.allowance(deployerSummoner, nondeployerSummoner)
      ).to.equal(0);
    });
  });

  describe("setOwner", () => {
    it("should error if not owner", async function () {
      try {
        await meal.connect(nondeployer).setOwner(randomAddress);
      } catch (err) {
        expect(err.message).to.contain("Must be owner");
      }
    });

    it("should change owner address", async function () {
      expect(await meal.owner()).to.equal(deployer.address);
      await meal.connect(deployer).setOwner(randomAddress);
      expect(await meal.owner()).to.equal(randomAddress);
    });
  });

  describe("Lock", () => {
    it("should error if not owner", async function () {
      try {
        await meal.connect(nondeployer).lock();
      } catch (err) {
        expect(err.message).to.contain("Must be owner");
      }
    });

    it("should lock the resource if owner", async () => {
      expect(await meal.locked()).to.equal(false);
      await meal.connect(deployer).lock();
      expect(await meal.locked()).to.equal(true);
    });
  });

  describe("setAbilityIncreasers", () => {
    it("should error if locked", async function () {
      try {
        await meal.connect(deployer).lock();
        await meal.connect(deployer).setAbilityIncreasers(1, 2, 3, 4, 5, 6);
      } catch (err) {
        expect(err.message).to.contain("Resource Locked");
      }
    });
    it("should error if not owner", async function () {
      try {
        await meal.connect(nondeployer).setAbilityIncreasers(1, 2, 3, 4, 5, 6);
      } catch (err) {
        expect(err.message).to.contain("Must be owner");
      }
    });

    it("should set ability increasers", async () => {
      expect(await meal.getAbilityIncreasers()).to.eql([0, 0, 0, 0, 0, 0]);
      await meal.connect(deployer).setAbilityIncreasers(1, 2, 3, 4, 5, 6);
      expect(await meal.getAbilityIncreasers()).to.eql([1, 2, 3, 4, 5, 6]);
    });
  });

  describe("setAbilityDecreasers", () => {
    it("should error if locked", async function () {
      try {
        await meal.connect(deployer).lock();
        await meal.connect(deployer).setAbilityDecreasers(1, 2, 3, 4, 5, 6);
      } catch (err) {
        expect(err.message).to.contain("Resource Locked");
      }
    });
    it("should error if not owner", async function () {
      try {
        await meal.connect(nondeployer).setAbilityDecreasers(1, 2, 3, 4, 5, 6);
      } catch (err) {
        expect(err.message).to.contain("Must be owner");
      }
    });

    it("should set ability decreasers", async () => {
      expect(await meal.getAbilityDecreasers()).to.eql([0, 0, 0, 0, 0, 0]);
      await meal.connect(deployer).setAbilityDecreasers(1, 2, 3, 4, 5, 6);
      expect(await meal.getAbilityDecreasers()).to.eql([1, 2, 3, 4, 5, 6]);
    });
  });

  describe("setPointIncreasers", () => {
    it("should error if locked", async function () {
      try {
        await meal.connect(deployer).lock();
        await meal.connect(deployer).setPointIncreasers(1, 2, 3);
      } catch (err) {
        expect(err.message).to.contain("Resource Locked");
      }
    });
    it("should error if not owner", async function () {
      try {
        await meal.connect(nondeployer).setPointIncreasers(1, 2, 3);
      } catch (err) {
        expect(err.message).to.contain("Must be owner");
      }
    });

    it("should set point increasers", async () => {
      expect(await meal.getPointIncreasers()).to.eql([0, 0, 0]);
      await meal.connect(deployer).setPointIncreasers(1, 2, 3);
      expect(await meal.getPointIncreasers()).to.eql([1, 2, 3]);
    });
  });

  describe("setPointDecreasers", () => {
    it("should error if locked", async function () {
      try {
        await meal.connect(deployer).lock();
        await meal.connect(deployer).setPointDecreasers(1, 2, 3);
      } catch (err) {
        expect(err.message).to.contain("Resource Locked");
      }
    });
    it("should error if not owner", async function () {
      try {
        await meal.connect(nondeployer).setPointDecreasers(1, 2, 3);
      } catch (err) {
        expect(err.message).to.contain("Must be owner");
      }
    });

    it("should set point decreasers", async () => {
      expect(await meal.getPointDecreasers()).to.eql([0, 0, 0]);
      await meal.connect(deployer).setPointDecreasers(1, 2, 3);
      expect(await meal.getPointDecreasers()).to.eql([1, 2, 3]);
    });
  });

  describe("setWeigth", () => {
    it("should error if locked", async function () {
      try {
        await meal.connect(deployer).lock();
        await meal.connect(deployer).setWeight(1);
      } catch (err) {
        expect(err.message).to.contain("Resource Locked");
      }
    });
    it("should error if not owner", async function () {
      try {
        await meal.connect(nondeployer).setWeight(1);
      } catch (err) {
        expect(err.message).to.contain("Must be owner");
      }
    });

    it("should set point decreasers", async () => {
      expect(await meal.weight()).to.eql(5);
      await meal.connect(deployer).setWeight(1);
      expect(await meal.weight()).to.equal(1);
    });
  });
});
