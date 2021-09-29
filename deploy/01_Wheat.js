module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  console.log(deployer);
  await deploy("Wheat", {
    from: deployer,
    args: [],
    log: true,
  });
};
module.exports.tags = ["Wheat"];
