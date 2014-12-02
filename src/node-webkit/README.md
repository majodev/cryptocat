# Cryptocat node-webkit
> Bundle Cryptocat as desktop application for mac, win, linux32 and linux64.
> Desktop apps utilize [node-webkit-updater](https://github.com/edjafarov/node-webkit-updater) to receive automatic updates.

## Status
**Pull request submitted. Trying to merge into master...**  
[Download prebuild 2.2.1-fake apps here](#let-me-test-this-with-some-prebuild-binaries) to test the auto-update procedure.

## Contribution keypoints
- **Auto-update procedure**
	- Auto-update is directly available in the version footer of Cryptocat.
	- Fetch a github-hosted remote `package.json` file in a [node-webkit-updater](https://github.com/edjafarov/node-webkit-updater)s' compatible manifest format, download the newer version and execute a self-update procedure.
- **Secure updates**
	- Manifest (`package.json`) + releases must be hosted on a SSL enabled server. We will use a raw GitHub urls linking to the local `package.json` and GitHub releases. Both over SSL/https! **Attention:** This connection does not ship [Extended Validation Certifactes](http://en.wikipedia.org/wiki/Extended_Validation_Certificate).
	- **ENFORCE SECURITY: DSA signing for updates is required!** See [this discussion here](https://github.com/edjafarov/node-webkit-updater/issues/56) then hop into the [dsa folder](dsa/) for further information. Verification is done via [`lib/verifySignature.js`](lib/verifySignature.js)
- **Native** desktop notifications (e.g. via [node-notifier](https://github.com/mikaelbr/node-notifier)) (tested win/mac)
- **Minimize modifications** to any files outside of the `node-webkit`-folder, as this should be a target specific contribution.
	- Modified `core/js/cryptocat.js` to force usage of `.ogg` within node-webkit and provide a native bridge to desktop-notifications
	- Modified `core/js/etc/facebook.js` to allow authentication through external browser window
	- Most js injections can be done via node-webkit's [inject-js-start and inject.js-end](https://github.com/rogerwang/node-webkit/wiki/Manifest-format#inject-js-start--inject-js-end), see [mainInjectEnd.js](mainInjectEnd.js) and [mainInjectStart.js](mainInjectStart.js)
- **Make deploys as easy as possible**
	- Use some grunt magic (see [Gruntfile.js](Gruntfile.js))!
	- The local [`package.json`](package.json) within this folder:
		- gets automatically updated (with values from the project's root `package.json`)
		- Provides an update manifest for new versions of Cryptocat.
		- Set a constant remote path where the most up-to-date versions of Cryptocat will live
		- The urls to newer Cryptocat version (the "update manifest") gets automatically inserted into the `package.json` (see `REMOTE_UPDATE_DIR` in the [Gruntfile.js](Gruntfile.js))
	- Version prefixes will be automatically added to the zipped release file for each platform e.g. `Cryptocat_linux32_v2.2.2.tar.gz` (quite limited yet, I feel the Crytocat team definitely wants to use GitHub releases (I still need to add version folder prefixes))
	- Signing the updates takes place automatically and signature are appended to `package.json`'s update manifest data. For more information [see `dsa/README.md`](dsa/README.md)
- Press `Ctrl+Shift+J` (OS X: `CMD+Shift+J`) to open developer tools within running app.

## Let me **test** this with some prebuild binaries!
OK, here's are some "v2.2.1-fake"-Cryptocat binaries to test the update procedure:
- [win](https://dl.dropboxusercontent.com/u/2624630/cryptocat_nw_update_test/Cryptocat_win_v2.2.1-fake.zip) (Windows 8.1 tested)
- [mac](https://dl.dropboxusercontent.com/u/2624630/cryptocat_nw_update_test/Cryptocat_mac_v2.2.1-fake.zip) (OS X 10.10 tested)
- [linux32](https://dl.dropboxusercontent.com/u/2624630/cryptocat_nw_update_test/Cryptocat_linux32_v2.2.1-fake.tar.gz) (Elementary OS tested)
- [linux64](https://dl.dropboxusercontent.com/u/2624630/cryptocat_nw_update_test/Cryptocat_linux64_v2.2.1-fake.tar.gz) (Arch Linux tested)

####Mac (working): 
![Cryptocat mac auto-update gif](http://i.giphy.com/3rgXBFpaJeJrhPltkc.gif)

####Windows (working): 
![Cryptocat win auto-update gif](http://i.giphy.com/yoJC2rfqFbOMnvwRpe.gif)

####Linux32 (working) / Linux64 (working): 
Works and looks the same as above!  
**Important:** You need to have `GLIBCXX_3.4.18` installed ([hard dependency of node-webkit](https://github.com/rogerwang/node-webkit/issues/1839)). If you are on a older Ubuntu or Elementary, use [this guide](http://ubuntuhandbook.org/index.php/2013/08/install-gcc-4-8-via-ppa-in-ubuntu-12-04-13-04/) to upgrade to GCC 4.8.

### What have you done with these fake binaries?
The `package.json` file in these binaries has been modified to the version `2.2.1-fake`. When you start one of them, the update procedure in [`lib/updater.js`](lib/updater.js) checks the [`package.json`](package.json) that is hosted on GitHub within this folder. It will determine that your version of Cryptocat is outdated (`2.2.2` is newer), download a newer version (after hitting OK within the confirm-dialog), overwrite your old version and launch the new version.

### It doesn't work!
Well, it's an early prototype (**but it should work, please leave feedback!**)....  
I've only tested the update procedure with mac and windows "fake" versions.

## Building Cryptocat node-webkit binaries
Run **`make node-webkit`** while **your cwd is the project's root folder**. This will trigger: 
1. `npm install -d` within `src/node-webkit/` to install all development dependencies
2. the `grunt make` task as defined in the next section

**Important:** To bundle the windows version on mac/linux use'll need to install [wine](https://www.winehq.org/) (must be available in your `PATH`) to inject the proper `.ico` into the `.exe`! See [this issue](https://github.com/mllrsohn/node-webkit-builder/issues/19).

### Created Folders
- `tmp` folder (@project's root dir) to cache node-webkit's runtime and nw app builds
- `release` folder (@project's root dir) holds the platform release versions, zipped and ready to be hosted

### Grunt tasks
This section explains `grunt make` process, which can be triggered by `make node-webkit` at the project's root directory.

### Main task: `grunt make`
Runs `grunt build`, then `grunt release` in sequence.

#### Minor task: `grunt build`
1. `update_json`: Update the local `package.json` in this folder with values from the root `package.json`
2. `copy`: Copy core and platform files to `ROOT_PROJECT_FOLDER/tmp/node-webkit-build`

#### Heads up! Here's a nice intermediate step while developing!
Now you are able to run `nw .` within `ROOT_PROJECT_FOLDER/tmp/node-webkit-build` without packaging the app for each platforms (`nw` must point to a node-webkit install in your `PATH` variable). If you also want to watch changes while developing and retrigger `grunt build` automatically, the `grunt dev` task become handy!

#### Minor task: `grunt release`
1. `nodewebkit`: package all files in `ROOT_PROJECT_FOLDER/tmp/node-webkit-build` with node-webkit for each platform (cached node-webkit runtime in `ROOT_PROJECT_FOLDER/tmp/node-webkit-cache`) to `ROOT_PROJECT_FOLDER/release/`
2. `bundle`: Compresses app to `.zip`
3. `sign`: generate DSA signature
4. `update_json:hosting` : update to a hostable `package.json` that includes all update-manifest information.
5. `clean:releasesNotZipped`: remove non zipped release files
6. `wait:pause`: Wait some ms so followup mochaTest does not explode... 
7. `mochaTest:dsaSignaturesTest`: Test signature verification: generated DSA keys are validated against `.zips` and public key in `dsa`. Further information, see [Test signature verification before hosting](#test-signature-verification-before-hosting).

### Main task: `grunt makeFake`
Same as `grunt make` but sets version to `2.2.1-fake` to generate binaries for auto-update-testing.

### Test signature verification before hosting
After `make node-webkit` OR `grunt make` OR `grunt makeFake` you can test all appended DSA signatures (inside the local hostable `package.json`) against your public key (in `dsa/`) and the bundled files in `PROJECT_ROOT/release/` by running `mocha` (if globally installed) or `npm test` (cwd is THIS dir). This is the same step, that is automatically executed as the last step in `grunt release`.

Sample Output:
```bash
node-webkit $ mocha
	verifySignature
		✓ validates mac DSA: MCwCFAxCn0ZnnIzxdG+yMsN8bVd7OA4zAhRxWrjr3UePSW8E63I3nJ3qoh4Qow== (296ms)
		✓ validates win DSA: MCwCFGPpA3WbfGGKsgeJfs74CZxHS14/AhRaWh2edeMhMNHJ1ibNXJD4rwAf2w== (201ms)
		✓ validates linux32 dsa: MCwCFGUR3nqTYlONQDoiw3y1DJSzy3K3AhRYooSVw4sJ0ByhJUjkEH3wkS95tw== (234ms)
		✓ validates linux64 dsa: MCwCFAZnhwZCMgwyYfEeLh6L3stSk4mGAhQoMdoec4723PHljEJbq4iXbDKY0w== (198ms)
	4 passing (944ms)
```

## Troubleshooting
- `nodewebkit:src` gets stuck while downloading node-webkit binaries: Try to run `grunt nodewebkit` manually a few times until the download finishes and node-webkit bins are extracted into `tmp/cache`.
- Wine sucks or doesn't work: Remove `winIco: DIRS.NWASSETS + 'logo.ico',` from the [`Gruntfile.js`](https://github.com/majodev/cryptocat/blob/master/src/node-webkit/Gruntfile.js#L136), then you don't need to install wine! However, it **won't inject the proper icon into Windows builds then**!
- `./Cryptocat: /usr/lib/i386-linux-gnu/libstdc++.so.6: version GLIBCXX_3.4.18' not found (required by ./Cryptocat)`: `GLIBCXX_3.4.18` is a ([hard dependency of node-webkit](https://github.com/rogerwang/node-webkit/issues/1839)). Fix: Use [this guide](http://ubuntuhandbook.org/index.php/2013/08/install-gcc-4-8-via-ppa-in-ubuntu-12-04-13-04/) to upgrade to GCC 4.8.

## Known Bugs
- **Temporary solution**: All errors are currently globally catched and logged to `YOUR_HOMEDIR/cryptocat-node-webkit-errors.log`
- [--] **Error**: `TypeError: Cannot read property 'muc' of null at eval (.../js/cryptocat.js:1310:29)` **Unsolved, fix needed before global catching can be disabled.**
- [--] **BUG**: `node-webkit Helper` can have a pretty high CPU usage on long usage. Unresolved, Mac only? ([see this issue](https://github.com/LightTable/LightTable/issues/1088))
- [--] **Fixed**: Little Snitch may cause crash on block ([see this issue](https://github.com/rogerwang/node-webkit/issues/2585)) ~~Unsolved FATAL error, app crashes! Revert to a previous version of node-webkit?~~ **[Fixed in node-webkit 0.11.2](https://groups.google.com/forum/#!msg/node-webkit/hpG-AgsATTI/Oc-qhC3rMnkJ)**
