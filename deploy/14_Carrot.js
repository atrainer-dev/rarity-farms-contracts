const { NonceManager } = require("@ethersproject/experimental");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const malt = await deploy("Carrot", {
    from: deployer,
    args: [],
    log: true,
  });
};
module.exports.tags = ["Carrot"];
