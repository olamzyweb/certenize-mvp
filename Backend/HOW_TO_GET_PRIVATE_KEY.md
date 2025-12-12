# How to Get Your Private Key

## What is a Private Key?

A private key is a secret code that controls access to your Ethereum wallet. It's like a password that:
- Allows you to send transactions
- Pays for gas fees
- Signs transactions on the blockchain

**⚠️ SECURITY WARNING:** Never share your private key with anyone! It gives full control over your wallet.

## Where to Get a Private Key

### Option 1: Create a New Wallet (Recommended for Testing)

**Using MetaMask (Easiest):**

1. **Install MetaMask:**
   - Go to https://metamask.io/
   - Install the browser extension
   - Create a new wallet or import an existing one

2. **Create a New Account:**
   - Click on your account icon (top right)
   - Click "Create Account" or "Add Account"
   - Name it something like "Cred-AI Minting Wallet"
   - Click "Create"

3. **Get the Private Key:**
   - Click on the three dots (⋮) next to your account name
   - Click "Account Details"
   - Click "Show Private Key"
   - Enter your MetaMask password
   - **Copy the private key** (it will look like: `a1b2c3d4e5f6...` - 64 characters)
   - **IMPORTANT:** Remove the `0x` prefix if it has one (the code handles it)

4. **Add to .env:**
   ```env
   PRIVATE_KEY=your_private_key_here_without_0x
   ```

5. **Get the Wallet Address:**
   - Your wallet address is shown at the top of MetaMask (starts with `0x`)
   - Copy this address
   - Add to .env:
   ```env
   FROM_ADDRESS=0xYourWalletAddressHere
   ```

### Option 2: Use an Existing Wallet

If you already have a MetaMask wallet:

1. Open MetaMask
2. Click on the three dots (⋮) next to your account
3. Click "Account Details"
4. Click "Show Private Key"
5. Enter your password
6. Copy the private key
7. Add to `.env` file

### Option 3: Generate Using Online Tools (Testing Only!)

**⚠️ WARNING: Only use for testing on testnets! Never use for mainnet!**

1. Visit: https://vanity-eth.tk/ (or similar tool)
2. Generate a new wallet
3. Copy the private key
4. **Never use this wallet for real money!**

## Complete Setup Example

Here's what your `.env` file should look like:

```env
# Blockchain Configuration
RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
PRIVATE_KEY=a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890
FROM_ADDRESS=0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0
CONTRACT_ADDRESS=0xe6b3794191523de54a03a685fdd786b313b1788c
RPC_TIMEOUT=30
CHAIN_ID=11155111
```

## Important Notes

### For Testing (Sepolia Testnet):

1. **Get Test ETH:**
   - You need Sepolia ETH (not real ETH) to pay for gas
   - **Free Faucets (No Requirements):**
     - **Alchemy Sepolia Faucet** (Recommended - No ETH required):
       - https://www.alchemy.com/faucets/ethereum-sepolia
       - Sign up for free Alchemy account (if needed)
       - Enter your wallet address
       - Request 0.5 Sepolia ETH (daily limit)
     
     - **QuickNode Sepolia Faucet** (No ETH required):
       - https://faucet.quicknode.com/ethereum/sepolia
       - Enter your wallet address
       - Request test ETH
     
     - **PoW Faucet** (No ETH required, but requires mining):
       - https://sepolia-faucet.pk910.de/
       - Click "Start Mining" and wait a few minutes
       - Automatically sends test ETH to your wallet
   
   - **Faucets That Require Mainnet ETH (0.001 ETH):**
     - Some faucets require you to have real ETH first
     - If you don't have ETH, use the free options above instead
   
   - **Alternative: Use a Different Testnet**
     - **Goerli Testnet** (if Sepolia doesn't work):
       - Some Goerli faucets don't require mainnet ETH
       - Update your RPC_URL to Goerli endpoint
       - Update CHAIN_ID to 5 in .env

2. **Verify You Have Test ETH:**
   - Check on Sepolia Etherscan: https://sepolia.etherscan.io/
   - Enter your wallet address
   - You should see a balance (e.g., 0.1 Sepolia ETH)

### For Production (Mainnet):

1. **Use a Dedicated Wallet:**
   - Create a separate wallet just for minting
   - Only fund it with enough ETH for gas fees
   - Never use your main wallet's private key

2. **Security Best Practices:**
   - Store private keys securely
   - Use environment variables (never commit to git)
   - Consider using a hardware wallet for large amounts
   - Monitor the wallet balance regularly

## Step-by-Step: Getting Started

1. **Install MetaMask** (if you don't have it)
   - https://metamask.io/

2. **Create a New Wallet in MetaMask**
   - Click account icon → Create Account
   - Name it "Cred-AI Minting"

3. **Get Your Private Key**
   - Click ⋮ → Account Details → Show Private Key
   - Copy it (without 0x prefix)

4. **Get Your Wallet Address**
   - It's shown at the top of MetaMask
   - Copy it (starts with 0x)

5. **Add to .env File**
   ```env
   PRIVATE_KEY=your_private_key_here
   FROM_ADDRESS=0xyour_wallet_address_here
   ```

6. **Get Test ETH** (for Sepolia testnet)
   - Visit a Sepolia faucet
   - Enter your wallet address
   - Request test ETH

7. **Test the Setup**
   - Try minting a credential
   - Check the transaction on Sepolia Etherscan

## Troubleshooting

### "Insufficient funds for gas"
- You need ETH (or Sepolia ETH for testnet) in your wallet
- Get test ETH from a faucet if using testnet

### "Invalid private key"
- Make sure you copied the entire key (64 characters)
- Remove any `0x` prefix
- Don't include spaces or newlines

### "Could not derive address"
- Set `FROM_ADDRESS` in `.env` with your wallet address
- Make sure it matches the private key

## Security Reminders

- ⚠️ **Never share your private key**
- ⚠️ **Never commit `.env` to git**
- ⚠️ **Use testnets for development**
- ⚠️ **Only keep minimal funds in minting wallet**
- ⚠️ **Use a dedicated wallet for the application**

## Need Help?

If you're still having issues:
1. Check that your private key is 64 characters (without 0x)
2. Verify your wallet address matches the private key
3. Make sure you have test ETH (for testnet) or real ETH (for mainnet)
4. Check the Laravel logs for detailed error messages

