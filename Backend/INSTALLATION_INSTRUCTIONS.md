# Installation Instructions for SBT Minting

## Quick Start

The SBT minting functionality requires additional cryptographic libraries to sign transactions locally (required for public RPC providers like Alchemy/Infura).

### Step 1: Enable PHP GMP Extension

The cryptographic libraries require PHP's GMP (GNU Multiple Precision) extension.

**For XAMPP on Windows:**
1. Open `C:\xampp\php\php.ini`
2. Find the line `;extension=gmp` (it should be commented out with `;`)
3. Remove the `;` to uncomment it: `extension=gmp`
4. Save the file
5. Restart Apache/XAMPP

**Verify GMP is enabled:**
```bash
php -m | findstr gmp
```
(Should output "gmp" if enabled)

### Step 2: Install Required Libraries

Run the following command in your project root:

```bash
composer require kornrunner/keccak kornrunner/secp256k1
```

This will install:
- `kornrunner/keccak` - For Keccak-256 hashing (used in Ethereum)
- `kornrunner/secp256k1` - For ECDSA signing (used to sign Ethereum transactions)

**Note:** If installation fails, make sure GMP extension is enabled (see Step 1).

### Step 3: Configure Environment Variables

Make sure your `.env` file has these variables set:

```env
# Required
RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
PRIVATE_KEY=your_private_key_without_0x_prefix

# Highly Recommended (if address derivation fails)
FROM_ADDRESS=0xYourWalletAddressHere

# Optional
CONTRACT_ADDRESS=0xe6b3794191523de54a03a685fdd786b313b1788c
RPC_TIMEOUT=30
CHAIN_ID=11155111
```

### Step 4: Verify Installation

After installing the libraries, the code will:
1. Derive the Ethereum address from your private key automatically
2. Sign transactions locally before sending them
3. Use `eth_sendRawTransaction` instead of `eth_sendTransaction` (which public RPCs don't support)

## What Changed

### Before (Old Approach)
- Used `eth_sendTransaction` which requires the RPC provider to have your private key
- Only worked with local nodes that have unlocked accounts
- Failed with public RPC providers like Alchemy/Infura

### After (New Approach)
- Signs transactions locally using your private key
- Uses `eth_sendRawTransaction` to send signed transactions
- Works with any RPC provider (Alchemy, Infura, QuickNode, etc.)
- More secure (private key never leaves your server)

## Troubleshooting

### Error: "Cryptographic libraries not installed"
**Solution:** 
1. Enable GMP extension in `php.ini` (see Step 1)
2. Run `composer require kornrunner/keccak kornrunner/secp256k1`

### Error: "ext-gmp is missing from your system"
**Solution:** 
1. Open `C:\xampp\php\php.ini`
2. Find and uncomment: `extension=gmp`
3. Restart XAMPP/Apache
4. Run `composer require kornrunner/keccak kornrunner/secp256k1` again

### Error: "Could not derive address from private key"
**Solution:** Set `FROM_ADDRESS` in your `.env` file with the address that matches your private key

### Error: "Unsupported method: eth_sendTransaction"
**Solution:** This should no longer occur. If it does, make sure the libraries are installed and the code is using `eth_sendRawTransaction`

### Linter Warnings About Undefined Types
**Solution:** These warnings will disappear after installing the libraries. They're just IDE warnings because the classes aren't available yet.

## Testing

1. Enable GMP extension in `php.ini`
2. Install the libraries: `composer require kornrunner/keccak kornrunner/secp256k1`
3. Configure your `.env` file
4. Test the mint endpoint: `POST /api/mint-credential`
5. Check the transaction on a blockchain explorer

## Security Notes

- ⚠️ **Never commit your `.env` file to version control**
- ⚠️ **Keep your private key secure**
- ⚠️ **Use testnets for development**
- ⚠️ **Only keep minimal funds in the minting wallet**

## Next Steps

1. Enable GMP extension in `php.ini` (required!)
2. Install the libraries: `composer require kornrunner/keccak kornrunner/secp256k1`
3. Set `FROM_ADDRESS` in `.env` (recommended for reliability)
4. Test the minting functionality
5. Monitor transactions on a blockchain explorer

## Alternative: Use FROM_ADDRESS (Simpler, but less secure)

If you can't install the cryptographic libraries, you can:
1. Set `FROM_ADDRESS` in `.env` with the address that matches your private key
2. The code will skip address derivation and use the provided address
3. However, transaction signing still requires the libraries for `eth_sendRawTransaction`

**Note:** For production, you should install the libraries to enable proper transaction signing.

For more details, see `SBT_MINTING_SETUP.md`

