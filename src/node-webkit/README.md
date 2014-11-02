# Cryptocat node-webkit
> Bundle Cryptocat as desktop application for mac, win, linux32 and linux64.
> Desktop apps utilize [node-webkit-updater](https://github.com/edjafarov/node-webkit-updater) to receive automatic updates.

##TODO
1. ~~Perform platform builds into `/release` via automated grunt task~~ (DONE)
2. Desktop apps can check if they are running the most up-to-date version of Cryptocat
3. Desktop apps fetch a github-hosted `package.json` file in a [node-webkit-updater](https://github.com/edjafarov/node-webkit-updater)s' compatible manifest format, download the newer version and execute a self-update procedure
4. Update app on all platforms securely (SSL + SHASUMs + ???)
5. Fix bugs would that may stall the desktop app ()
6. Essential UI improvements for desktop applications 

##Important Notes
- The local package.json within this folder gets automatically updated via the grunt task!
- Build task can be run from project's root via `make node-webkit`.
- To build the windows version on mac/linux use'll need to install [wine](https://www.winehq.org/) (must be available in your `PATH`) to inject the proper `.ico` into the `.exe`!
- grunt task creates `tmp` folder (@project's root dir) to cache node-webkit runtime and nw app builds
- grunt task creates `release` folder (@project's root dir) that will hold the node-webkit release versions

##How to:
- Run `make node-webkit` (while your cwd is the project's root folder)
