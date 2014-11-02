### Cryptocat node-webkit target
> Build Cryptocat as desktop application for mac, win, linux32 and linux64.
> Desktop apps utilize [node-webkit-updater](https://github.com/edjafarov/node-webkit-updater) to receive automatic updates

**Important:**
local package.json gets automatically updated via gruntfile!

build task can be run from outer make file via `make node-webkit`, builds win, mac, linux32 / linux64 versions.

to build the windows version on mac/linux use'll need to install wine to use the ressourcehacker (within grunt-node-webkit) to inject the proper .ico into the .exe! See this ticket...