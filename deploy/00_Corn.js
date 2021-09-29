module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  console.log(deployer);
  await deploy("Corn", {
    from: deployer,
    args: [],
    log: true,
  });
};
module.exports.tags = ["Corn"];
