const busd = artifacts.require("BUSD")
const collateral = artifacts.require("CollateralContract")
const { expect } = require("chai")

contract("CollateralContract", async (accounts) => {
  let owner = accounts[0]
  let user = accounts[1]
  let busdInstance
  let collateralInstance
  before("should set up collateral", async () => {
    busdInstance = await busd.new()
    collateralInstance = await collateral.new(busdInstance.address)
    await busdInstance.transfer(
      collateralInstance.address,
      web3.utils.toWei("100000")
    )
  })
  it("should deploy collateral success", async () => {
    await collateral.deployed()
    return assert.isTrue(true)
  })
  it("should set and withdraw collateral", async () => {
    await collateralInstance.setCollateral(user, web3.utils.toWei("1000"))
    await collateralInstance.withdrawCollateral({ from: user })
    const balance = await busdInstance.balanceOf(user)
    expect(balance.toString()).to.be.eq(web3.utils.toWei("1000"))
  })
  it("should refund the owner", async () => {
    await collateralInstance.setCollateral(user, web3.utils.toWei("1000"))
    await collateralInstance.approveOwnerWithdraw({ from: user })
    const balanceBefore = await busdInstance.balanceOf(owner)

    await collateralInstance.withdrawCollterralOwner()
    const balanceAfter = await busdInstance.balanceOf(owner)

    expect(
      balanceBefore.add(new web3.utils.BN(web3.utils.toWei("1000"))).toString()
    ).to.be.eq(balanceAfter.toString())
  })
})
