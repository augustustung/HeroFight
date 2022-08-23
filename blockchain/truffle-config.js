const HDWalletProvider = require("@truffle/hdwallet-provider")
const fs = require("fs")
const mnemonic = fs.readFileSync(".secret").toString().trim()

module.exports = {
  plugins: [
    "truffle-contract-size",
    "truffle-plugin-solhint",
    "truffle-plugin-verify",
  ],
  api_keys: {
    bscscan: "K1IYARAMWUJKF3CCD4EZXEBX58VVCTT62D",
  },
  networks: {
    development: {
      host: "127.0.0.1", // Localhost (default: none)
      port: 8545, // Standard Ethereum port (default: none)
      network_id: "*", // Any network (default: none)
    },
    production: {
      host: "127.0.0.1",
      port: 8546,
      network_id: "999",
    },
    bsc_testnet: {
      provider: () =>
        new HDWalletProvider(
          mnemonic,
          `https://speedy-nodes-nyc.moralis.io/92bbe26df86700c9ae96e4c1/bsc/testnet`
        ),
      network_id: 97,
      confirmations: 10,
      networkCheckTimeout: 1000000,
      timeoutBlocks: 100000,
      skipDryRun: true,
    },
  },

  // Set default mocha options here, use special reporters etc.
  mocha: {
    timeout: 100000,
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: "0.8.11", // Fetch exact version from solc-bin (default: truffle's version)
      // docker: true,        // Use "0.5.1" you've installed locally with docker (default: false)
      // settings: {          // See the solidity docs for advice about optimization and evmVersion
      optimizer: {
        enabled: true,
        runs: 400,
      },
      //  evmVersion: "byzantium"
      // }
    },
  },
}
