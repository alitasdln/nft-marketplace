
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");

module.exports = {
  solidity: "0.8.19",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545"
    }
  },
  paths: {
    artifacts: "./frontend/src/artifacts"
  }
}; 

// module.exports = {
//   solidity: "0.8.19",
//   networks: {
//     localhost: {
//       url: "http://127.0.0.1:8545",
//       accounts: {
//         count: 10,          // Number of accounts (default: 20)
//         accountsBalance: "1000000000000000000000", // 1000 ETH (default: 10000)
//         mnemonic: "test test test test test test test test test test test junk"
//       }
//     },
//     hardhat: {
//       accounts: {
//         count: 50,          // For hardhat network
//         accountsBalance: "5000000000000000000000" // 5000 ETH
//       }
//     }
//   },
//   // ... rest of config
// };