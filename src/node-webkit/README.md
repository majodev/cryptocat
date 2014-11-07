# Cryptocat node-webkit
> Bundle Cryptocat as desktop application for mac, win, linux32 and linux64.
> Desktop apps utilize [node-webkit-updater](https://github.com/edjafarov/node-webkit-updater) to receive automatic updates.

## Status
**WIP, don't use this for anything apart from testing purposes!**  
[Download prebuild 2.2.1-fake apps here](#let-me-test-this-with-some-prebuild-binaries).

####Mac: auto-update working
![Cryptocat mac auto-update gif](http://i.giphy.com/3rgXBFpaJeJrhPltkc.gif)

####Windows: auto-update working
![Cryptocat win auto-update gif](http://i.giphy.com/yoJC2rfqFbOMnvwRpe.gif)

####Linux 32 / Linux 64: untested
Please download the fake version binaries below and provide feedback.

## Roadmap
1. ~~Perform platform builds into `/release` via automated grunt task~~ *done*.
2. ~~Desktop apps can check if they are running the most up-to-date version of Cryptocat~~ *done*.
3. ~~Desktop apps fetch a github-hosted `package.json` file in a [node-webkit-updater](https://github.com/edjafarov/node-webkit-updater)s' compatible manifest format, download the newer version and execute a self-update procedure~~ *done*.
	- ~~Problems with finally restarting after updating in Windows (untested [fix](https://github.com/edjafarov/node-webkit-updater/issues/48) might be the solution to this)~~ *works*.
4. Update app on all platforms **securely**
	- ~~Manifest (`package.json`) is hosted on a SSL enabled server.~~ as hosted currently, is it enough?
	- ~~Force downloading new versions only from trusted SLL connections.~~ as hosted currently, is it enough?
	- SHASUMs?
	- MITM attacks?
	- Fix application freezes on connection problems (e.g. when you don't allow communication with LittleSnitch, might be in the domain of [node-webkit-updater](https://github.com/edjafarov/node-webkit-updater))
5. Fix errors in `cryptocat.js` that may stall the node-webkit engine ([**without** globally catching uncaught exceptions](https://github.com/rogerwang/node-webkit/issues/1699))
	- All errors are currently globally catched and logged to `YOUR_HOMEDIR/cryptocat-node-webkit-errors.log`
	- `TypeError: Cannot read property 'muc' of null at eval (.../js/cryptocat.js:1310:29)`
6. Essential UI improvements
	- ~~Use `.ogg` instead of `.mp3` in node-webkit~~ ([learn why](https://github.com/rogerwang/node-webkit/wiki/Using-MP3-%26-MP4-%28H.264%29-using-the--video--%26--audio--tags.))
	- ~~Should auto-update really be a separate view during startup?~~ Nope, it's directly available in the version footer of Cryptocat.
	- Do we need a tray-icon? (it feels akward that the whole app closes, if one window gets closed)
	- ~~Do we need desktop chat notifications (e.g. via [node-notifier](https://github.com/mikaelbr/node-notifier))?~~ Done (tested win/mac)
7. Installation routines
	- Provide `.dmg` on OS X?
	- Provide installer on Windows (we cannot risk to install Cryptocat into `Program files`, [see why here](https://github.com/edjafarov/node-webkit-updater/issues/58))

## Let me **test** this with some prebuild binaries!
OK, here's are some "v2.2.1-fake"-Cryptocat binaries to test the update procedure:
- [win](https://dl.dropboxusercontent.com/u/2624630/cryptocat_nw_update_test/Cryptocat_win_v2.2.1-fake.zip) (works)
- [mac](https://dl.dropboxusercontent.com/u/2624630/cryptocat_nw_update_test/Cryptocat_mac_v2.2.1-fake.zip) (works)
- [linux32](https://dl.dropboxusercontent.com/u/2624630/cryptocat_nw_update_test/Cryptocat_linux32_v2.2.1-fake.tar.gz) (untested)
- [linux64](https://dl.dropboxusercontent.com/u/2624630/cryptocat_nw_update_test/Cryptocat_linux64_v2.2.1-fake.tar.gz) (untested)

### What have you done with these fake binaries?
The `package.json` file in these binaries has been modified to the version `2.2.1-fake`. When you start one of them, the update procedure in [`lib/updater.js`](lib/updater.js) checks the [`package.json`](package.json) that is hosted on GitHub within this folder. It will determine that your version of Cryptocat is outdated (`2.2.2` is newer), download a newer version (after hitting OK within the confirm-dialog), overwrite your old version and launch the new version.

### It doesn't work!
Well, it's an early prototype (**but it should work, please leave feedback!**)....  
I've only tested the update procedure with mac and windows "fake" versions.

## Thoughts and usage
- Press `Ctrl+Shift+J` (OS X: `CMD+Shift+J`) to open developer tools within running app.
- I ~~don't want to modify~~ **want to minimize modifications to any files outside of the `node-webkit`-folder**, as this should be a target specific contribution.
	- Currently only modified `cryptocat.js` to force usage of `.ogg` within node-webkit and provide a native bridge to desktop-notifications
	- It should be no problem to leave the other files alone, all js injections can be done via node-webkit's [inject-js-start and inject.js-end](https://github.com/rogerwang/node-webkit/wiki/Manifest-format#inject-js-start--inject-js-end), see [mainInjectEnd.js](mainInjectEnd.js) and [mainInjectStart.js](mainInjectStart.js)
- The local `package.json` within this folder **gets automatically updated** (with values from the root `package.json`) via the local grunt task, in order to make releases as easy as possible
	- ~~Is it a better idea to provide a separate `update-manifest.json` file and don't use update-logic with the local `package.json` (+ don't update it automatically based on the root `package.json` file)?~~ Nope, doubles the work.~~
- **Make deploys easy**
	- Use some grunt magic (see [Gruntfile.js](Gruntfile.js))!
	- Constant remote path where the most up-to-date versions of Cryptocat will live, the urls to the newer versions in the remote `package.json` need to be automatically updated in the local `package.json` (se `REMOTE_UPDATE_DIR` in the [Gruntfile.js](Gruntfile.js))
	- Version prefixes will be automatically added to the zipped release file for each platform e.g. `Cryptocat_linux32_v2.2.2.tar.gz` (quite limited yet, I feel the Crytocat team definitely wants to use GitHub releases (I still need to add version folder prefixes))

## Bugs
- *fatal error*: `TypeError: Cannot read property 'muc' of null at eval (.../js/cryptocat.js:1310:29)` ~~can freeze app~~ logs error (to reproduce: 1. join any room, 2. send some messages, 3. leave, 4. error)
- ~~Copy/Paste does not work ([possible fix](https://github.com/rogerwang/node-webkit/issues/1955))~~ fixed.
- ~~*bug*: No sounds are currently played, mp3 support needs a library shipped with node-webkit, `.ogg` should be preferred~~ fixed by always using `.ogg` when running Cryptocat in node-webkit ([see cryptocat.js line 29](https://github.com/majodev/cryptocat/blob/master/src/core/js/cryptocat.js#L29))
- ~~Windows app needs to be relaunched after update completed~~ fixed.
- ~~Update procedure might download a `.zip` that cannot be unzipped~~ never encountered again...

## How to build:
- Run `make node-webkit` (while your cwd is the project's root folder)
	- This will trigger the `grunt make` task as as defined in the next section
	- Creates a `tmp` folder (@project's root dir) to cache node-webkit's runtime and nw app builds
	- Creates `release` folder (@project's root dir) holds the platform release versions, zipped and ready to be hosted
- To build the windows version on mac/linux use'll need to install [wine](https://www.winehq.org/) (must be available in your `PATH`) to inject the proper `.ico` into the `.exe`! See [this issue](https://github.com/mllrsohn/node-webkit-builder/issues/19).


## Grunt
### `grunt make`
- Uses the minor grunt tasks 1. `grunt build` and 2. `grunt release` (and some folder cleaning before)

#### `grunt build`
1. `update_json`: Update the local `package.json` in this folder with values from the root `package.json`
	- ALSO updates the `packages>url`-fields for (needed in a update manifest) of each platform to e.g. `"url": "https://dl.dropboxusercontent.com/u/2624630/cryptocat_nw_update_test/Cryptocat_mac_v2.2.2.zip"`. Remote folder prefix (in which folder are the release files hosted) must be set via `REMOTE_UPDATE_DIR` constant in the gruntfile 
2. `copy`: Copy core and platform files to `ROOT_PROJECT_FOLDER/tmp/node-webkit-build`

**Intermediate step while developing**: Now you are able to run `nw .` within `ROOT_PROJECT_FOLDER/tmp/node-webkit-build` without packaging the app for each platforms (`nw` must point to a node-webkit install in your `PATH` variable)

#### `grunt release`
1. `readJSON`: read the updated local `package.json` file
2. `nodewebkit`: package all files in `ROOT_PROJECT_FOLDER/tmp/node-webkit-build` with node-webkit for each platform (cached node-webkit runtime in `ROOT_PROJECT_FOLDER/tmp/node-webkit-cache`) to `ROOT_PROJECT_FOLDER/release/`
3. `compress`: compress releases to `zip` or `tar.gz`
4. `clean:releasesNotZipped`: remove non zipped release files 

### `grunt makeFake`
Same as `grunt make` but sets version to `2.2.1-fake`
