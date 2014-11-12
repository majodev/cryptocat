## Secure updates via DSA

#### Important
Normally you would **NOT** include a private dsa key within a public repository. This `dsa_priv.pem` is only provided for demonstrative purposes! If you want to use this in a **productive manner**, add `dsa_priv.pem` to `.gitignore` after generating your own key pairs via `generate_keys.sh`!!!

#### Information
* `generate_keys.sh` and `sign_update.sh` were borrowed from the [Sparkle Framework](https://github.com/sparkle-project/Sparkle/wiki/publishing-an-update).
* Use `generate_keys.sh` to generate your private and public key files.
* `sign_update.sh` is automatically executed during the `release` grunt task to append a signature to the `package.json`.
* Verification takes place through `lib/verifySignature.js`, after an update has been downloaded. 
* `dsa_pub.pem` (the public key) is automatically included into very release of Cryptocat.