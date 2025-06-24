// Frontend JavaScript for NFT Marketplace 
import { ethers } from 'ethers';

// Contract addresses (will be populated after deployment)
let contractAddresses = {};
let contracts = {};

// Application state
let provider = null;
let signer = null;
let userAddress = null;

// Contract instances
let marketplaceContract = null;
let nftContract = null;

// Initialize the application
async function init() {
    console.log('Initializing NFT Marketplace...');
    
    // Check if MetaMask is installed
    if (typeof window.ethereum === 'undefined') {
        showStatus('Please install MetaMask to use this application!', 'error');
        return;
    }

    // Try to load contract addresses
    try {
        const response = await fetch('/src/contracts/contract-address.json');
        contractAddresses = await response.json();
        console.log('Contract addresses loaded:', contractAddresses);
        
        // Load contract ABIs
        const marketplaceABI = await fetch('/src/contracts/Marketplace.json').then(r => r.json());
        const nftABI = await fetch('/src/contracts/SimpleNFT.json').then(r => r.json());
        
        contracts.Marketplace = marketplaceABI;
        contracts.SimpleNFT = nftABI;
        
    } catch (error) {
        console.warn('Contract files not found. Please deploy contracts first.');
        showStatus('Please deploy contracts first using: npm run deploy', 'error');
        return;
    }

    // Set up event listeners
    setupEventListeners();
    
    // Load listings
    await loadListings();
}

// Set up event listeners
function setupEventListeners() {
    document.getElementById('connectWallet').addEventListener('click', connectWallet);
    document.getElementById('mintNFT').addEventListener('click', mintNFT);
    document.getElementById('listNFT').addEventListener('click', listNFT);
}

// Connect to MetaMask wallet
async function connectWallet() {
    try {
        // Request account access
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        // Create provider and signer
        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();
        userAddress = await signer.getAddress();
        
        // Create contract instances
        marketplaceContract = new ethers.Contract(
            contractAddresses.Marketplace,
            contracts.Marketplace.abi,
            signer
        );
        
        nftContract = new ethers.Contract(
            contractAddresses.SimpleNFT,
            contracts.SimpleNFT.abi,
            signer
        );
        
        // Update UI
        await updateWalletUI();
        
        // Listen for account changes
        window.ethereum.on('accountsChanged', async (accounts) => {
            if (accounts.length === 0) {
                disconnectWallet();
            } else {
                userAddress = accounts[0];
                await updateWalletUI();
            }
        });
        
        showStatus('Wallet connected successfully!', 'success');
        
    } catch (error) {
        console.error('Error connecting wallet:', error);
        showStatus('Failed to connect wallet: ' + error.message, 'error');
    }
}

// Disconnect wallet
function disconnectWallet() {
    provider = null;
    signer = null;
    userAddress = null;
    marketplaceContract = null;
    nftContract = null;
    
    document.getElementById('connectWallet').style.display = 'block';
    document.getElementById('walletInfo').style.display = 'none';
}

// Update wallet UI
async function updateWalletUI() {
    const connectButton = document.getElementById('connectWallet');
    const walletInfo = document.getElementById('walletInfo');
    const walletAddress = document.getElementById('walletAddress');
    const walletBalance = document.getElementById('walletBalance');
    
    if (userAddress) {
        connectButton.style.display = 'none';
        walletInfo.style.display = 'flex';
        
        // Show shortened address
        const shortAddress = `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`;
        walletAddress.textContent = shortAddress;
        
        // Show balance
        const balance = await provider.getBalance(userAddress);
        const balanceInEth = ethers.utils.formatEther(balance);
        walletBalance.textContent = `${parseFloat(balanceInEth).toFixed(3)} ETH`;
    }
}

// Mint a new NFT
async function mintNFT() {
    if (!nftContract) {
        showStatus('Please connect your wallet first!', 'error');
        return;
    }
    
    try {
        showStatus('Minting NFT...', 'info');
        
        const tx = await nftContract.mint(userAddress);
        await tx.wait();
        
        // Get the token ID from the transaction receipt
        const receipt = await provider.getTransactionReceipt(tx.hash);
        const tokenId = receipt.logs[0].topics[3];
        const tokenIdDecimal = ethers.BigNumber.from(tokenId).toString();
        
        showStatus(`NFT minted successfully! Token ID: ${tokenIdDecimal}`, 'success');
        
    } catch (error) {
        console.error('Error minting NFT:', error);
        showStatus('Failed to mint NFT: ' + error.message, 'error');
    }
}

// List an NFT for sale
async function listNFT() {
    if (!marketplaceContract || !nftContract) {
        showStatus('Please connect your wallet first!', 'error');
        return;
    }
    
    const tokenId = document.getElementById('tokenId').value;
    const price = document.getElementById('price').value;
    
    if (!tokenId || !price) {
        showStatus('Please enter both Token ID and Price!', 'error');
        return;
    }
    
    try {
        showStatus('Listing NFT...', 'info');
        
        // Check if user owns the NFT
        const owner = await nftContract.ownerOf(tokenId);
        if (owner.toLowerCase() !== userAddress.toLowerCase()) {
            showStatus('You do not own this NFT!', 'error');
            return;
        }
        
        // Check if marketplace is approved
        const approved = await nftContract.getApproved(tokenId);
        if (approved.toLowerCase() !== contractAddresses.Marketplace.toLowerCase()) {
            // Approve marketplace
            showStatus('Approving marketplace...', 'info');
            const approveTx = await nftContract.approve(contractAddresses.Marketplace, tokenId);
            await approveTx.wait();
        }
        
        // List the NFT
        const priceInWei = ethers.utils.parseEther(price);
        const tx = await marketplaceContract.listNFT(contractAddresses.SimpleNFT, tokenId, priceInWei);
        await tx.wait();
        
        showStatus('NFT listed successfully!', 'success');
        
        // Clear inputs and reload listings
        document.getElementById('tokenId').value = '';
        document.getElementById('price').value = '';
        await loadListings();
        
    } catch (error) {
        console.error('Error listing NFT:', error);
        showStatus('Failed to list NFT: ' + error.message, 'error');
    }
}

// Load all active listings
async function loadListings() {
    const container = document.getElementById('listingsContainer');
    
    if (!contractAddresses.Marketplace) {
        container.innerHTML = '<p>Please deploy contracts first.</p>';
        return;
    }
    
    try {
        // Create read-only provider if user hasn't connected wallet
        let readProvider = provider;
        if (!readProvider) {
            readProvider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545');
        }
        
        const readMarketplace = new ethers.Contract(
            contractAddresses.Marketplace,
            contracts.Marketplace?.abi || [],
            readProvider
        );
        
        // Get next listing ID to know how many listings exist
        const nextListingId = await readMarketplace.nextListingId();
        const listings = [];
        
        // Fetch all listings
        for (let i = 0; i < nextListingId; i++) {
            try {
                const listing = await readMarketplace.listings(i);
                if (listing.active) {
                    listings.push({ id: i, ...listing });
                }
            } catch (error) {
                // Listing might not be active
                continue;
            }
        }
        
        // Display listings
        if (listings.length === 0) {
            container.innerHTML = '<p>No active listings found.</p>';
            return;
        }
        
        container.innerHTML = listings.map(listing => `
            <div class="listing-card">
                <h4>🎨 NFT #${listing.tokenId.toString()}</h4>
                <p><strong>Contract:</strong> ${listing.nftContract.slice(0, 10)}...</p>
                <p><strong>Seller:</strong> ${listing.seller.slice(0, 10)}...</p>
                <div class="price">${ethers.utils.formatEther(listing.price)} ETH</div>
                <button onclick="buyNFT(${listing.id}, '${listing.price.toString()}')" 
                        ${!signer ? 'disabled' : ''}>
                    ${!signer ? 'Connect Wallet to Buy' : 'Buy NFT'}
                </button>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading listings:', error);
        container.innerHTML = '<p>Error loading listings. Make sure the local blockchain is running.</p>';
    }
}

// Buy an NFT
window.buyNFT = async function(listingId, priceString) {
    if (!marketplaceContract) {
        showStatus('Please connect your wallet first!', 'error');
        return;
    }
    
    try {
        showStatus('Buying NFT...', 'info');
        
        const tx = await marketplaceContract.buyNFT(listingId, {
            value: priceString
        });
        await tx.wait();
        
        showStatus('NFT purchased successfully!', 'success');
        await loadListings();
        
    } catch (error) {
        console.error('Error buying NFT:', error);
        showStatus('Failed to buy NFT: ' + error.message, 'error');
    }
};

// Show status message
function showStatus(message, type = 'info') {
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = message;
    statusDiv.className = `status-message ${type} show`;
    
    setTimeout(() => {
        statusDiv.classList.remove('show');
    }, 5000);
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init); 