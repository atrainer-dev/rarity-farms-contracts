const { ethers, getNamedAccounts } = require("hardhat");
const chai = require("chai");
const { solidity } = require("ethereum-waffle");
chai.use(solidity);
const { expect } = chai;

const rarityUtils = require("./utils/rarity.js");
const { BigNumber, constants } = require("ethers");

const setup = deployments.createFixture(async () => {
  const [deployer, nondeployer] = await ethers.getSigners();
  await deployments.fixture(["Mill"]);
  await deployments.get("Mill");
  mill = await ethers.getContract("Mill");
  const summoners = await rarityUtils.newSummoners(deployer, nondeployer);
  return [mill, summoners];
});

describe("Mill", function () {
  let mill,
    corn,
    wheat,
    beans,
    barley,
    meal,
    flour,
    oil,
    malt,
    deployer,
    nondeployer,
    deployerSummoner,
    nondeployerSummoner;

  before(async () => {
    await Promise.all([
      deployments.get("Corn"),
      deployments.get("Wheat"),
      deployments.get("Beans"),
      deployments.get("Barley"),
      deployments.get("Meal"),
      deployments.get("Flour"),
      deployments.get("Oil"),
      deployments.get("Malt"),
    ]);

    const users = await getNamedAccounts();
    deployer = await ethers.getSigner(users.deployer);
    nondeployer = await ethers.getSigner(users.nondeployer);

    [corn, wheat, beans, barley, meal, flour, oil, malt] = await Promise.all([
      ethers.getContract("Corn"),
      ethers.getContract("Wheat"),
      ethers.getContract("Beans"),
      ethers.getContract("Barley"),
      ethers.getContract("Meal"),
      ethers.getContract("Flour"),
      ethers.getContract("Oil"),
      ethers.getContract("Malt"),
    ]);
  });

  beforeEach(async () => {
    [mill, [deployerSummoner, nondeployerSummoner]] = await setup();
  });

  it("should deploy mill", async () => {
    expect(await mill.refiningCost()).to.equal(constants.WeiPerEther.mul(2));
  });

  describe("setRefiningCost", () => {
    it("should fail if not owner", async () => {
      try {
        await mill
          .connect(nondeployer)
          .setRefiningCost(constants.WeiPerEther.mul(20));
      } catch (err) {
        expect(err.message).to.contain("Must be owner");
      }
    });

    it("should set refining costs if owner", async () => {
      await mill
        .connect(deployer)
        .setRefiningCost(constants.WeiPerEther.mul(20));
      expect(await mill.refiningCost()).to.equal(constants.WeiPerEther.mul(20));
    });
  });

  describe("refineCorn", () => {
    it("should fail if not owner", async () => {
      try {
        await mill
          .connect(nondeployer)
          .refineCorn(deployerSummoner, constants.WeiPerEther.mul(2));
      } catch (err) {
        expect(err.message).to.contain("Must own NFT");
      }
    });

    it("should fail if paused", async () => {
      try {
        await mill.connect(deployer).pause();
        await mill.refineCorn(deployerSummoner, constants.WeiPerEther.mul(2));
      } catch (err) {
        expect(err.message).to.contain("Mill not available");
      }
    });

    it("should fail if not divisible by refining cost", async () => {
      try {
        await corn.connect(deployer).addMinter(deployer.address);
        await corn
          .connect(deployer)
          .mint(deployerSummoner, constants.WeiPerEther.mul(10));
        await mill
          .connect(deployer)
          .refineCorn(deployerSummoner, constants.WeiPerEther.mul(3));
      } catch (err) {
        expect(err.message).to.contain(
          "Amount must be divisible by refining cost"
        );
      }
    });

    it("should fail if balance too low", async () => {
      try {
        const wheatBalance = await wheat
          .connect(deployer)
          .balanceOf(deployerSummoner);
        await wheat.burn(deployerSummoner, wheatBalance);
        await mill
          .connect(deployer)
          .refineWheat(deployerSummoner, constants.WeiPerEther.mul(2));
      } catch (err) {
        expect(err.message).to.contain("Crop balance too low");
      }
    });

    it("should refine resource", async () => {
      const approve = constants.WeiPerEther.mul(1000);
      await corn.connect(deployer).addMinter(deployer.address);
      await corn.connect(deployer).mint(deployerSummoner, approve);
      const currentCorn = await corn
        .connect(deployer)
        .balanceOf(deployerSummoner);
      const currentMeal = await meal
        .connect(deployer)
        .balanceOf(deployerSummoner);
      await corn
        .connect(deployer)
        .burnApprove(deployerSummoner, mill.address, approve);

      await mill
        .connect(deployer)
        .refineCorn(deployerSummoner, constants.WeiPerEther.mul(2));
      expect(await meal.connect(deployer).balanceOf(deployerSummoner)).to.equal(
        currentMeal.add(constants.WeiPerEther)
      );
      expect(await corn.connect(deployer).balanceOf(deployerSummoner)).to.equal(
        currentCorn.sub(constants.WeiPerEther.mul(2))
      );
    });

    it("should refine more resources", async () => {
      const approve = constants.WeiPerEther.mul(1000);
      await corn.connect(deployer).addMinter(deployer.address);
      await corn.connect(deployer).mint(deployerSummoner, approve);
      const currentCorn = await corn
        .connect(deployer)
        .balanceOf(deployerSummoner);
      const currentMeal = await meal
        .connect(deployer)
        .balanceOf(deployerSummoner);
      await corn
        .connect(deployer)
        .burnApprove(deployerSummoner, mill.address, approve);

      await mill
        .connect(deployer)
        .refineCorn(deployerSummoner, constants.WeiPerEther.mul(10));
      expect(await meal.connect(deployer).balanceOf(deployerSummoner)).to.equal(
        currentMeal.add(constants.WeiPerEther.mul(5))
      );
      expect(await corn.connect(deployer).balanceOf(deployerSummoner)).to.equal(
        currentCorn.sub(constants.WeiPerEther.mul(10))
      );
    });
  });

  describe("refineWheat", () => {
    it("should refine resource", async () => {
      const approve = constants.WeiPerEther.mul(1000);
      await wheat.connect(deployer).addMinter(deployer.address);
      await wheat.connect(deployer).mint(deployerSummoner, approve);
      const currentWheat = await wheat
        .connect(deployer)
        .balanceOf(deployerSummoner);
      const currentFlour = await flour
        .connect(deployer)
        .balanceOf(deployerSummoner);
      await wheat
        .connect(deployer)
        .burnApprove(deployerSummoner, mill.address, approve);

      await mill
        .connect(deployer)
        .refineWheat(deployerSummoner, constants.WeiPerEther.mul(2));
      expect(
        await flour.connect(deployer).balanceOf(deployerSummoner)
      ).to.equal(currentFlour.add(constants.WeiPerEther));
      expect(
        await wheat.connect(deployer).balanceOf(deployerSummoner)
      ).to.equal(currentWheat.sub(constants.WeiPerEther.mul(2)));
    });
  });

  describe("refineBeans", () => {
    it("should refine resource", async () => {
      const approve = constants.WeiPerEther.mul(1000);
      await beans.connect(deployer).addMinter(deployer.address);
      await beans.connect(deployer).mint(deployerSummoner, approve);
      const currentBeans = await beans
        .connect(deployer)
        .balanceOf(deployerSummoner);
      const currentOil = await oil
        .connect(deployer)
        .balanceOf(deployerSummoner);
      await beans
        .connect(deployer)
        .burnApprove(deployerSummoner, mill.address, approve);

      await mill
        .connect(deployer)
        .refineBeans(deployerSummoner, constants.WeiPerEther.mul(2));
      expect(await oil.connect(deployer).balanceOf(deployerSummoner)).to.equal(
        currentOil.add(constants.WeiPerEther)
      );
      expect(
        await beans.connect(deployer).balanceOf(deployerSummoner)
      ).to.equal(currentBeans.sub(constants.WeiPerEther.mul(2)));
    });
  });

  describe("refineBarley", () => {
    it("should refine resource", async () => {
      const approve = constants.WeiPerEther.mul(1000);
      await barley.connect(deployer).addMinter(deployer.address);
      await barley.connect(deployer).mint(deployerSummoner, approve);
      const currentBarley = await barley
        .connect(deployer)
        .balanceOf(deployerSummoner);
      const currentMalt = await malt
        .connect(deployer)
        .balanceOf(deployerSummoner);
      await barley
        .connect(deployer)
        .burnApprove(deployerSummoner, mill.address, approve);

      await mill
        .connect(deployer)
        .refineBarley(deployerSummoner, constants.WeiPerEther.mul(2));
      expect(await malt.connect(deployer).balanceOf(deployerSummoner)).to.equal(
        currentMalt.add(constants.WeiPerEther)
      );
      expect(
        await barley.connect(deployer).balanceOf(deployerSummoner)
      ).to.equal(currentBarley.sub(constants.WeiPerEther.mul(2)));
    });
  });
});
