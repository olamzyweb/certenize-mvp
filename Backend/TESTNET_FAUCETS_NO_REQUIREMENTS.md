# Testnet Faucets - No Requirements Needed

## Problem
Some faucets require you to have at least 0.001 ETH on mainnet before giving you testnet ETH. If you don't have real ETH, here are alternatives:

## ✅ Free Faucets (No Mainnet ETH Required)

### 1. Alchemy Sepolia Faucet (Recommended)
**URL:** https://www.alchemy.com/faucets/ethereum-sepolia

**Steps:**
1. Visit the URL above
2. If prompted, sign up for a free Alchemy account (takes 2 minutes)
3. Enter your wallet address (FROM_ADDRESS from .env)
4. Click "Send Me ETH"
5. You'll receive 0.5 Sepolia ETH (enough for many transactions)
6. **Daily limit:** 0.5 ETH per day per address

**Pros:**
- No mainnet ETH required
- Reliable and fast
- Free Alchemy account gives you RPC access too

### 2. QuickNode Sepolia Faucet
**URL:** https://faucet.quicknode.com/ethereum/sepolia

**Steps:**
1. Visit the URL
2. Enter your wallet address
3. Complete a simple captcha
4. Click "Send Me ETH"
5. You'll receive test ETH

**Pros:**
- No mainnet ETH required
- Simple process
- No account needed

### 3. PoW Faucet (Mining-Based)
**URL:** https://sepolia-faucet.pk910.de/

**Steps:**
1. Visit the URL
2. Enter your wallet address
3. Click "Start Mining"
4. Leave the tab open for 5-10 minutes
5. Test ETH will be sent automatically when you've "mined" enough

**Pros:**
- No mainnet ETH required
- No account needed
- Works automatically

**Cons:**
- Takes a few minutes (you're "mining" in your browser)

### 4. Chainlink Sepolia Faucet
**URL:** https://faucets.chain.link/sepolia

**Steps:**
1. Visit the URL
2. Connect your wallet (MetaMask)
3. Request test ETH
4. You'll receive 0.1 Sepolia ETH

**Pros:**
- No mainnet ETH required
- Official Chainlink faucet
- Reliable

## 🔄 Alternative: Use Goerli Testnet

If Sepolia faucets aren't working, you can switch to Goerli testnet:

### Update Your .env:

```env
# Change RPC_URL to Goerli
RPC_URL=https://goerli.infura.io/v3/YOUR_PROJECT_ID
# Or use Alchemy Goerli
RPC_URL=https://eth-goerli.g.alchemy.com/v2/YOUR_API_KEY

# Update Chain ID
CHAIN_ID=5
```

### Goerli Faucets (No Requirements):

1. **Alchemy Goerli Faucet:**
   - https://www.alchemy.com/faucets/ethereum-goerli
   - Same process as Sepolia

2. **Goerli PoW Faucet:**
   - https://goerli-faucet.pk910.de/
   - Mining-based, no requirements

## 📝 Step-by-Step: Get Test ETH (Easiest Method)

1. **Go to Alchemy Faucet:**
   - Visit: https://www.alchemy.com/faucets/ethereum-sepolia

2. **Sign Up (if needed):**
   - Click "Sign Up" or "Log In"
   - Use Google/GitHub to sign in quickly
   - Takes 1-2 minutes

3. **Enter Your Wallet Address:**
   - Copy your wallet address from MetaMask (or FROM_ADDRESS from .env)
   - Paste it into the faucet
   - Make sure it starts with `0x`

4. **Request Test ETH:**
   - Click "Send Me ETH" or similar button
   - Wait 30-60 seconds

5. **Verify:**
   - Check your MetaMask balance
   - Or check on Sepolia Etherscan: https://sepolia.etherscan.io/
   - Enter your wallet address

6. **You're Done!**
   - You should now have 0.5 Sepolia ETH
   - This is enough for many minting transactions

## 💡 Tips

- **If one faucet doesn't work, try another**
- **Alchemy faucet is usually the most reliable**
- **You can request from multiple faucets** (if you need more)
- **0.5 ETH is usually enough for testing** (each transaction costs ~0.0001-0.001 ETH in gas)

## ❌ Faucets That Require Mainnet ETH

These faucets require 0.001 ETH on mainnet:
- Some Infura faucets
- Some community faucets

**Solution:** Use the free options above instead!

## 🆘 Still Having Issues?

1. **Try a different faucet** from the list above
2. **Switch to Goerli testnet** (update .env)
3. **Wait 24 hours** and try again (some have daily limits)
4. **Check your wallet address** is correct (starts with 0x, 42 characters)
5. **Make sure you're on Sepolia network** in MetaMask

## 📊 How Much Test ETH Do You Need?

- **Each mint transaction:** ~0.0001 - 0.001 ETH in gas
- **0.5 ETH from Alchemy:** Enough for 500-5000 transactions
- **You only need a small amount** to get started

