const hre = require("hardhat");
const chai = require("chai");
const { solidity } = require("ethereum-waffle");
chai.use(solidity);
const { expect } = chai;
const { BigNumber } = require("@ethersproject/bignumber");

const rarityUtils = require("./utils/rarity");

const randomAddress = "0x52dF56A3fa758c4542Fc92ad8485ED7183f2ab4d";

describe("Corn", function () {
  let corn, owner, address1, ownerSummoner, address1Summoner;

  before(async function () {
    [ownerSummoner, address1Summoner] = await rarityUtils.summoners();
    [owner, address1] = await ethers.getSigners();
  });

  beforeEach(async function () {
    const Corn = await ethers.getContractFactory("Corn");
    corn = await Corn.deploy();
  });

  it("Should initialize the contract", async function () {
    expect(await corn.name()).to.equal("RarityFarms-Corn");
    expect(await corn.symbol()).to.equal("CORN");
    expect(await corn.totalSupply()).to.equal(BigNumber.from("0"));
  });

  describe("Add Minter", () => {
    it("should error if not owner", async function () {
      try {
        expect(
          await corn.connect(address1).addMinter(randomAddress)
        ).to.be.revertedWith("Must be owner");
      } catch (err) {
        // Should be able to remove this in the future if they fix the reverted with chai matcher
        expect(err.message).to.contain("Must be owner");
      }
    });

    it("add a minter if owner", async function () {
      try {
        expect(await corn.minters(address1.address)).to.be.equal(false);
        const result = await corn.connect(owner).addMinter(address1.address);
        expect(await corn.minters(address1.address)).to.be.equal(true);
      } catch (err) {}
    });
  });

  describe("Remove Minter", () => {
    it("should error if not owner", async function () {
      try {
        expect(
          await corn.connect(address1).removeMinter(randomAddress)
        ).to.be.revertedWith("Must be owner");
      } catch (err) {
        // Should be able to remove this in the future if they fix the reverted with chai matcher
        expect(err.message).to.contain("Must be owner");
      }
    });

    it("remove minter if owner", async function () {
      try {
        await corn.connect(owner).addMinter(address1.address);
        expect(await corn.minters(address1.address)).to.be.equal(true);
        const result = await corn.connect(owner).removeMinter(address1.address);
        expect(await corn.minters(address1.address)).to.be.equal(false);
      } catch (err) {}
    });
  });

  describe("Mint", () => {
    it("should error if paused", async function () {
      try {
        await corn.connect(owner).pause();
        await corn.connect(address1).mint(11, 11);
      } catch (err) {
        expect(err.message).to.contain("Contract is paused");
      }
    });
    it("should error if owner", async function () {
      try {
        expect(await corn.minters(owner.address)).to.be.equal(false);
        expect(await corn.connect(owner).mint(11, 11)).to.be.revertedWith(
          "Mint Access Denied"
        );
      } catch (err) {
        // Should be able to remove this in the future if they fix the reverted with chai matcher
        expect(err.message).to.contain("Mint Access Denied");
      }
    });

    it("should error if address1", async function () {
      try {
        expect(await corn.minters(address1.address)).to.be.equal(false);
        expect(await corn.connect(address1).mint(11, 11)).to.be.revertedWith(
          "Mint Access Denied"
        );
      } catch (err) {
        // Should be able to remove this in the future if they fix the reverted with chai matcher
        expect(err.message).to.contain("Mint Access Denied");
      }
    });

    it("should mint if address is minter", async function () {
      await corn.connect(owner).addMinter(address1.address);
      expect(await corn.minters(address1.address)).to.be.equal(true);
      await corn.connect(address1).mint(11, 13);
      expect(await corn.connect(address1).balanceOf(11)).to.equal(13);
    });
  });

  describe("Burn", () => {
    it("should error if paused", async function () {
      try {
        await corn.connect(owner).pause();
        await corn.connect(owner).burn(address1Summoner, 1);
      } catch (err) {
        expect(err.message).to.contain("Contract is paused");
      }
    });
    it("should error if not owner of NFT", async function () {
      try {
        await corn.connect(owner).addMinter(address1.address);
        await corn.connect(address1).mint(address1Summoner, 11);
        await corn.connect(owner).burn(address1Summoner, 1);
        // expect().to.be.revertedWith("Mint Access Denied");
      } catch (err) {
        // Should be able to remove this in the future if they fix the reverted with chai matcher
        expect(err.message).to.contain("Must be owner");
      }
    });

    it("should error if balance too low", async function () {
      try {
        await corn.connect(owner).addMinter(address1.address);
        await corn.connect(address1).mint(address1Summoner, 11);
        await corn.connect(address1).burn(address1Summoner, 12);
      } catch (err) {
        expect(err.message).to.contain("Balance too low");
      }
    });

    it("should succeed if owner of NFT", async function () {
      await corn.connect(owner).addMinter(address1.address);
      await corn.connect(address1).mint(address1Summoner, 11);
      const totalSupply = await corn.totalSupply();
      await corn.connect(address1).burn(address1Summoner, 1);
      expect(await corn.balanceOf(address1Summoner)).to.be.equal(10);
      expect(await corn.totalSupply()).to.be.equal(totalSupply.sub(1));
    });
  });

  describe("burnApprove", () => {
    it("should error if not NFT owner", async function () {
      try {
        expect(
          await corn
            .connect(address1)
            .burnApprove(ownerSummoner, address1.address, 1000)
        ).to.be.revertedWith("Mint Access Denied");
      } catch (err) {
        expect(err.message).to.contain("Must be owner");
      }
    });

    it("should succeed if owner of NFT", async function () {
      await corn
        .connect(address1)
        .burnApprove(address1Summoner, owner.address, 1000);
      expect(
        await corn.burnAllowance(owner.address, address1Summoner)
      ).to.be.equal(1000);
    });
  });

  describe("burnFrom", () => {
    it("should error if paused", async function () {
      try {
        await corn.connect(owner).pause();
        await corn.connect(owner).burnFrom(address1Summoner, 1001);
      } catch (err) {
        expect(err.message).to.contain("Contract is paused");
      }
    });
    it("should error if amount is greater than approval", async function () {
      try {
        await corn.connect(owner).addMinter(address1.address);
        await corn.connect(address1).mint(address1Summoner, 1000);
        await corn
          .connect(address1)
          .burnApprove(address1Summoner, owner.address, 1000);
        await corn.connect(owner).burnFrom(address1Summoner, 1001);
      } catch (err) {
        expect(err.message).to.contain("Requested Burn greater than approval");
      }
    });

    it("should succeed if approved and balance exists", async function () {
      await corn.connect(owner).addMinter(address1.address);
      await corn.connect(address1).mint(address1Summoner, 10000);
      await corn
        .connect(address1)
        .burnApprove(address1Summoner, owner.address, 1000);
      expect(
        await corn.burnAllowance(owner.address, address1Summoner)
      ).to.equal(1000);
      const supply = await corn.totalSupply();
      const summonerSupply = await corn.balanceOf(address1Summoner);
      await corn.connect(owner).burnFrom(address1Summoner, 1000);
      expect(
        await corn.burnAllowance(owner.address, address1Summoner)
      ).to.equal(0);
      expect(await corn.totalSupply()).to.equal(supply.sub(1000));
      expect(await corn.balanceOf(address1Summoner)).to.equal(
        summonerSupply.sub(1000)
      );
    });
  });

  describe("transfer", () => {
    it("should error if paused", async function () {
      try {
        await corn.connect(owner).addMinter(owner.address);
        await corn.connect(owner).mint(ownerSummoner, 1000);
        await corn.connect(owner).pause();
        await corn
          .connect(owner)
          .transfer(ownerSummoner, address1Summoner, 500);
        expect(await corn.balanceOf(address1Summoner)).to.equal(500);
      } catch (err) {
        expect(err.message).to.contain("Contract is paused");
      }
    });
    it("should error if you don't own the NFT", async function () {
      try {
        await corn.connect(owner).addMinter(owner.address);
        await corn.connect(owner).mint(ownerSummoner, 1000);
        await corn
          .connect(address1)
          .transfer(ownerSummoner, address1Summoner, 500);
      } catch (err) {
        expect(err.message).to.contain("Must be owner");
      }
    });

    it("should succeed if you own the NFT", async function () {
      await corn.connect(owner).addMinter(owner.address);
      await corn.connect(owner).mint(ownerSummoner, 1000);
      expect(await corn.balanceOf(address1Summoner)).to.equal(0);
      await corn.connect(owner).transfer(ownerSummoner, address1Summoner, 500);
      expect(await corn.balanceOf(address1Summoner)).to.equal(500);
    });
  });

  describe("approve", () => {
    it("should error if you don't own the NFT", async function () {
      try {
        await corn.connect(owner).addMinter(owner.address);
        await corn.connect(owner).mint(ownerSummoner, 1000);
        await corn
          .connect(address1)
          .approve(ownerSummoner, address1Summoner, 500);
      } catch (err) {
        expect(err.message).to.contain("Must be owner");
      }
    });

    it("should succeed if you own the NFT", async function () {
      await corn.connect(owner).addMinter(owner.address);
      await corn.connect(owner).mint(ownerSummoner, 1000);
      expect(await corn.allowance(ownerSummoner, address1Summoner)).to.equal(0);
      await corn.connect(owner).approve(ownerSummoner, address1Summoner, 500);
      expect(await corn.allowance(ownerSummoner, address1Summoner)).to.equal(
        500
      );
    });
  });

  describe("transferFrom", () => {
    it("should error if paused", async function () {
      try {
        await corn.connect(owner).addMinter(owner.address);
        await corn.connect(owner).mint(ownerSummoner, 1000);
        await corn.connect(owner).approve(ownerSummoner, address1Summoner, 500);
        await corn.connect(owner).pause();
        await corn
          .connect(address1)
          .transferFrom(ownerSummoner, ownerSummoner, address1Summoner, 500);
      } catch (err) {
        expect(err.message).to.contain("Contract is paused");
      }
    });

    it("should error if you don't own the NFT", async function () {
      try {
        await corn.connect(owner).addMinter(owner.address);
        await corn.connect(owner).mint(ownerSummoner, 1000);
        await corn.connect(owner).approve(ownerSummoner, address1Summoner, 500);
        await corn
          .connect(address1)
          .transferFrom(ownerSummoner, ownerSummoner, address1Summoner, 500);
      } catch (err) {
        expect(err.message).to.contain("Must be owner");
      }
    });

    it("should error if you are not approved", async function () {
      try {
        await corn.connect(owner).addMinter(owner.address);
        await corn.connect(owner).mint(ownerSummoner, 1000);
        // await corn.connect(owner).approve(ownerSummoner, address1Summoner, 500);
        await corn
          .connect(address1)
          .transferFrom(address1Summoner, ownerSummoner, address1Summoner, 500);
      } catch (err) {
        expect(err.message).to.contain("Transfer amount greater than approval");
      }
    });

    it("should error if amount exceeds approval", async function () {
      try {
        await corn.connect(owner).addMinter(owner.address);
        await corn.connect(owner).mint(ownerSummoner, 1000);
        await corn.connect(owner).approve(ownerSummoner, address1Summoner, 500);
        await corn
          .connect(address1)
          .transferFrom(address1Summoner, ownerSummoner, address1Summoner, 501);
      } catch (err) {
        expect(err.message).to.contain("Transfer amount greater than approval");
      }
    });

    it("should succeed if you are approved", async function () {
      await corn.connect(owner).addMinter(owner.address);
      await corn.connect(owner).mint(ownerSummoner, 1000);
      await corn.connect(owner).approve(ownerSummoner, address1Summoner, 500);
      expect(await corn.balanceOf(address1Summoner)).to.equal(0);
      expect(await corn.allowance(ownerSummoner, address1Summoner)).to.equal(
        500
      );
      await corn
        .connect(address1)
        .transferFrom(address1Summoner, ownerSummoner, address1Summoner, 500);

      expect(await corn.balanceOf(address1Summoner)).to.equal(500);
      expect(await corn.allowance(ownerSummoner, address1Summoner)).to.equal(0);
    });
  });

  describe("setOwner", () => {
    it("should error if not owner", async function () {
      try {
        await corn.connect(address1).setOwner(randomAddress);
      } catch (err) {
        expect(err.message).to.contain("Must be owner");
      }
    });

    it("should change owner address", async function () {
      expect(await corn.owner()).to.equal(owner.address);
      await corn.connect(owner).setOwner(randomAddress);
      expect(await corn.owner()).to.equal(randomAddress);
    });
  });
});
