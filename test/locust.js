const hre = require("hardhat");
const chai = require("chai");

const { expect } = chai;
const { BigNumber } = require("@ethersproject/bignumber");

const randomAddress = "0x52dF56A3fa758c4542Fc92ad8485ED7183f2ab4d";
const nullAddress = "0x0000000000000000000000000000000000000000";

const rarityUtils = require("./utils/rarity.js");
const farmUtils = require("./utils/farm.js");

describe.only("Locust", function () {
  let owner,
    address1,
    ownerSummoner,
    address1Summoner,
    corn,
    wheat,
    tomato,
    potato,
    farm,
    locust;
  before(async function () {
    [owner, address1] = await ethers.getSigners();
    [ownerSummoner, address1Summoner] = await rarityUtils.summoners();
    [corn, wheat, tomato, potato] = await farmUtils.deployBeginnerCrops();
  });

  beforeEach(async function () {
    farm = await farmUtils.deployBeginnerFarm(corn, wheat, tomato, potato);
    const Locust = await ethers.getContractFactory("Locust");
    locust = await Locust.deploy();
  });

  describe("initialize", () => {
    it("should initialize disaster", async function () {
      expect(await locust.hp()).to.equal(10000);
      const req = await locust.requirements();
      expect(req.filter((s) => typeof s === "number"))
        .to.be.an("array")
        .that.includes(14, 12, 10, 8, 8, 8);
      expect(await locust.damage()).to.equal(0);
    });
  });
});
