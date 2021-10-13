const hre = require("hardhat");
const chai = require("chai");

const { expect } = chai;
const { BigNumber } = require("@ethersproject/bignumber");

const rarityUtils = require("./utils/rarity.js");
const farmUtils = require("./utils/farm.js");

const randomAddress = "0x52dF56A3fa758c4542Fc92ad8485ED7183f2ab4d";
const nullAddress = "0x0000000000000000000000000000000000000000";

describe.skip("BeginnerFarm", function () {
  let farm,
    corn,
    wheat,
    beans,
    barley,
    owner,
    address1,
    ownerSummoner,
    address1Summoner;

  before(async function () {
    [owner, address1] = await ethers.getSigners();
    [ownerSummoner, address1Summoner] = await rarityUtils.summoners();

    const Corn = await ethers.getContractFactory("Corn");
    const Wheat = await ethers.getContractFactory("Wheat");
    const Beans = await ethers.getContractFactory("Beans");
    const Barley = await ethers.getContractFactory("Barley");

    corn = await Corn.deploy();
    wheat = await Wheat.deploy();
    beans = await Beans.deploy();
    barley = await Barley.deploy();
  });

  beforeEach(async function () {
    farm = await farmUtils.deployBeginnerFarm(corn, wheat, beans, barley);
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
      await rarityUtils.contracts.rarity
        .connect(address1)
        .approve(farm.address, address1Summoner);
      const result = await farm.connect(address1).farmCorn(address1Summoner);
      expect(await corn.balanceOf(address1Summoner)).to.equal(
        BigNumber.from("1000000000000000000")
      );

      const receipt = await result.wait();
      const log = receipt.events?.filter((x) => {
        return x.event == "FarmResource";
      })[0];
      // console.log(log.args.map((s) => s.toString()));
      expect(log.args[0]).to.equal(address1Summoner);
      expect(log.args[1]).to.equal(corn.address);
      expect(log.args[2]).to.equal(BigNumber.from("1000000000000000000"));
      expect(log.args[3]).to.equal(await farm.yield());
      expect(log.args[3]).to.equal(log.args[4].mul(log.args[5]));
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
        await farm.connect(address1).setDisaster(randomAddress, 100);
      } catch (err) {
        expect(err.message).to.contain("Must be owner");
        expect(await farm.disaster()).to.equal(nullAddress);
      }
    });

    it("should set disaster", async function () {
      await farm.connect(owner).setDisaster(randomAddress, 127);
      expect(await farm.disaster()).to.equal(randomAddress);
      expect(await farm.pausers(randomAddress)).to.equal(true);
      expect(await farm.paused()).to.equal(true);
      expect(await farm.yield()).to.equal(127);
    });
  });

  describe("clearDisaster", () => {
    it("should error if not owner or disaster", async function () {
      try {
        await farm.connect(owner).setDisaster(randomAddress, 127);
        await farm.connect(address1).clearDisaster();
      } catch (err) {
        expect(err.message).to.contain("Must be owner or disaster");
        expect(await farm.disaster()).to.equal(randomAddress);
      }
    });

    it("should clear disaster if owner", async function () {
      await farm.connect(owner).setDisaster(randomAddress, 127);
      await farm.connect(owner).clearDisaster();
      expect(await farm.disaster()).to.equal(nullAddress);
    });

    it("should clear disaster if disaster", async function () {
      await farm.connect(owner).setDisaster(address1.address, 127);
      await farm.connect(address1).clearDisaster();
      expect(await farm.disaster()).to.equal(nullAddress);
      expect(await farm.pausers(randomAddress)).to.equal(false);
      expect(await farm.paused()).to.equal(false);
    });
  });
});
