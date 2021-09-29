const hre = require("hardhat");
const chai = require("chai");
const { expect } = chai;

const randomAddress = "0x52dF56A3fa758c4542Fc92ad8485ED7183f2ab4d";
const nullAddress = "0x0000000000000000000000000000000000000000";

const rarityUtils = require("./utils/rarity.js");
const farmUtils = require("./utils/farm.js");

describe("Locust", function () {
  let owner,
    address1,
    ownerSummoner,
    address1Summoner,
    corn,
    wheat,
    beans,
    barley,
    farm,
    locust;

  const disasterRequirements = [14, 12, 10, 8, 8, 8];
  const disasterHp = 10000;
  const classMultipliers = [2, 1, 1, 1, 3, 1, 2, 1, 1, 1, 1];
  const attackAttr = 1; // Strength

  before(async function () {
    this.timeout(50000);
    [owner, address1] = await ethers.getSigners();
    [ownerSummoner, address1Summoner] = await rarityUtils.summoners();
    [corn, wheat, beans, barley] = await farmUtils.deployBeginnerCrops();
  });

  beforeEach(async function () {
    farm = await farmUtils.deployBeginnerFarm(corn, wheat, beans, barley);
    const Locust = await ethers.getContractFactory("Locust");
    locust = await Locust.deploy(
      farm.address,
      2500,
      disasterHp,
      disasterRequirements
    );
  });

  describe("initialize", () => {
    it("should initialize disaster", async function () {
      expect(await locust.hp()).to.equal(disasterHp);
      expect(await locust.getScoreRequirements()).to.eql(disasterRequirements);
      expect(await locust.getClassMultipliers()).to.eql(classMultipliers);
      expect(await locust.damage()).to.equal(0);
      expect(await locust.attackAttr()).to.equal(1);
      expect(await locust.farmDamage()).to.equal(2500);
      expect();
    });
  });

  describe("scout", () => {
    it("should return false if you can't attack", async function () {
      const requirements = await locust.getScoreRequirements();
      const summoner = await rarityUtils.summon(
        owner,
        2,
        [10, 11, 12, 13, 15, 16]
      );
      expect(await locust.connect(owner).scout(summoner)).to.equal(false);
    });

    it("should return true if you can attack", async function () {
      const requirements = await locust.getScoreRequirements();
      const summoner = await rarityUtils.summon(
        owner,
        2,
        [10, 11, 12, 13, 15, 16].reverse()
      );
      expect(await locust.connect(owner).scout(summoner)).to.equal(true);
    });
  });

  describe("attack", () => {
    it("should error if paused", async function () {
      try {
        await locust.connect(owner).pause();
        await locust.connect(owner).attack(ownerSummoner);
      } catch (err) {
        expect(err.message).to.contain("Disaster has ended");
      }
    });

    it("should error if not NFT owner", async function () {
      try {
        await locust.connect(owner).attack(address1Summoner);
      } catch (err) {
        expect(err.message).to.contain("Must be owner");
      }
    });

    it("should error if scout fails", async function () {
      try {
        const summoner = await rarityUtils.summon(
          owner,
          2,
          [10, 11, 12, 13, 15, 16]
        );
        await locust.connect(owner).attack(summoner);
      } catch (err) {
        expect(err.message).to.contain("Your summoner is not powerful enough");
      }
    });

    it("should perform attack on disaster", async function () {
      const summoner = await rarityUtils.summon(
        owner,
        2,
        [10, 11, 12, 13, 15, 16].reverse()
      );
      await rarityUtils.contracts.rarity
        .connect(owner)
        .approve(locust.address, summoner);
      const result = await locust.connect(owner).attack(summoner);
      const receipt = await result.wait();
      const log = receipt.events?.filter((x) => {
        return x.event == "Attack";
      })[0];
      expect(log.args[0]).to.equal(summoner);
      expect(log.args[3]).to.equal(1);
      expect(log.args[4]).to.equal(16);
      expect(log.args[1]).to.equal(
        log.args[4].mul(log.args[3].mul(log.args[2]))
      );
      expect(await locust.damage()).to.equal(log.args[1]);
    });

    it("should close the disaster and open the farm", async function () {
      const newfarm = await farmUtils.deployBeginnerFarm(
        corn,
        wheat,
        beans,
        barley
      );
      const Locust = await ethers.getContractFactory("Locust");
      const newlocust = await Locust.deploy(
        newfarm.address,
        2500,
        2,
        disasterRequirements
      );
      newfarm.connect(owner).setDisaster(newlocust.address, 137);
      const summoner = await rarityUtils.summon(
        owner,
        2,
        [10, 11, 12, 13, 15, 16].reverse()
      );
      await rarityUtils.contracts.rarity
        .connect(owner)
        .approve(newlocust.address, summoner);
      const result = await newlocust.connect(owner).attack(summoner);
      const receipt = await result.wait();
      const log = receipt.events?.filter((x) => {
        return x.event == "Cleared";
      })[0];
      expect(log.args[0]).to.equal(summoner);
      expect(log.args[1]).to.equal(true);
      expect(await newlocust.paused()).to.equal(true);
      expect(await newfarm.disaster()).to.equal(nullAddress);
      expect(await newfarm.paused()).to.equal(false);
    });
  });
});
