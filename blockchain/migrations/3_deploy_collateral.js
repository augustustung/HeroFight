const collateral = artifacts.require("CollateralContract")
const busd = artifacts.require("BUSD")
module.exports = async (deployer) => {
  const busdInstance = await busd.deployed()
  await deployer.deploy(collateral, busdInstance.address)
  const collateralInstance = await collateral.deployed()
}
