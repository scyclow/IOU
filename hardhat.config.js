
require("@nomiclabs/hardhat-waffle")
const STUFF = require('./stuff.json')

module.exports = {
  solidity: {
    compilers: [
      {version: "0.8.2"},
    ]
  },
  networks: {
    mumbai: {
      url: STUFF.POLYGON_MUMBAI_URL,
      accounts: [`0x${STUFF.ACCOUNT}`]
    }
  }
}