const { NonceManager } = require("@ethersproject/experimental");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const flour = await deploy("Flour", {
    from: deployer,
    args: [],
    log: true,
  });
};
module.exports.tags = ["Flour"];
