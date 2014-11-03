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
