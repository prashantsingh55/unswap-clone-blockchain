require("@nomiclabs/hardhat-waffle");


/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.4",
  networks: {
    rinkeby: {
      url: 'https://eth-rinkeby.alchemyapi.io/v2/R9V7D0034dz2SlQiwh4OGcnvr0uCb6kj',
      accounts: [
        'c01ff14fca8bdd1cc1648c4c93498868e74ad302745ede1c713444e5a585f244'
      ]
    }
  }
};
