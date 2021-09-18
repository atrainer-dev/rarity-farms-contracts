const hre = require("hardhat");
const chai = require("chai");
const { solidity } = require("ethereum-waffle");
chai.use(solidity);
const { expect } = chai;
const { BigNumber } = require("@ethersproject/bignumber");

const randomAddress = "0x52dF56A3fa758c4542Fc92ad8485ED7183f2ab4d";

describe.only("BeginnerFarm", function () {
  let rarity,
    farm,
    corn,
    wheat,
    tomato,
    potato,
    owner,
    address1,
    ownerSummoner,
    address1Summoner;

  before(async function () {
    const Rarity = await ethers.getContractFactory("rarity");
    rarity = await Rarity.deploy();
    await rarity.deployed();
  });

  beforeEach(async function () {
    const Corn = await ethers.getContractFactory("Corn");
    const Wheat = await ethers.getContractFactory("Wheat");
    const Potato = await ethers.getContractFactory("Potato");
    const Tomato = await ethers.getContractFactory("Tomato");
    const Farm = await ethers.getContractFactory("BeginnerFarm");

    [owner, address1] = await ethers.getSigners();
    corn = await Corn.deploy(rarity.address);
    wheat = await Wheat.deploy(rarity.address);
    tomato = await Tomato.deploy(rarity.address);
    potato = await Potato.deploy(rarity.address);
    farm = await Farm.deploy(
      rarity.address,
      corn.address,
      wheat.address,
      potato.address,
      tomato.address
    );
    await farm.deployed();
    await corn.connect(owner).addMinter(farm.address);
    await wheat.connect(owner).addMinter(farm.address);
    await potato.connect(owner).addMinter(farm.address);
    await tomato.connect(owner).addMinter(farm.address);
    await rarity.summon(2);
    await rarity.connect(address1).summon(3);
    ownerSummoner = 0;
    address1Summoner = 1;
  });

  describe("farmCorn", () => {
    it("should error if paused", async function () {
      try {
        await farm.connect(owner).addPauser(address1.address);
        await farm.connect(address1).pause();
        await farm.connect(address1).farmCorn(address1Summoner);
      } catch (err) {
        expect(err.message).to.contain("Farm not available");
      }
    });

    it("should farm a corn resource", async function () {
      await farm.connect(address1).farmCorn(address1Summoner);
      expect(await corn.balanceOf(address1Summoner)).to.equal(
        BigNumber.from("1000000000000000000")
      );
    });

    it("should only allow a farm once a day", async function () {
      try {
        await farm.connect(address1).farmCorn(address1Summoner);
        await farm.connect(address1).farmCorn(address1Summoner);
      } catch (err) {
        expect(await corn.balanceOf(address1Summoner)).to.equal(
          BigNumber.from("1000000000000000000")
        );
        expect(err.message).to.contain("Summoner not available to farm");
      }
    });
  });

  describe("addPauser", () => {
    it("should error if not owner", async function () {
      try {
        await farm.connect(address1).addPauser(address1.address);
      } catch (err) {
        expect(err.message).to.contain("Must be owner");
      }
    });

    it("should add a pauser", async function () {
      await farm.connect(owner).addPauser(address1.address);
      expect(await farm.pausers(address1.address)).to.equal(true);
    });
  });

  describe("removePauser", () => {
    it("should error if not owner", async function () {
      try {
        await farm.connect(address1).removePauser(address1.address);
      } catch (err) {
        expect(err.message).to.contain("Must be owner");
      }
    });

    it("should remove a pauser", async function () {
      await farm.connect(owner).addPauser(address1.address);
      expect(await farm.pausers(address1.address)).to.equal(true);
      await farm.connect(owner).removePauser(address1.address);
      expect(await farm.pausers(address1.address)).to.equal(false);
    });
  });

  describe("pause", () => {
    it("should error if not pauser", async function () {
      try {
        await farm.connect(owner).pause();
        expect(await farm.paused()).to.equal(true);
      } catch (err) {
        expect(err.message).to.contain("Pause denied");
      }
    });

    it("should set pause", async function () {
      await farm.connect(owner).addPauser(address1.address);
      await farm.connect(address1).pause();
      expect(await farm.paused()).to.equal(true);
    });
  });

  describe("pause", () => {
    it("should error if not pauser", async function () {
      try {
        await farm.connect(owner).pause();
      } catch (err) {
        expect(err.message).to.contain("Pause denied");
        expect(await farm.paused()).to.equal(false);
      }
    });

    it("should set pause", async function () {
      await farm.connect(owner).addPauser(address1.address);
      await farm.connect(address1).pause();
      expect(await farm.paused()).to.equal(true);
    });
  });

  describe("unpause", () => {
    it("should error if not pauser", async function () {
      try {
        await farm.connect(owner).unpause();
      } catch (err) {
        expect(err.message).to.contain("Unpause denied");
        expect(await farm.paused()).to.equal(false);
      }
    });

    it("should unpause", async function () {
      await farm.connect(owner).addPauser(address1.address);
      await farm.connect(address1).unpause();
      expect(await farm.paused()).to.equal(false);
    });
  });
});
