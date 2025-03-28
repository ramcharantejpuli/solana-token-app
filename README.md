# Solana Token Manager

A modern web application for creating and managing tokens on the Solana blockchain. Built with React, TypeScript, and Material-UI.

## Features

- **Wallet Integration**
  - Connect with Phantom or Solflare wallets
  - View wallet address and SOL balance
  - Secure wallet connection handling

- **Token Management**
  - Create new SPL tokens
  - Mint tokens to your wallet
  - Send tokens to other addresses

- **User Interface**
  - Modern, responsive design
  - Real-time transaction feedback
  - Clear error handling
  - Mobile-friendly layout

## Prerequisites

- Node.js v16 or higher
- Phantom or Solflare wallet browser extension
- Some SOL in your wallet on Devnet

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/solana-token-app.git
cd solana-token-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. **Connect Wallet**
   - Click "Connect Wallet" button
   - Select your wallet (Phantom or Solflare)
   - Approve the connection

2. **Create Token**
   - Click "Create Token" to create a new SPL token
   - Wait for transaction confirmation
   - You'll see a success notification when done

3. **Mint Token**
   - After creating a token, click "Mint Token"
   - This will mint 1 token to your wallet
   - Wait for transaction confirmation

4. **Send Token**
   - Enter recipient's Solana address
   - Enter amount to send
   - Click "Send Token"
   - Approve the transaction in your wallet

## Technologies Used

- React
- TypeScript
- Material-UI
- @solana/web3.js
- @solana/spl-token
- @solana/wallet-adapter

## Error Handling

The app handles various error cases:
- Wallet connection failures
- Insufficient SOL balance
- Invalid addresses
- Failed transactions

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT License
