const { exec } = require("child_process")
const { networks } = require("../truffle-config")
let args = process.argv
let str = args.splice(2, 2)
let contract = str[0]
let network = str[1] || "development"

const chainId = networks[network].network_id
const contractJson = require(`../build/contracts/${contract}`)
const address = contractJson.networks[chainId].address
console.log(address)
exec(`truffle run verify ${contract}@${address} --network=${network}`, cb)

function cb(error, stdin, stdout) {
  console.log(`stdin:`, stdin)
  if (error) {
    console.log(error)
    return
  }
}
