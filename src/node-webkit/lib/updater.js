// node module that checks if a newer version of Cryptocat is available

'use strict';

// requires
var EventEmitter = require('events').EventEmitter
var util = require('util')
var NodeWebkitUpdater = require('node-webkit-updater')
var pkg = require('../package.json')

// private vars
var nodeWebkitUpdater = new NodeWebkitUpdater(pkg) // instance of node-webkit-updater
var copyPath, execPath
var initialized = false // flag if updater has already been initialized once
var running = false // flag if updater is currently doing something.
var remoteManifest = false // manifest gets stored here privately if update was found

// -----------------------------------------------------------------------------
// Constructor of Updater
// -----------------------------------------------------------------------------

var Updater = function() {
	this.args = []
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
		// save the manifest
		remoteManifest = manifest

		self.emit('updateAvailable', {
			remoteVersion: manifest.version
		})

		running = false
	})
}

Updater.prototype.downloadUpdate = function() {
	var self = this

	// immediately exit if we are already running
	if (running || remoteManifest === false) {
		return false
	}
	running = true

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
			remoteVersion: remoteManifest.version,
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
				remoteVersion: remoteManifest.version,
				filename: filename
			})

			// running the installer
			nodeWebkitUpdater.runInstaller(newAppPath, [nodeWebkitUpdater.getAppPath(), nodeWebkitUpdater.getAppExec()], {})
			self.emit('preInstallationFinished')

			// done, this application can now be closed.
			running = false


		}, remoteManifest)


	}, remoteManifest)

	// hock to the fileData (the progressing download to emit events on status)
	fileData.on('data', function(chunk) {
		sizeLoaded += chunk.length;

		self.emit('downloadProgress', {
			loaded: sizeLoaded,
			size: fileData['content-length'],
			percentage: Math.floor(sizeLoaded / fileData['content-length'] * 100),
			remoteVersion: remoteManifest.version
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

Updater.prototype.getSavedRemoteVersion = function() {
	if (remoteManifest !== false) {
		return remoteManifest.version
	}
	console.error('Tried to get saved remote version without having updated version available!')
	return false
}

// -----------------------------------------------------------------------------
// Module Export
// -----------------------------------------------------------------------------

var updater = new Updater()
module.exports = updater