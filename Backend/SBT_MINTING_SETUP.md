# SBT Minting Setup Guide

## Overview
This guide explains how to configure and fix the Soulbound Token (SBT) minting functionality in your Cred-AI application.

## Required Credentials

You need to set the following environment variables in your `.env` file:

### 1. RPC_URL
**What it is:** The Ethereum RPC endpoint URL for connecting to the blockchain network.

**Where to get it:**
- **For Mainnet (Ethereum):**
  - [Alchemy](https://www.alchemy.com/) - Sign up for free, create an app, get your HTTP URL
  - [Infura](https://www.infura.io/) - Sign up for free, create a project, get your endpoint URL
  - [QuickNode](https://www.quicknode.com/) - Sign up and create an endpoint

- **For Testnets (Sepolia, Goerli, etc.):**
  - Same providers above, but select the testnet when creating your endpoint
  - Example: `https://sepolia.infura.io/v3/YOUR_PROJECT_ID`

- **For Local Development:**
  - If running a local node: `http://localhost:8545`
  - If using Hardhat: `http://localhost:8545`

**Example:**
```env
RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
```

### 2. PRIVATE_KEY
**What it is:** The private key of the wallet that will pay for gas fees and mint the tokens.

**Where to get it:**
- **For Testing:** Create a test wallet using MetaMask or any wallet
  1. Create a new account in MetaMask
  2. Go to Account Details → Show Private Key
  3. Copy the private key (without the `0x` prefix, or the code will handle it)

- **For Production:** 
  - Use a dedicated wallet for your application
  - Store the private key securely (consider using environment variables or a secrets manager)
  - **NEVER commit private keys to version control!**

**Security Warning:** 
- This private key controls the wallet and can spend funds
- Use a wallet with only enough funds for gas fees
- Consider using a hardware wallet or dedicated service account

**Example:**
```env
PRIVATE_KEY=your_private_key_here_without_0x_prefix
```

### 3. FROM_ADDRESS (Optional but Recommended)
**What it is:** The Ethereum address derived from your private key. This is the address that will send the transaction.

**Where to get it:**
- If you have the private key, you can derive the address using:
  - MetaMask: The address shown in your wallet
  - Online tools (for testing only): https://vanity-eth.tk/
  - Or use the private key in MetaMask and copy the address

**Why it's needed:**
- The web3p library needs to know which address is sending the transaction
- If not provided, the code will try to derive it, but this may fail

**Example:**
```env
FROM_ADDRESS=0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0
```

### 4. CONTRACT_ADDRESS (Optional)
**What it is:** The address of your deployed SBT smart contract.

**Default:** `0xe6b3794191523de54a03a685fdd786b313b1788c`

**Where to get it:**
- After deploying your smart contract, you'll receive the contract address
- It's the address where your SBT contract is deployed on the blockchain

**Example:**
```env
CONTRACT_ADDRESS=0xe6b3794191523de54a03a685fdd786b313b1788c
```

### 5. RPC_TIMEOUT (Optional)
**What it is:** The timeout in seconds for RPC requests.

**Default:** `30` seconds

**When to change it:**
- If you're experiencing timeout errors, increase this value
- For slow networks, you might need 60-120 seconds
- For fast local networks, 10-15 seconds might be sufficient

**Example:**
```env
RPC_TIMEOUT=60
```

## Complete .env Configuration Example

```env
# Blockchain Configuration
RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
PRIVATE_KEY=your_private_key_without_0x_prefix
FROM_ADDRESS=0xYourWalletAddressHere
CONTRACT_ADDRESS=0xe6b3794191523de54a03a685fdd786b313b1788c
RPC_TIMEOUT=30

# Other existing variables...
GROQ_API_KEY=your_groq_api_key
```

## Common Issues and Solutions

### Issue 1: "RPC_URL is not configured"
**Solution:** Add `RPC_URL` to your `.env` file with a valid RPC endpoint URL.

### Issue 2: "PRIVATE_KEY is not configured"
**Solution:** Add `PRIVATE_KEY` to your `.env` file with your wallet's private key.

### Issue 3: "Could not derive address from private key"
**Solution:** 
- Add `FROM_ADDRESS` to your `.env` file with the address that matches your private key
- Or install a cryptographic library: `composer require kornrunner/keccak`

### Issue 4: "cURL error 28: Resolving timed out" or Connection Timeout
**What it means:** The connection to your RPC endpoint timed out (default was 1 second, now configurable).

**Possible causes:**
1. **Network connectivity issues:** Slow internet or network problems
2. **Firewall blocking:** Your firewall or network may be blocking the connection
3. **RPC provider issues:** The RPC endpoint might be down or slow
4. **DNS resolution problems:** Unable to resolve the RPC URL domain name
5. **Timeout too short:** The default timeout might be too short for your network

**Solutions:**
1. **Increase the timeout** in your `.env` file:
   ```env
   RPC_TIMEOUT=60
   ```
   (Default is now 30 seconds, but you can increase it if needed)

2. **Check your internet connection:**
   - Test if you can access the RPC URL in a browser
   - Try pinging the domain: `ping eth-sepolia.g.alchemy.com`

3. **Verify your RPC URL:**
   - Make sure the URL is correct
   - Check if your Alchemy/Infura API key is valid
   - Try regenerating your API key

4. **Try a different RPC provider:**
   - Switch from Alchemy to Infura or vice versa
   - Use a public RPC endpoint as a test

5. **Check firewall/proxy settings:**
   - If behind a corporate firewall, you may need to configure proxy settings
   - Check if port 443 (HTTPS) is open

6. **Test the RPC endpoint directly:**
   ```bash
   curl -X POST https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY \
     -H "Content-Type: application/json" \
     -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
   ```

### Issue 5: "Transaction failed" or "No transaction hash returned"
**Possible causes:**
1. **Insufficient gas:** Make sure the wallet has enough ETH to pay for gas
2. **Wrong network:** Ensure your RPC_URL matches the network where your contract is deployed
3. **Invalid contract address:** Verify your CONTRACT_ADDRESS is correct
4. **RPC connection issues:** Check if your RPC endpoint is working

**Solutions:**
- Check your wallet balance on the network
- Verify the contract address is correct
- Test your RPC endpoint connection
- Check the Laravel logs for detailed error messages

### Issue 5: "Invalid wallet address format"
**Solution:** Ensure the wallet address in the quiz session is a valid Ethereum address (42 characters, starts with 0x).

## Testing the Setup

1. **Verify RPC Connection:**
   ```bash
   php artisan tinker
   >>> $web3 = new \Web3\Web3(env('RPC_URL'));
   >>> $web3->eth->blockNumber(function($err, $block) { var_dump($block); });
   ```

2. **Check Wallet Balance:**
   - Use a blockchain explorer (Etherscan for mainnet, Sepolia Etherscan for testnet)
   - Enter your FROM_ADDRESS to check the balance

3. **Test Minting:**
   - Make sure you have a quiz session with status 'passed'
   - Call the `/api/mint-credential` endpoint with a valid `mint_token`

## Security Best Practices

1. **Never commit private keys to version control**
2. **Use environment variables for all sensitive data**
3. **Use testnets for development**
4. **Keep only minimal funds in the minting wallet**
5. **Regularly rotate keys if compromised**
6. **Use a dedicated wallet for the application**
7. **Monitor transactions and wallet balance**

## Additional Resources

- [Alchemy Documentation](https://docs.alchemy.com/)
- [Infura Documentation](https://docs.infura.io/)
- [Ethereum RPC Methods](https://ethereum.org/en/developers/docs/apis/json-rpc/)
- [Web3.php Documentation](https://github.com/web3p/web3.php)

## Need Help?

If you're still experiencing issues:
1. Check the Laravel logs: `storage/logs/laravel.log`
2. Verify all environment variables are set correctly
3. Test your RPC endpoint connection
4. Ensure your wallet has sufficient balance for gas fees

