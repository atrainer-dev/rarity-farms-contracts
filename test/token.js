const { expect } = require("chai");
const { ethers } = require("hardhat");
const { BigNumber } = require("@ethersproject/bignumber");

describe("Token", function () {
  it("Should set the total supply", async function () {
    const Token = await ethers.getContractFactory("RarityAdventuresToken");
    const token = await Token.deploy(100000000);
    await token.deployed();

    const [owner] = await ethers.getSigners();
    const supply = "100000000000000000000000000";

    expect(await token.totalSupply()).to.equal(BigNumber.from(supply));

    expect(await token.balanceOf(owner.address)).to.equal(supply);
  });
});
