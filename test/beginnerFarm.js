const hre = require("hardhat");
const chai = require("chai");

const { expect } = chai;
const { BigNumber } = require("@ethersproject/bignumber");

const randomAddress = "0x52dF56A3fa758c4542Fc92ad8485ED7183f2ab4d";
const nullAddress = "0x0000000000000000000000000000000000000000";
const ownerSummonerAttributes = {
  strength: 16,
  dexterity: 15,
  constitution: 13,
  intelligence: 12,
  wisdom: 11,
  charisma: 10,
};

const address1SummonerAttributes = {
  strength: 10,
  dexterity: 11,
  constitution: 12,
  intelligence: 13,
  wisdom: 15,
  charisma: 16,
};

describe.only("BeginnerFarm", function () {
  let rarityAddresses,
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
    [owner, address1] = await ethers.getSigners();
    const Rarity = await ethers.getContractFactory("rarity");
    const RarityAttributes = await ethers.getContractFactory(
      "rarity_attributes"
    );
    const Corn = await ethers.getContractFactory("Corn");
    const Wheat = await ethers.getContractFactory("Wheat");
    const Potato = await ethers.getContractFactory("Potato");
    const Tomato = await ethers.getContractFactory("Tomato");

    rarity = await Rarity.deploy();
    await rarity.deployed();

    attributes = await RarityAttributes.deploy(rarity.address);
    await attributes.deployed();

    rarityAddresses = [
      rarity.address,
      attributes.address,
      randomAddress,
      randomAddress,
    ];

    await rarity.connect(owner).summon(2);
    await rarity.connect(address1).summon(3);

    ownerSummoner = 0;
    address1Summoner = 1;

    await attributes
      .connect(owner)
      .point_buy(ownerSummoner, ...Object.values(ownerSummonerAttributes));

    await attributes
      .connect(address1)
      .point_buy(
        address1Summoner,
        ...Object.values(address1SummonerAttributes)
      );

    corn = await Corn.deploy(rarityAddresses);
    wheat = await Wheat.deploy(rarityAddresses);
    tomato = await Tomato.deploy(rarityAddresses);
    potato = await Potato.deploy(rarityAddresses);
  });

  beforeEach(async function () {
    const Farm = await ethers.getContractFactory("BeginnerFarm");

    farm = await Farm.deploy(
      rarityAddresses,
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
  });

  describe("initialize", () => {
    it("should error if paused", async function () {});
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
      await rarity.connect(address1).approve(farm.address, address1Summoner);
      await farm.connect(address1).farmCorn(address1Summoner);
      expect(await corn.balanceOf(address1Summoner)).to.equal(
        BigNumber.from("1000000000000000000")
      );
      expect(
        await expect(await farm.yield()).to.equal(
          address1SummonerAttributes.strength +
            address1SummonerAttributes.dexterity
        )
      );
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

  describe("setYieldBase", () => {
    it("should error if not owner", async function () {
      const base = await farm.yieldBase();
      try {
        await farm.connect(address1).setYieldBase(40000);
      } catch (err) {
        expect(err.message).to.contain("Must be owner");
        expect(await farm.yieldBase()).to.equal(base);
      }
    });

    it("should set the base", async function () {
      await farm.connect(owner).setYieldBase(10000);
      expect(await farm.yieldBase()).to.equal(10000);
    });
  });

  describe("setYield", () => {
    it("should error if not owner", async function () {
      const yield = await farm.yield();
      try {
        await farm.connect(address1).setYield(4000);
      } catch (err) {
        expect(err.message).to.contain("Must be owner");
        expect(await farm.yield()).to.equal(yield);
      }
    });

    it("should set the base", async function () {
      await farm.connect(owner).setYield(10000);
      expect(await farm.yield()).to.equal(10000);
    });
  });

  describe("setDisaster", () => {
    it("should error if not owner", async function () {
      try {
        await farm.connect(address1).setDisaster(randomAddress);
      } catch (err) {
        expect(err.message).to.contain("Must be owner");
        expect(await farm.disaster()).to.equal(nullAddress);
      }
    });

    it("should set disaster", async function () {
      await farm.connect(owner).setDisaster(randomAddress);
      expect(await farm.disaster()).to.equal(randomAddress);
      expect(await farm.pausers(randomAddress)).to.equal(true);
      expect(await farm.paused()).to.equal(true);
    });
  });

  describe("clearDisaster", () => {
    it("should error if not owner or disaster", async function () {
      try {
        await farm.connect(owner).setDisaster(randomAddress);
        await farm.connect(address1).clearDisaster();
      } catch (err) {
        expect(err.message).to.contain("Must be owner or disaster");
        expect(await farm.disaster()).to.equal(randomAddress);
      }
    });

    it("should clear disaster if owner", async function () {
      await farm.connect(owner).setDisaster(randomAddress);
      await farm.connect(owner).clearDisaster();
      expect(await farm.disaster()).to.equal(nullAddress);
    });

    it("should clear disaster if disaster", async function () {
      await farm.connect(owner).setDisaster(address1.address);
      await farm.connect(address1).clearDisaster();
      expect(await farm.disaster()).to.equal(nullAddress);
      expect(await farm.pausers(randomAddress)).to.equal(false);
      expect(await farm.paused()).to.equal(false);
    });
  });
});
