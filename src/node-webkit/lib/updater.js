// node module that checks if a newer version of Cryptocat is available

'use strict';

// requires
var EventEmitter = require('events').EventEmitter
var util = require('util')
var NodeWebkitUpdater = require('node-webkit-updater')
var pkg = require('../package.json') // Insert your app's manifest here

// private vars
var nodeWebkitUpdater = new NodeWebkitUpdater(pkg)
var copyPath, execPath

// flag that shows if updater has already been initialized once
var initialized = false

// flag that shows if updater is currently doing something.
var running = false

// -----------------------------------------------------------------------------
// Constructor of Updater
// -----------------------------------------------------------------------------

var Updater = function() {
	this.args = []
	this.updateAvailable = false
}

util.inherits(Updater, EventEmitter)

// -----------------------------------------------------------------------------
// Private functions (module scoped)
// -----------------------------------------------------------------------------

// func gets passed as callback in last step of finishUpdate
// restarts application (needs gui reference to node-webkit to work)
function executeNewVersionAfterUpdateFinished(gui) {
	if (process.platform === 'win32') {
		// fix restart on windows (https://github.com/cryptocat/cryptocat/issues/566#issuecomment-61947221)
		gui.Shell.openItem(execPath)
		gui.App.quit()
	} else {
		nodeWebkitUpdater.run(execPath, null)
		gui.App.quit()
	}
}


// -----------------------------------------------------------------------------
// Public methods of Updater prototype
// -----------------------------------------------------------------------------

// initializes the updater object
// gui.App.argv (args the app was started with) must be handed over to initialize Updater
Updater.prototype.init = function(args) {

	// immediately exit if we are already initialized
	if (initialized) {
		return false
	}
	initialized = true

	this.args = args || this.args

	if (args.length) {
		this.finishUpdate()
	} else {
		this.checkUpdateAvailable()
	}

}

Updater.prototype.checkUpdateAvailable = function() {
	var self = this

	// immediately exit if we are already running
	if (running) {
		return false
	}
	running = true


	self.emit('checkingForUpdate')
	nodeWebkitUpdater.checkNewVersion(function(error, newVersionExists, manifest) {
		if (error) {
			// e.g. error connecting to the remote .json file
			self.emit('error', 'Error during checkUpdateAvailable (checkNewVersion), error: ' + error.stack)
			running = false
			return false
		}

		if (newVersionExists === false) {
			// we are running the most up to date version of cryptocat
			self.emit('noUpdateAvailable', {
				remoteVersion: manifest.version
			})
			running = false
			return false
		}

		// if we are still here, then there is a newer version available!
		self.emit('updateAvailable', {
			remoteVersion: manifest.version
		})

		var sizeLoaded = 0;
		var fileData = nodeWebkitUpdater.download(function(error, filename) {
			if (error) {
				// e.g. connection error
				self.emit('error', 'Error during checkUpdateAvailable (download), error: ' + error.stack)
				running = false
				return false
			}

			// file was properly downloaded
			self.emit('downloadedUpdate', {
				remoteVersion: manifest.version,
				filename: filename
			})

			// let's unpack it...
			nodeWebkitUpdater.unpack(filename, function(error, newAppPath) {

				if (error) {
					// error during unpacking the file
					self.emit('error', 'Error during checkUpdateAvailable (unpack), error: ' + error.stack)
					running = false
					return false
				}

				self.emit('unpackingFinished', {
					remoteVersion: manifest.version,
					filename: filename
				})

				// running the installer
				nodeWebkitUpdater.runInstaller(newAppPath, [nodeWebkitUpdater.getAppPath(), nodeWebkitUpdater.getAppExec()], {})
				self.emit('preInstallationFinished')
				
				// done, this application can now be closed.
				running = false


			}, manifest)


		}, manifest)

		// hock to the fileData (the progressing download to emit events on status)
		fileData.on('data', function(chunk) {
			sizeLoaded += chunk.length;

			self.emit('downloadProgress', {
				loaded: sizeLoaded,
				size: fileData['content-length'],
				percentage: Math.floor(sizeLoaded / fileData['content-length'] * 100),
				remoteVersion: manifest.version
			})
		})

	})
}

Updater.prototype.finishUpdate = function() {

	var self = this

	// immediately exit if we are already running
	if (running) {
		return false
	}
	running = true

	// The new app (in temp) will copy itself to the original folder, overwriting the old app.
	// Replace old app, Run updated app from original location and close temp instance
	copyPath = self.args[0]
	execPath = self.args[1]

	self.emit('installingUpdate')

	nodeWebkitUpdater.install(copyPath, function(error) {
		if (error) {
			self.emit('error', 'Error during finishUpdate (install), error: ' + error.stack)
		} else {
			// Old version was successfully replaced, application can now be safely restarted.
			// emit and pass callback reference to observer (who has gui object) to execute restart
			self.emit('updateFinished', {
				execute: executeNewVersionAfterUpdateFinished
			})
		}
		running = false
	})
}

// -----------------------------------------------------------------------------
// Module Export
// -----------------------------------------------------------------------------

var updater = new Updater()
module.exports = updater