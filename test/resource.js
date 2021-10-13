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
  await deployments.fixture(["Apple"]);
  await deployments.get("Apple");
  apple = await ethers.getContract("Apple");
  const summoners = await rarityUtils.newSummoners(deployer, nondeployer);
  return [apple, summoners];
});

describe("Apple", function () {
  let apple, deployer, nondeployer, deployerSummoner, nondeployerSummoner;

  before(async () => {
    const users = await getNamedAccounts();
    deployer = await ethers.getSigner(users.deployer);
    nondeployer = await ethers.getSigner(users.nondeployer);
  });

  beforeEach(async () => {
    [apple, [deployerSummoner, nondeployerSummoner]] = await setup();
  });

  it("should deploy resource", async () => {
    expect(await apple.totalSupply()).to.equal(0);
    expect(await apple.getAbilityIncreasers()).to.eql([0, 0, 0, 0, 0, 0]);
    expect(await apple.getAbilityDecreasers()).to.eql([0, 0, 0, 0, 0, 0]);
    expect(await apple.getPointIncreasers()).to.eql([0, 1, 0]);
    expect(await apple.getPointDecreasers()).to.eql([0, 0, 0]);
    expect(await apple.getWeight()).to.equal(8);
    expect(await apple.owner()).to.equal(deployer.address);
    expect(await apple.paused()).to.equal(false);
  });

  describe("Add Minter", () => {
    it("should error if not deployer", async function () {
      try {
        expect(
          await apple.connect(nondeployer).addMinter(randomAddress)
        ).to.be.revertedWith("Must be owner");
      } catch (err) {
        // Should be able to remove this in the future if they fix the reverted with chai matcher
        expect(err.message).to.contain("Must be owner");
      }
    });

    it("add a minter if owner", async function () {
      try {
        expect(await apple.minters(nondeployer.address)).to.be.equal(false);
        const result = await apple
          .connect(deployer)
          .addMinter(nondeployer.address);
        expect(await apple.minters(nondeployer.address)).to.be.equal(true);
      } catch (err) {}
    });
  });

  describe("Remove Minter", () => {
    it("should error if not owner", async function () {
      try {
        expect(
          await apple.connect(nondeployer).removeMinter(randomAddress)
        ).to.be.revertedWith("Must be owner");
      } catch (err) {
        // Should be able to remove this in the future if they fix the reverted with chai matcher
        expect(err.message).to.contain("Must be owner");
      }
    });

    it("remove minter if owner", async function () {
      try {
        await apple.connect(deployer).addMinter(nondeployer.address);
        expect(await apple.minters(nondeployer.address)).to.be.equal(true);
        const result = await apple
          .connect(deployer)
          .removeMinter(nondeployer.address);
        expect(await apple.minters(nondeployer.address)).to.be.equal(false);
      } catch (err) {}
    });
  });

  describe("Mint", () => {
    it("should error if paused", async function () {
      try {
        await apple.connect(deployer).pause();
        await apple.connect(nondeployer).mint(11, 11);
      } catch (err) {
        expect(err.message).to.contain("Contract is paused");
      }
    });
    it("should error if owner", async function () {
      try {
        expect(await apple.minters(deployer.address)).to.be.equal(false);
        expect(await apple.connect(deployer).mint(11, 11)).to.be.revertedWith(
          "Mint Access Denied"
        );
      } catch (err) {
        // Should be able to remove this in the future if they fix the reverted with chai matcher
        expect(err.message).to.contain("Mint Access Denied");
      }
    });

    it("should error if nondeployer", async function () {
      try {
        expect(await apple.minters(nondeployer.address)).to.be.equal(false);
        expect(
          await apple.connect(nondeployer).mint(11, 11)
        ).to.be.revertedWith("Mint Access Denied");
      } catch (err) {
        // Should be able to remove this in the future if they fix the reverted with chai matcher
        expect(err.message).to.contain("Mint Access Denied");
      }
    });

    it("should mint if address is minter", async function () {
      await apple.connect(deployer).addMinter(nondeployer.address);
      expect(await apple.minters(nondeployer.address)).to.be.equal(true);
      await apple.connect(nondeployer).mint(11, 13);
      expect(await apple.connect(nondeployer).balanceOf(11)).to.equal(13);
    });
  });

  describe("Burn", () => {
    it("should error if paused", async function () {
      try {
        await apple.connect(deployer).pause();
        await apple.connect(deployer).burn(nondeployerSummoner, 1);
      } catch (err) {
        expect(err.message).to.contain("Contract is paused");
      }
    });
    it("should error if not owner of NFT", async function () {
      try {
        await apple.connect(deployer).addMinter(nondeployer.address);
        await apple.connect(nondeployer).mint(nondeployerSummoner, 11);
        await apple.connect(deployer).burn(nondeployerSummoner, 1);
        // expect().to.be.revertedWith("Mint Access Denied");
      } catch (err) {
        // Should be able to remove this in the future if they fix the reverted with chai matcher
        expect(err.message).to.contain("Must be owner");
      }
    });

    it("should error if balance too low", async function () {
      try {
        await apple.connect(deployer).addMinter(nondeployer.address);
        await apple.connect(nondeployer).mint(nondeployerSummoner, 11);
        await apple.connect(nondeployer).burn(nondeployerSummoner, 12);
      } catch (err) {
        expect(err.message).to.contain("0x11");
      }
    });

    it("should succeed if owner of NFT", async function () {
      await apple.connect(deployer).addMinter(nondeployer.address);
      await apple.connect(nondeployer).mint(nondeployerSummoner, 11);
      const totalSupply = await apple.totalSupply();
      await apple.connect(nondeployer).burn(nondeployerSummoner, 1);
      expect(await apple.balanceOf(nondeployerSummoner)).to.be.equal(10);
      expect(await apple.totalSupply()).to.be.equal(totalSupply.sub(1));
    });
  });

  describe("burnApprove", () => {
    it("should error if not NFT owner", async function () {
      try {
        expect(
          await apple
            .connect(nondeployer)
            .burnApprove(deployerSummoner, nondeployer.address, 1000)
        ).to.be.revertedWith("Mint Access Denied");
      } catch (err) {
        expect(err.message).to.contain("Must be owner");
      }
    });

    it("should succeed if owner of NFT", async function () {
      await apple
        .connect(nondeployer)
        .burnApprove(nondeployerSummoner, deployer.address, 1000);
      expect(
        await apple.burnAllowance(deployer.address, nondeployerSummoner)
      ).to.equal(1000);
    });
  });

  describe("burnFrom", () => {
    it("should error if paused", async function () {
      try {
        await apple.connect(deployer).pause();
        await apple.connect(deployer).burnFrom(nondeployerSummoner, 1001);
      } catch (err) {
        expect(err.message).to.contain("Contract is paused");
      }
    });
    it("should error if amount is greater than approval", async function () {
      try {
        await apple.connect(deployer).addMinter(nondeployer.address);
        await apple.connect(nondeployer).mint(nondeployerSummoner, 1000);
        await apple
          .connect(nondeployer)
          .burnApprove(nondeployerSummoner, deployer.address, 1000);
        await apple.connect(deployer).burnFrom(nondeployerSummoner, 1001);
      } catch (err) {
        expect(err.message).to.contain("Burn > Approve");
      }
    });

    it("should succeed if approved and balance exists", async function () {
      await apple.connect(deployer).addMinter(nondeployer.address);
      await apple.connect(nondeployer).mint(nondeployerSummoner, 10000);
      await apple
        .connect(nondeployer)
        .burnApprove(nondeployerSummoner, deployer.address, 1000);
      expect(
        await apple.burnAllowance(deployer.address, nondeployerSummoner)
      ).to.equal(1000);
      const supply = await apple.totalSupply();
      const summonerSupply = await apple.balanceOf(nondeployerSummoner);
      await apple.connect(deployer).burnFrom(nondeployerSummoner, 1000);
      expect(
        await apple.burnAllowance(deployer.address, nondeployerSummoner)
      ).to.equal(0);
      expect(await apple.totalSupply()).to.equal(supply.sub(1000));
      expect(await apple.balanceOf(nondeployerSummoner)).to.equal(
        summonerSupply.sub(1000)
      );
    });
  });

  describe("transfer", () => {
    it("should error if paused", async function () {
      try {
        await apple.connect(deployer).addMinter(deployer.address);
        await apple.connect(deployer).mint(deployerSummoner, 1000);
        await apple.connect(deployer).pause();
        await apple
          .connect(deployer)
          .transfer(deployerSummoner, nondeployerSummoner, 500);
        expect(await apple.balanceOf(nondeployerSummoner)).to.equal(500);
      } catch (err) {
        expect(err.message).to.contain("Contract is paused");
      }
    });
    it("should error if you don't own the NFT", async function () {
      try {
        await apple.connect(deployer).addMinter(deployer.address);
        await apple.connect(deployer).mint(deployerSummoner, 1000);
        await apple
          .connect(nondeployer)
          .transfer(deployerSummoner, nondeployerSummoner, 500);
      } catch (err) {
        expect(err.message).to.contain("Must be owner");
      }
    });

    it("should succeed if you own the NFT", async function () {
      await apple.connect(deployer).addMinter(deployer.address);
      await apple.connect(deployer).mint(deployerSummoner, 1000);
      expect(await apple.balanceOf(nondeployerSummoner)).to.equal(0);
      await apple
        .connect(deployer)
        .transfer(deployerSummoner, nondeployerSummoner, 500);
      expect(await apple.balanceOf(nondeployerSummoner)).to.equal(500);
    });
  });

  describe("approve", () => {
    it("should error if you don't own the NFT", async function () {
      try {
        await apple.connect(deployer).addMinter(deployer.address);
        await apple.connect(deployer).mint(deployerSummoner, 1000);
        await apple
          .connect(nondeployer)
          .approve(deployerSummoner, nondeployerSummoner, 500);
      } catch (err) {
        expect(err.message).to.contain("Must be owner");
      }
    });

    it("should succeed if you own the NFT", async function () {
      await apple.connect(deployer).addMinter(deployer.address);
      await apple.connect(deployer).mint(deployerSummoner, 1000);
      expect(
        await apple.allowance(deployerSummoner, nondeployerSummoner)
      ).to.equal(0);
      await apple
        .connect(deployer)
        .approve(deployerSummoner, nondeployerSummoner, 500);
      expect(
        await apple.allowance(deployerSummoner, nondeployerSummoner)
      ).to.equal(500);
    });
  });

  describe("transferFrom", () => {
    it("should error if paused", async function () {
      try {
        await apple.connect(deployer).addMinter(deployer.address);
        await apple.connect(deployer).mint(deployerSummoner, 1000);
        await apple
          .connect(deployer)
          .approve(deployerSummoner, nondeployerSummoner, 500);
        await apple.connect(deployer).pause();
        await apple
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
        await apple.connect(deployer).addMinter(deployer.address);
        await apple.connect(deployer).mint(deployerSummoner, 1000);
        await apple
          .connect(deployer)
          .approve(deployerSummoner, nondeployerSummoner, 500);
        await apple
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
        await apple.connect(deployer).addMinter(deployer.address);
        await apple.connect(deployer).mint(deployerSummoner, 1000);
        // await apple.connect(deployer).approve(deployerSummoner, nondeployerSummoner, 500);
        await apple
          .connect(nondeployer)
          .transferFrom(
            nondeployerSummoner,
            deployerSummoner,
            nondeployerSummoner,
            500
          );
      } catch (err) {
        expect(err.message).to.contain("Transfer > Approve");
      }
    });

    it("should error if amount exceeds approval", async function () {
      try {
        await apple.connect(deployer).addMinter(deployer.address);
        await apple.connect(deployer).mint(deployerSummoner, 1000);
        await apple
          .connect(deployer)
          .approve(deployerSummoner, nondeployerSummoner, 500);
        await apple
          .connect(nondeployer)
          .transferFrom(
            nondeployerSummoner,
            deployerSummoner,
            nondeployerSummoner,
            501
          );
      } catch (err) {
        expect(err.message).to.contain("Transfer > Approve");
      }
    });

    it("should succeed if you are approved", async function () {
      await apple.connect(deployer).addMinter(deployer.address);
      await apple.connect(deployer).mint(deployerSummoner, 1000);
      await apple
        .connect(deployer)
        .approve(deployerSummoner, nondeployerSummoner, 500);
      expect(await apple.balanceOf(nondeployerSummoner)).to.equal(0);
      expect(
        await apple.allowance(deployerSummoner, nondeployerSummoner)
      ).to.equal(500);
      await apple
        .connect(nondeployer)
        .transferFrom(
          nondeployerSummoner,
          deployerSummoner,
          nondeployerSummoner,
          500
        );

      expect(await apple.balanceOf(nondeployerSummoner)).to.equal(500);
      expect(
        await apple.allowance(deployerSummoner, nondeployerSummoner)
      ).to.equal(0);
    });
  });

  describe("setOwner", () => {
    it("should error if not owner", async function () {
      try {
        await apple.connect(nondeployer).setOwner(randomAddress);
      } catch (err) {
        expect(err.message).to.contain("Must be owner");
      }
    });

    it("should change owner address", async function () {
      expect(await apple.owner()).to.equal(deployer.address);
      await apple.connect(deployer).setOwner(randomAddress);
      expect(await apple.owner()).to.equal(randomAddress);
    });
  });

  describe("Lock", () => {
    it("should error if not owner", async function () {
      try {
        await apple.connect(nondeployer).lock();
      } catch (err) {
        expect(err.message).to.contain("Must be owner");
      }
    });

    it("should lock the resource if owner", async () => {
      expect(await apple.locked()).to.equal(false);
      await apple.connect(deployer).lock();
      expect(await apple.locked()).to.equal(true);
    });
  });

  describe("setAbilityIncreasers", () => {
    it("should error if locked", async function () {
      try {
        await apple.connect(deployer).lock();
        await apple.connect(deployer).setAbilityIncreasers(1, 2, 3, 4, 5, 6);
      } catch (err) {
        expect(err.message).to.contain("Resource Locked");
      }
    });
    it("should error if not owner", async function () {
      try {
        await apple.connect(nondeployer).setAbilityIncreasers(1, 2, 3, 4, 5, 6);
      } catch (err) {
        expect(err.message).to.contain("Must be owner");
      }
    });

    it("should set ability increasers", async () => {
      expect(await apple.getAbilityIncreasers()).to.eql([0, 0, 0, 0, 0, 0]);
      await apple.connect(deployer).setAbilityIncreasers(1, 2, 3, 4, 5, 6);
      expect(await apple.getAbilityIncreasers()).to.eql([1, 2, 3, 4, 5, 6]);
    });
  });

  describe("setAbilityDecreasers", () => {
    it("should error if locked", async function () {
      try {
        await apple.connect(deployer).lock();
        await apple.connect(deployer).setAbilityDecreasers(1, 2, 3, 4, 5, 6);
      } catch (err) {
        expect(err.message).to.contain("Resource Locked");
      }
    });
    it("should error if not owner", async function () {
      try {
        await apple.connect(nondeployer).setAbilityDecreasers(1, 2, 3, 4, 5, 6);
      } catch (err) {
        expect(err.message).to.contain("Must be owner");
      }
    });

    it("should set ability decreasers", async () => {
      expect(await apple.getAbilityDecreasers()).to.eql([0, 0, 0, 0, 0, 0]);
      await apple.connect(deployer).setAbilityDecreasers(1, 2, 3, 4, 5, 6);
      expect(await apple.getAbilityDecreasers()).to.eql([1, 2, 3, 4, 5, 6]);
    });
  });

  describe("setPointIncreasers", () => {
    it("should error if locked", async function () {
      try {
        await apple.connect(deployer).lock();
        await apple.connect(deployer).setPointIncreasers(1, 2, 3);
      } catch (err) {
        expect(err.message).to.contain("Resource Locked");
      }
    });
    it("should error if not owner", async function () {
      try {
        await apple.connect(nondeployer).setPointIncreasers(1, 2, 3);
      } catch (err) {
        expect(err.message).to.contain("Must be owner");
      }
    });

    it("should set point increasers", async () => {
      expect(await apple.getPointIncreasers()).to.eql([0, 1, 0]);
      await apple.connect(deployer).setPointIncreasers(1, 2, 3);
      expect(await apple.getPointIncreasers()).to.eql([1, 2, 3]);
    });
  });

  describe("setPointDecreasers", () => {
    it("should error if locked", async function () {
      try {
        await apple.connect(deployer).lock();
        await apple.connect(deployer).setPointDecreasers(1, 2, 3);
      } catch (err) {
        expect(err.message).to.contain("Resource Locked");
      }
    });
    it("should error if not owner", async function () {
      try {
        await apple.connect(nondeployer).setPointDecreasers(1, 2, 3);
      } catch (err) {
        expect(err.message).to.contain("Must be owner");
      }
    });

    it("should set point decreasers", async () => {
      expect(await apple.getPointDecreasers()).to.eql([0, 0, 0]);
      await apple.connect(deployer).setPointDecreasers(1, 2, 3);
      expect(await apple.getPointDecreasers()).to.eql([1, 2, 3]);
    });
  });

  describe("setWeigth", () => {
    it("should error if locked", async function () {
      try {
        await apple.connect(deployer).lock();
        await apple.connect(deployer).setWeight(1);
      } catch (err) {
        expect(err.message).to.contain("Resource Locked");
      }
    });
    it("should error if not owner", async function () {
      try {
        await apple.connect(nondeployer).setWeight(1);
      } catch (err) {
        expect(err.message).to.contain("Must be owner");
      }
    });

    it("should set weight", async () => {
      expect(await apple.getWeight()).to.equal(8);

      await apple.connect(deployer).setWeight(10);
      expect(await apple.getWeight()).to.equal(10);
    });
  });
});
