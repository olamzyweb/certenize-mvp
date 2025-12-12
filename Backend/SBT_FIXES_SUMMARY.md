# SBT Minting Fixes - Summary

## What Was Fixed

### 1. **Error Handling**
- Added comprehensive try-catch blocks
- Added validation for environment variables (RPC_URL, PRIVATE_KEY)
- Added validation for wallet address format
- Added proper error logging using Laravel's Log facade
- Added specific error messages for different failure scenarios

### 2. **Web3 Transaction Handling**
- Fixed the `send()` method call signature to match web3p library requirements
- Corrected the parameter order: `send(methodName, ...functionParams, transactionOptions, callback)`
- Added proper gas settings (gas limit and gas price)
- Added transaction options with 'from' address

### 3. **Address Derivation**
- Added `getAddressFromPrivateKey()` method with fallback options
- Supports getting address from RPC provider accounts (if available)
- Falls back to `FROM_ADDRESS` environment variable
- Added helpful error messages if address cannot be derived

### 4. **Network Timeout Handling**
- Fixed cURL timeout issues by configuring custom timeout (default was 1 second, now 30 seconds)
- Added configurable `RPC_TIMEOUT` environment variable
- Improved error messages for network/timeout errors
- Added specific handling for connection exceptions

### 5. **Code Quality**
- Fixed Log facade import (was using `\Log` instead of proper import)
- Added proper type hints and documentation
- Improved code structure and readability
- Added validation for ABI file existence

## What You Need to Do

### Step 1: Configure Environment Variables

Add these to your `.env` file:

```env
# Required
RPC_URL=https://your-rpc-endpoint-url
PRIVATE_KEY=your_private_key_without_0x

# Recommended (if address derivation fails)
FROM_ADDRESS=0xYourWalletAddressHere

# Optional (has default value)
CONTRACT_ADDRESS=0xe6b3794191523de54a03a685fdd786b313b1788c
RPC_TIMEOUT=30
```

See `SBT_MINTING_SETUP.md` for detailed instructions on where to get these credentials.

### Step 2: Choose Your Setup

**Option A: Local Development Node (Recommended for Testing)**
- Use Hardhat, Ganache, or a local Ethereum node
- Unlock an account in your local node
- Set `RPC_URL=http://localhost:8545`
- The code will automatically detect the account

**Option B: Public RPC Provider (Infura, Alchemy, etc.)**
- Sign up for a free account at Infura or Alchemy
- Get your RPC endpoint URL
- Set `FROM_ADDRESS` in `.env` (the address that matches your private key)
- Note: Public RPC providers don't support signing, so you'll need `FROM_ADDRESS`

**Option C: Advanced - Local Transaction Signing**
- Install a cryptographic library: `composer require kornrunner/keccak`
- Modify the code to sign transactions locally before sending
- This is more complex but works with any RPC provider

### Step 3: Test the Setup

1. Ensure your wallet has enough ETH for gas fees
2. Verify your contract is deployed at the correct address
3. Test with a quiz session that has status 'passed'
4. Check Laravel logs if there are any errors: `storage/logs/laravel.log`

## Important Notes

### Transaction Signing Limitation
The web3p library doesn't sign transactions directly. It relies on:
- The RPC provider to sign (if using a local node with unlocked accounts)
- Pre-signed transactions (requires additional cryptographic libraries)

For most use cases, setting `FROM_ADDRESS` in your `.env` file will work if you're using a local development node.

### Security Reminders
- ⚠️ **Never commit private keys to version control**
- ⚠️ **Use testnets for development**
- ⚠️ **Keep minimal funds in the minting wallet**
- ⚠️ **Use environment variables for all sensitive data**

## Files Modified

1. `app/Http/Controllers/CredentialController.php` - Main minting logic with fixes
2. `SBT_MINTING_SETUP.md` - Detailed setup guide
3. `SBT_FIXES_SUMMARY.md` - This file

## Testing Checklist

- [ ] RPC_URL is set and accessible
- [ ] PRIVATE_KEY is set (or FROM_ADDRESS is set)
- [ ] RPC_TIMEOUT is set (default: 30 seconds, increase if experiencing timeouts)
- [ ] Wallet has sufficient balance for gas
- [ ] Contract address is correct
- [ ] ABI file exists at `resources/abi.json`
- [ ] Quiz session exists with status 'passed'
- [ ] Test the mint endpoint: `POST /api/mint-credential`
- [ ] If timeout errors occur, increase RPC_TIMEOUT to 60 or higher

## Next Steps

1. Read `SBT_MINTING_SETUP.md` for credential setup
2. Configure your `.env` file
3. Test the minting functionality
4. Check logs if issues persist
5. Consider installing cryptographic libraries for production use

## Need More Help?

- Check Laravel logs: `storage/logs/laravel.log`
- Verify all environment variables are loaded: `php artisan config:clear && php artisan config:cache`
- Test RPC connection using tinker (see setup guide)

