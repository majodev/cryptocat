# Cryptocat node-webkit
> Bundle Cryptocat as desktop application for mac, win, linux32 and linux64.
> Desktop apps utilize [node-webkit-updater](https://github.com/edjafarov/node-webkit-updater) to receive automatic updates.

##TODO
1. ~~Perform platform builds into `/release` via automated grunt task~~ done.
2. ~~Desktop apps can check if they are running the most up-to-date version of Cryptocat~~ done.
3. ~~Desktop apps fetch a github-hosted `package.json` file in a [node-webkit-updater](https://github.com/edjafarov/node-webkit-updater)s' compatible manifest format, download the newer version and execute a self-update procedure~~ done.
4. Update app on all platforms **securely (SSL + SHASUMs + ???)**
5. Fix errors that would that may stall the desktop app
6. Essential UI improvements at desktop only

## Let me **test** this with some prebuild binaries!
OK, here's are some "fake v2.2.1"-Cryptocat binaries to test the update procedure:
- [win](https://dl.dropboxusercontent.com/u/2624630/cryptocat_nw_update_test/Cryptocat_win_FAKE_v2.2.1.zip)
- [mac](https://dl.dropboxusercontent.com/u/2624630/cryptocat_nw_update_test/Cryptocat_mac_FAKE_v2.2.1.zip)
- [linux32](https://dl.dropboxusercontent.com/u/2624630/cryptocat_nw_update_test/Cryptocat_linux32_FAKE_v2.2.1.tar.gz)
- [linux64](https://dl.dropboxusercontent.com/u/2624630/cryptocat_nw_update_test/Cryptocat_linux64_FAKE_v2.2.1.tar.gz)

### What have you done with these fake binaries?
The `package.json` file in these binaries has been modified to the version `2.2.1`. When you start one of them, the update procedure in [`update.js`](update.js) checks the [`package.json`](package.json) that is hosted on GitHub within this folder. It will determine that your version of Cryptocat is outdated (`2.2.2` is newer), download a newer version (after hitting OK within the confirm-dialog), overwrite your old version and launch the new version.

### It doesn't work!
Well, it's an early prototype....  
I've only tested the update procedure with mac and windows "fake" versions, it may no work in your environment...

##Notes 'n' bugs
- The local package.json within this folder gets automatically updated via the grunt task!
- Build task can be run from project's root via `make node-webkit`.
- To build the windows version on mac/linux use'll need to install [wine](https://www.winehq.org/) (must be available in your `PATH`) to inject the proper `.ico` into the `.exe`!
- grunt task creates `tmp` folder (@project's root dir) to cache node-webkit runtime and nw app builds
- grunt task creates `release` folder (@project's root dir) that will hold the node-webkit release versions
- *bug*: No sounds are currently played, mp3 support needs a library shipped with node-webkit, `.ogg` should be preferred
- *fatal errors*: `TypeError: Cannot read property 'muc' of null at eval (.../js/cryptocat.js:1310:29)` can freeze app (to reproduce: 1. join any room, 2. send some messages, 3. leave, 4. error)

##How to:
- Run `make node-webkit` (while your cwd is the project's root folder)
