/**
 * @type import('hardhat/config').HardhatUserConfig
 */

require("@nomiclabs/hardhat-waffle");
module.exports = {
  solidity: {
    compilers: [
      {version: "0.8.2"},
    ]
  }
};