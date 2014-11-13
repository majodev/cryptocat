## Secure updates via DSA

> How Cryptocat desktop updates are signed and secured.

## Important
**This is a unofficial testing repository of Cryptocat!** Normally you would **NOT** include a private dsa key within a public repository. Hence, `dsa_priv.pem` is only provided for demonstrative purposes. 

If you want to release apps for use in a *productive manner*, add `dsa_priv.pem` to `.gitignore` after generating your own key pairs via `generate_keys.sh` and **never ever** release it to the public!

## Why DSA?
SSL and HTTPS is not enough. [Read this discussion](https://github.com/edjafarov/node-webkit-updater/issues/56).

## Usage
* Use `generate_keys.sh` to generate your private and public key files. (`generate_keys.sh` and `sign_update.sh` were borrowed from the [Sparkle Framework](https://github.com/sparkle-project/Sparkle/wiki/publishing-an-update).)
* `sign_update.sh` is automatically executed during the `release` grunt task (helper task `sign`), and utilizes your `dsa_priv.pem` to append DSA signatures and links of zipped releases to the `src/node-webkit/package.json` (your update manifest, which will be hosted directly on Github).
* Verification takes place through `lib/verifySignature.js`, after an update has been downloaded by [node-webkit-updater](https://github.com/edjafarov/node-webkit-updater). 
* `dsa_pub.pem` (the public key) is automatically included into every release of Cryptocat by the parent `Gruntfile.js`.

### How to use this in your own project?
The most comfortable way to compute these DSA signatures **is during a product's build-task** (e.g. after bundling via [node-webkit-builder](https://github.com/mllrsohn/node-webkit-builder) and compressing the new releases via [grunt-contrib-compress](https://github.com/gruntjs/grunt-contrib-compress)) + appending them to `package.json` (or update-manifest) you are about to host publicly. Exactly this flow is automated in this project (within the parent `Gruntfile.js`).

#### Basic usage for other projects
1. Use `generate_keys.sh` from [Sparkle](https://github.com/sparkle-project/Sparkle/wiki/publishing-an-update) to generate your private and public key files
2. Bundle the public key file `dsa_pub.pem` with your applications. 
3. Add a verification step after an update is completely downloaded (like [here](https://github.com/majodev/cryptocat/blob/master/src/node-webkit/lib/updater.js#L147) and [here](https://github.com/majodev/cryptocat/blob/master/src/node-webkit/lib/verifySignature.js)).
4. After packaging: Use `bin/sign_update.sh` (again from [Sparkle](https://github.com/sparkle-project/Sparkle/wiki/publishing-an-update)) to get the DSA signatures of your zipped apps.
5. Host the urls of your zipped updates + its DSA signatures the within your remote `package.json` (e.g. [like here](https://github.com/majodev/cryptocat/blob/master/src/node-webkit/package.json#L35)).


