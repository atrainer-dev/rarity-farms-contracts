const { NonceManager } = require("@ethersproject/experimental");
const { BigNumber } = require("@ethersproject/bignumber");
const constants = require("@ethersproject/constants");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const signer = await ethers.getSigner(deployer);
  const nonceManager = new NonceManager(signer);

  // Farms
  const apple = await deployments.get("Apple");

  const block = await ethers.provider.getBlock();
  const start = block.timestamp + 86400 * 1;
  const end = block.timestamp + 86400 * 7;

  const subsidy1 = await deploy("Apple_Subsidy_1", {
    from: deployer,
    contract: "Subsidy",
    args: [apple.address, start, end],
    log: true,
    nonce: nonceManager.getTransactionCount(),
  });

  if (subsidy1.newlyDeployed) {
    await nonceManager.sendTransaction({
      to: subsidy1.address,
      value: ethers.utils.parseEther("2.0"),
    });
  }
};
module.exports.tags = ["Apple_Subsidy_1"];
