const busdPool = artifacts.require("BUSDpool")
const busd = artifacts.require("BUSD")
module.exports = async (deployer) => {
  await deployer.deploy(busd)
  const busdInstance = await busd.deployed()
  const tx_deploy = await deployer.deploy(busdPool, busdInstance.address)
  //   console.log(`Pool deploy at ${tx_deploy}`)
}
