const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Deploy SimpleNFT contract
  const SimpleNFT = await ethers.getContractFactory("SimpleNFT");
  const simpleNFT = await SimpleNFT.deploy();
  await simpleNFT.deployed();
  console.log("SimpleNFT deployed to:", simpleNFT.address);

  // Deploy Marketplace contract
  const Marketplace = await ethers.getContractFactory("Marketplace");
  const marketplace = await Marketplace.deploy();
  await marketplace.deployed();
  console.log("Marketplace deployed to:", marketplace.address);

  // Save contract addresses and ABIs for frontend
  const fs = require('fs');
  const contractsDir = './frontend/src/contracts';

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true });
  }

  fs.writeFileSync(
    contractsDir + '/contract-address.json',
    JSON.stringify({ 
      SimpleNFT: simpleNFT.address,
      Marketplace: marketplace.address 
    }, undefined, 2)
  );

  const SimpleNFTArtifact = await hre.artifacts.readArtifact("SimpleNFT");
  const MarketplaceArtifact = await hre.artifacts.readArtifact("Marketplace");

  fs.writeFileSync(
    contractsDir + '/SimpleNFT.json',
    JSON.stringify(SimpleNFTArtifact, null, 2)
  );

  fs.writeFileSync(
    contractsDir + '/Marketplace.json',
    JSON.stringify(MarketplaceArtifact, null, 2)
  );

  console.log("Contract artifacts saved to frontend/src/contracts/");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 