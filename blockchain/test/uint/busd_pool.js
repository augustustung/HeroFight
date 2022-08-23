const BusdPool = artifacts.require("BUSDpool")
const busd = artifacts.require("BUSD")
const { expect } = require("chai")

contract("BusdPool", function(accounts) {
  let owner = accounts[0]
  let team = accounts[1]
  let marketing = accounts[2]
  let sever = accounts[3]
  let user = accounts[4]

  let busdInstance
  let busdPoolInstance

  before("should set up before test", async () => {
    busdInstance = await busd.new()
    busdPoolInstance = await BusdPool.new(busdInstance.address)
    await busdInstance.transfer(user, web3.utils.toWei("100000"))
    await busdPoolInstance.initialize(marketing, team, sever)
  })
  it("should assert true", async () => {
    await BusdPool.deployed()
    return assert.isTrue(true)
  })
  it("should buy box success fully", async () => {
    await busdInstance.approve(
      busdPoolInstance.address,
      web3.utils.toWei("100000"),
      { from: user }
    )
    await busdPoolInstance.buyBox(1, 1, web3.utils.toWei("100000"), {
      from: user,
    })
    const balance = await busdInstance.balanceOf(busdPoolInstance.address)
    expect(balance.toString()).to.be.eq(web3.utils.toWei("100000"))
  })
  it("should withdraw buy box success fully", async () => {
    await busdPoolInstance.partnerWithdraw({ from: marketing })
    let balance = await busdInstance.balanceOf(marketing)
    await busdPoolInstance.partnerWithdraw({ from: team })
    let balanceTeam = await busdInstance.balanceOf(team)
    await busdPoolInstance.partnerWithdraw({ from: sever })
    let balanceSever = await busdInstance.balanceOf(sever)
    console.log(web3.utils.fromWei(balance))
    console.log(web3.utils.fromWei(balanceTeam))
    console.log(web3.utils.fromWei(balanceSever))
    await busdInstance.approve(
      busdPoolInstance.address,
      web3.utils.toWei("200000")
    )
    const tx_buybox = await busdPoolInstance.buyBox(
      1,
      1,
      web3.utils.toWei("200000")
    )
    console.log(tx_buybox)
    await busdPoolInstance.partnerWithdraw({ from: marketing })
    balance = await busdInstance.balanceOf(marketing)
    await busdPoolInstance.partnerWithdraw({ from: team })
    balanceTeam = await busdInstance.balanceOf(team)
    await busdPoolInstance.partnerWithdraw({ from: sever })
    balanceSever = await busdInstance.balanceOf(sever)
    console.log(web3.utils.fromWei(balance))
    console.log(web3.utils.fromWei(balanceTeam))
    console.log(web3.utils.fromWei(balanceSever))
    // expect(balance.toString()).to.be.eq(
    //   new web3.utils.BN(web3.utils.toWei("100000"))
    //     .mul("3")
    //     .div("100")
    //     .toString()
    // )
  })
})
