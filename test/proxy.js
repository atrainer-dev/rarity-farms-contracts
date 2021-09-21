const { ethers } = require("hardhat");

describe("Proxy", function () {
  let proxy;
  before(async function () {
    [owner, address1] = await ethers.getSigners();
  });

  beforeEach(async function () {
    const Proxy = await ethers.getContractFactory("RarityFarmsProxy");
    proxy = await Proxy.deploy();
  });

  describe.only("massSummon", () => {
    it("should mass summon summoners", async function () {
      const result = await proxy.connect(owner).massSummon([1, 4, 6, 8]);
      const receipt = await result.wait();
      const logs = receipt.events?.filter((x) => {
        return x.event == "summoned";
      });
      console.log(logs);
    });
  });
});
