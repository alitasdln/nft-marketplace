# NFT Marketplace

A simple decentralized NFT marketplace built with Solidity, Hardhat, and Vite + Vanilla JavaScript. This is a toy-level implementation perfect for learning Web3 development.

## Features

- **Mint NFTs** - Create new NFTs with a simple click
- **List NFTs** - Put your NFTs up for sale in the marketplace
- **Buy NFTs** - Purchase NFTs listed by other users
- **Secure Transactions** - Built-in reentrancy protection and access controls
- **Fee Collection** - 2.5% marketplace fee on all sales
- **Modern UI** - Responsive frontend with Web3 wallet integration

## Architecture

### Smart Contracts (≤150 LOC)
- **Marketplace.sol** - Main marketplace contract for listing/buying NFTs
- **SimpleNFT.sol** - Basic ERC721 NFT contract for testing

### Frontend
- **Vite + Vanilla JavaScript**
- **ethers.js** - Web3 library for blockchain interaction
- **Modern CSS** - Responsive design with gradient backgrounds

## Getting Started

### Prerequisites
- Node.js (v16+)
- MetaMask browser extension
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone 
   cd nft-marketplace
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd frontend && npm install && cd ..
   ```

3. **Start local blockchain**
   ```bash
   npm run node
   ```
   

4. **Deploy contracts** (in a new terminal)
   ```bash
   npm run compile
   npm run deploy
   ```

5. **Start the frontend**
   ```bash
   npm run dev
   ```

6. **Configure MetaMask**
   - Add local network: RPC URL `http://127.0.0.1:8545`, Chain ID `31337`
   - Import a test account using private keys from the Hardhat node output

## Usage

1. **Connect Wallet** - Click "Connect Wallet" and select MetaMask
2. **Mint NFTs** - Click "Mint New NFT" to create test NFTs
3. **List NFTs** - Enter Token ID and price, then click "List NFT"
4. **Buy NFTs** - Browse listings and click "Buy NFT" to purchase

## Testing

Run the comprehensive test suite:
```bash
npm run test
```

The tests cover:
- NFT listing functionality
- Secure buying with proper validation
- Fee collection and withdrawal
- Access control and error handling

## Project Structure

```
nft-marketplace/
├── contracts/
│   ├── Marketplace.sol          # Main marketplace contract
│   └── SimpleNFT.sol           # Test NFT contract
├── scripts/
│   └── deploy.js               # Deployment script
├── test/
│   └── marketplace.test.js     # Comprehensive tests
├── frontend/
│   ├── index.html              # Main HTML file
│   ├── app.js                  # JavaScript with ethers.js
│   ├── styles.css              # Modern CSS styling
│   ├── package.json            # Frontend dependencies
│   └── vite.config.js          # Vite configuration
├── hardhat.config.js           # Hardhat configuration
├── package.json                # Main dependencies
└── README.md                   # This file
```

## Smart Contract Details

### Marketplace Contract
- **Functions**: `listNFT()`, `buyNFT()`, `cancelListing()`
- **Security**: ReentrancyGuard, proper access controls
- **Fees**: 2.5% marketplace fee (configurable by owner)
- **Events**: NFTListed, NFTSold, ListingCancelled

### Contract Size
- Marketplace.sol: ~95 lines of code
- SimpleNFT.sol: ~25 lines of code
- Total: ≤150 LOC

## Development Notes

This is a **toy-level implementation** designed for learning purposes:
- No upgradeability patterns
- No factory contracts
- Simple ownership model
- Basic fee structure
- Minimal frontend state management

## License

MIT License - feel free to use this for learning and educational purposes! 
