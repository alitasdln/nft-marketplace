// Test file for Marketplace contract 
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Marketplace", function() {
  let marketplace;
  let simpleNFT;
  let owner;
  let seller;
  let buyer;

  beforeEach(async function() {
    [owner, seller, buyer] = await ethers.getSigners();

    // Deploy SimpleNFT
    const SimpleNFT = await ethers.getContractFactory("SimpleNFT");
    simpleNFT = await SimpleNFT.deploy();
    await simpleNFT.deployed();

    // Deploy Marketplace
    const Marketplace = await ethers.getContractFactory("Marketplace");
    marketplace = await Marketplace.deploy();
    await marketplace.deployed();

    // Mint NFT to seller
    await simpleNFT.connect(seller).mint(seller.address);
    
    // Approve marketplace to transfer NFT
    await simpleNFT.connect(seller).approve(marketplace.address, 1);
  });

  describe("Listing NFTs", function() {
    it("Should list an NFT successfully", async function() {
      const price = ethers.utils.parseEther("1");
      
      await expect(marketplace.connect(seller).listNFT(simpleNFT.address, 1, price))
        .to.emit(marketplace, "NFTListed")
        .withArgs(0, seller.address, simpleNFT.address, 1, price);

      const listing = await marketplace.listings(0);
      expect(listing.seller).to.equal(seller.address);
      expect(listing.price).to.equal(price);
      expect(listing.active).to.be.true;
    });

    it("Should fail to list NFT with zero price", async function() {
      await expect(marketplace.connect(seller).listNFT(simpleNFT.address, 1, 0))
        .to.be.revertedWith("Price must be greater than 0");
    });

    it("Should fail to list NFT if not owner", async function() {
      const price = ethers.utils.parseEther("1");
      
      await expect(marketplace.connect(buyer).listNFT(simpleNFT.address, 1, price))
        .to.be.revertedWith("Not token owner");
    });
  });

  describe("Buying NFTs", function() {
    beforeEach(async function() {
      const price = ethers.utils.parseEther("1");
      await marketplace.connect(seller).listNFT(simpleNFT.address, 1, price);
    });

    it("Should buy NFT successfully", async function() {
      const price = ethers.utils.parseEther("1");
      
      await expect(marketplace.connect(buyer).buyNFT(0, { value: price }))
        .to.emit(marketplace, "NFTSold")
        .withArgs(0, buyer.address, seller.address, price);

      expect(await simpleNFT.ownerOf(1)).to.equal(buyer.address);
      
      const listing = await marketplace.listings(0);
      expect(listing.active).to.be.false;
    });

    it("Should fail to buy with insufficient payment", async function() {
      const insufficientPrice = ethers.utils.parseEther("0.5");
      
      await expect(marketplace.connect(buyer).buyNFT(0, { value: insufficientPrice }))
        .to.be.revertedWith("Insufficient payment");
    });

    it("Should refund excess payment", async function() {
      const excessPrice = ethers.utils.parseEther("2");
      const initialBalance = await buyer.getBalance();
      
      const tx = await marketplace.connect(buyer).buyNFT(0, { value: excessPrice });
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed.mul(receipt.effectiveGasPrice);
      
      const finalBalance = await buyer.getBalance();
      const expectedBalance = initialBalance.sub(ethers.utils.parseEther("1")).sub(gasUsed);
      
      expect(finalBalance).to.be.closeTo(expectedBalance, ethers.utils.parseEther("0.001"));
    });
  });

  describe("Canceling Listings", function() {
    beforeEach(async function() {
      const price = ethers.utils.parseEther("1");
      await marketplace.connect(seller).listNFT(simpleNFT.address, 1, price);
    });

    it("Should cancel listing successfully", async function() {
      await expect(marketplace.connect(seller).cancelListing(0))
        .to.emit(marketplace, "ListingCancelled")
        .withArgs(0);

      const listing = await marketplace.listings(0);
      expect(listing.active).to.be.false;
    });

    it("Should fail to cancel if not seller", async function() {
      await expect(marketplace.connect(buyer).cancelListing(0))
        .to.be.revertedWith("Not seller");
    });
  });

  describe("Fees", function() {
    it("Should collect fees on sales", async function() {
      const price = ethers.utils.parseEther("1");
      await marketplace.connect(seller).listNFT(simpleNFT.address, 1, price);
      
      const initialBalance = await ethers.provider.getBalance(marketplace.address);
      
      await marketplace.connect(buyer).buyNFT(0, { value: price });
      
      const finalBalance = await ethers.provider.getBalance(marketplace.address);
      const expectedFee = price.mul(250).div(10000); // 2.5% fee
      
      expect(finalBalance.sub(initialBalance)).to.equal(expectedFee);
    });

    it("Should allow owner to withdraw fees", async function() {
      const price = ethers.utils.parseEther("1");
      await marketplace.connect(seller).listNFT(simpleNFT.address, 1, price);
      await marketplace.connect(buyer).buyNFT(0, { value: price });
      
      const initialBalance = await owner.getBalance();
      const contractBalance = await ethers.provider.getBalance(marketplace.address);
      
      const tx = await marketplace.connect(owner).withdrawFees();
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed.mul(receipt.effectiveGasPrice);
      
      const finalBalance = await owner.getBalance();
      const expectedBalance = initialBalance.add(contractBalance).sub(gasUsed);
      
      expect(finalBalance).to.be.closeTo(expectedBalance, ethers.utils.parseEther("0.001"));
    });
  });
}); 