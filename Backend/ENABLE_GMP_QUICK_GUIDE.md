# Quick Guide: Enable GMP Extension

## The Error
```
Call to undefined function Mdanter\Ecc\Curves\gmp_init()
```

This means the PHP GMP (GNU Multiple Precision) extension is not enabled. It's required for the cryptographic libraries that sign Ethereum transactions.

## Solution: Enable GMP Extension

### For XAMPP on Windows:

1. **Open PHP Configuration File:**
   - Navigate to: `C:\xampp\php\php.ini`
   - Open it in a text editor (Notepad, VS Code, etc.)

2. **Find the GMP Extension Line:**
   - Press `Ctrl+F` to search
   - Search for: `extension=gmp`
   - You'll find a line that looks like:
     ```ini
     ;extension=gmp
     ```
   - Notice the `;` at the beginning - this means it's commented out (disabled)

3. **Enable the Extension:**
   - Remove the `;` at the beginning of the line
   - Change from:
     ```ini
     ;extension=gmp
     ```
   - To:
     ```ini
     extension=gmp
     ```

4. **Save the File:**
   - Save `php.ini`
   - Make sure you have administrator privileges if needed

5. **Restart XAMPP:**
   - Stop Apache in XAMPP Control Panel
   - Start Apache again
   - Or restart the entire XAMPP service

6. **Verify GMP is Enabled:**
   - Open a terminal/command prompt
   - Run: `php -m | findstr gmp`
   - You should see `gmp` in the output
   - Or create a test file with: `<?php var_dump(extension_loaded('gmp')); ?>`
   - It should output `bool(true)`

## Alternative: Check via PHP Info

1. Create a file `info.php` in your `public` folder:
   ```php
   <?php phpinfo(); ?>
   ```

2. Visit: `http://127.0.0.1:8000/info.php` (or your local URL)

3. Search for "gmp" on the page
4. If you see a GMP section, it's enabled
5. If not, follow the steps above

## After Enabling GMP

1. **Install the Libraries** (if not already done):
   ```bash
   composer require kornrunner/keccak kornrunner/secp256k1
   ```

2. **Set FROM_ADDRESS in .env** (recommended):
   ```env
   FROM_ADDRESS=0xYourWalletAddressHere
   ```

3. **Test the Mint Endpoint Again**

## Still Having Issues?

- Make sure you edited the correct `php.ini` file (XAMPP uses `C:\xampp\php\php.ini`)
- Check if there are multiple PHP installations on your system
- Verify Apache is using the correct PHP version
- Check XAMPP error logs if Apache won't start

## Why GMP is Needed

The cryptographic libraries (`kornrunner/secp256k1`) use GMP for:
- Large number arithmetic (required for ECDSA signing)
- Elliptic curve cryptography operations
- Secure transaction signing

Without GMP, these operations cannot be performed, which is why you see the `gmp_init()` error.

