# Cryptocat node-webkit
> Bundle Cryptocat as desktop application for mac, win, linux32 and linux64.
> Desktop apps utilize [node-webkit-updater](https://github.com/edjafarov/node-webkit-updater) to receive automatic updates.

## Status
**Testing only!**  
[Download prebuild 2.2.1-fake apps here](#let-me-test-this-with-some-prebuild-binaries).

####Mac (working): 
![Cryptocat mac auto-update gif](http://i.giphy.com/3rgXBFpaJeJrhPltkc.gif)

####Windows (working): 
![Cryptocat win auto-update gif](http://i.giphy.com/yoJC2rfqFbOMnvwRpe.gif)

####Linux32 (untested) / Linux64 (working): 
Linux64 build works, **please provide feedback for linux32!**

## Roadmap
* [✓] Perform platform builds into `/release` via automated grunt task.
* [✓] Desktop apps can check if they are running the most up-to-date version of Cryptocat
	* [✓] Fetch a github-hosted remote `package.json` file in a [node-webkit-updater](https://github.com/edjafarov/node-webkit-updater)s' compatible manifest format, download the newer version and execute a self-update procedure.
* [✓] Update app on all platforms **securely**
	- [✓] Manifest (`package.json`) + releases must be hosted on a SSL enabled server. We will use a raw GitHub urls linking to the local `package.json` and GitHub releases. Both over SSL/https! **Attention:** This connection does not ship [Extended Validation Certifactes](http://en.wikipedia.org/wiki/Extended_Validation_Certificate).
	- [✓] **ENFORCE SECURITY: DSA signing for updates is required!** See [this discussion here](https://github.com/edjafarov/node-webkit-updater/issues/56) then hop into the [dsa folder](dsa/) for further information. Verification is done via [`lib/verifySignature.js`](lib/verifySignature.js)
* [✓] Essential UI improvements
	- [✓] Use `.ogg` instead of `.mp3` in node-webkit ([learn why](https://github.com/rogerwang/node-webkit/wiki/Using-MP3-%26-MP4-%28H.264%29-using-the--video--%26--audio--tags.))
	- [✓] Should auto-update is directly available in the version footer of Cryptocat.
	- [✗] **Dismissed**: ~~Do we need a tray-icon?~~ **Platform specific, subjective.**
	- [✓] Desktop chat notifications (e.g. via [node-notifier](https://github.com/mikaelbr/node-notifier)) (tested win/mac)
* [--] Fix errors ([**without** globally catching all uncaught exceptions](https://github.com/rogerwang/node-webkit/issues/1699))
	- [✓] **Bad**: All errors are currently globally catched and logged to `YOUR_HOMEDIR/cryptocat-node-webkit-errors.log` **This is bad and no productive solution!**
	- [--] **Error**: `TypeError: Cannot read property 'muc' of null at eval (.../js/cryptocat.js:1310:29)` **Unsolved, fix needed before global catching can be disabled.**
	- [--] **Fatal**: Little Snitch may cause crash on block ([see this issue](https://github.com/rogerwang/node-webkit/issues/2585)) **Unsolved FATAL error, app crashes! Revert to a previous version of node-webkit?**
	- [--] **BUG**: `node-webkit Helper` can have a pretty high CPU usage on long usage. Unresolved, Mac only? ([see this issue](https://github.com/LightTable/LightTable/issues/1088))
	- [✓] fixed Bug: Copy/Paste does not work ([possible fix](https://github.com/rogerwang/node-webkit/issues/1955))
	- [✓] fixed Bug: No sounds are currently played, mp3 support needs a library shipped with node-webkit, `.ogg` should be preferred. Fixed by always using `.ogg` when running Cryptocat in node-webkit ([see cryptocat.js line 29](https://github.com/majodev/cryptocat/blob/master/src/core/js/cryptocat.js#L29))
	- [✓] fixed Bug: Windows app needs to be relaunched after update completed.
	- [✓] fixed Bug: Update procedure might download a `.zip` that cannot be unzipped.
* [✗] **Dismissed**: ~~Installation routines~~ **No cross-platform automation possible**, won't fix!
	- [✗] **Dismissed**: ~~Provide `.dmg` on OS X?~~ `.zip` is enough. 
	- [✗] **Dismissed**: ~~Provide installer on Windows?~~ `.zip` is enough.

## Let me **test** this with some prebuild binaries!
OK, here's are some "v2.2.1-fake"-Cryptocat binaries to test the update procedure:
- [win](https://dl.dropboxusercontent.com/u/2624630/cryptocat_nw_update_test/Cryptocat_win_v2.2.1-fake.zip) (Windows 8.1 tested)
- [mac](https://dl.dropboxusercontent.com/u/2624630/cryptocat_nw_update_test/Cryptocat_mac_v2.2.1-fake.zip) (OS X 10.10 tested)
- [linux32](https://dl.dropboxusercontent.com/u/2624630/cryptocat_nw_update_test/Cryptocat_linux32_v2.2.1-fake.tar.gz) (untested)
- [linux64](https://dl.dropboxusercontent.com/u/2624630/cryptocat_nw_update_test/Cryptocat_linux64_v2.2.1-fake.tar.gz) (Arch Linux tested)

### What have you done with these fake binaries?
The `package.json` file in these binaries has been modified to the version `2.2.1-fake`. When you start one of them, the update procedure in [`lib/updater.js`](lib/updater.js) checks the [`package.json`](package.json) that is hosted on GitHub within this folder. It will determine that your version of Cryptocat is outdated (`2.2.2` is newer), download a newer version (after hitting OK within the confirm-dialog), overwrite your old version and launch the new version.

### It doesn't work!
Well, it's an early prototype (**but it should work, please leave feedback!**)....  
I've only tested the update procedure with mac and windows "fake" versions.

## Keypoints
- Press `Ctrl+Shift+J` (OS X: `CMD+Shift+J`) to open developer tools within running app.
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

## Building Cryptocat node-webkit binaries
Run **`make node-webkit`** while **your cwd is the project's root folder**. This will trigger: 
1. `npm install -d` within `src/node-webkit/` to install all development dependencies
2. the `grunt make` task as defined in the next section

**Important: ** To bundle the windows version on mac/linux use'll need to install [wine](https://www.winehq.org/) (must be available in your `PATH`) to inject the proper `.ico` into the `.exe`! See [this issue](https://github.com/mllrsohn/node-webkit-builder/issues/19).

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
6. `mochaTest:dsaSignaturesTest`: Test signature verification: generated DSA keys are validated against `.zips` and public key in `dsa`. Further information, see [Test signature verification before hosting](#test-signature-verification-before-hosting).

### Main task: `grunt makeFake`
Same as `grunt make` but sets version to `2.2.1-fake` to generate binaries for auto-update-testing.

### Test signature verification before hosting
After `make node-webkit` OR `grunt make` OR `grunt makeFake` you can test all appended DSA signatures (inside the local hostable `package.json`) against your public key (in `dsa/`) and the bundled files in `PROJECT_ROOT/release/` by running `mocha` (if globally installed) or `npm test` (cwd is THIS dir). This is the same step, that is automatically executed as the last step in `grunt release`.

Sample Output:
```bash
node-webkit $ mocha
	verifySignature
		✓ validates mac DSA: MCwCFE0vrql8LPUQXNfB3OO4JE1ohJ21AhR3yW2uB96jgR16mkEVcaUV3/exlw== (206ms)
		✓ validates win DSA: MCwCFB6mRjSBFUXSeZ6Zwp9OzYEKR9ESAhQYlFKQnCPy55kdBbWgY80utz8asw== (159ms)
		✓ validates linux32 dsa: MC0CFQCVnpAqhW3B429CBAePVqj29/3OSQIUN6ADe3d48dLvbCz8Aneje5JxPu0= (237ms)
		✓ validates linux64 dsa: MC0CFQCaRFRR2PLkIfpjwc2YrOfV/619MgIUDm06HtjM1n2HREDiTx9Ae0bvONc= (188ms)
	4 passing (797ms)
```
