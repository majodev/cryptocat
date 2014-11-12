## Secure updates via DSA

**Note:**the official Cryptocat project will **NOT** include the private dsa key used for signing updates. `dsa_priv.pem` here is only provided for demonstrative purposes (so add `dsa_priv.pem` to `.gitignore` after generating your new key pairs via `generate_keys.sh`!)

`generate_keys.sh` and `sign_update.sh` were borrowed from the [Sparke Framework](https://github.com/sparkle-project/Sparkle/wiki/publishing-an-update).

* Use `generate_keys.sh` to generate your private and public key files.
* `sign_update.sh` is automatically executed during the `release` grunt task to append a signature to the `package.json`.
* Verification takes place through `lib/verifySignature.js`, after an update has been downloaded. 
* `dsa_pub.pem` (the public key) is automatically included into very release of Cryptocat.