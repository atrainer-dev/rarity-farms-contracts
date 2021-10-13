const { NonceManager } = require("@ethersproject/experimental");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const oil = await deploy("Oil", {
    from: deployer,
    args: [],
    log: true,
  });
};
module.exports.tags = ["Oil"];
