const { NonceManager } = require("@ethersproject/experimental");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const apple = await deploy("Apple", {
    from: deployer,
    args: [],
    log: true,
  });
};
module.exports.tags = ["Apple"];
