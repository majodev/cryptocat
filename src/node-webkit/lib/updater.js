// node module that checks if a newer version of Cryptocat is available

'use strict';

// requires
var EventEmitter = require('events').EventEmitter
var util = require('util')
var NodeWebkitUpdater = require('node-webkit-updater')
var verifySignature = require('./verifySignature')
var pkg = require('../package.json')

// private vars
var nodeWebkitUpdater = new NodeWebkitUpdater(pkg) // instance of node-webkit-updater
var copyPath, execPath // node-webkit-updater vars 
var initialized = false // flag if updater has already been initialized once
var running = false // flag if updater is currently doing something.
var remoteManifest = false // manifest gets stored here privately if update was found
var downloadedFilename = false // filename gets stored here privately if update was downloaded

// borrowed from node-webkit-updater to detect platform (app/updater.js)!
// see https://github.com/edjafarov/node-webkit-updater/blob/master/app/updater.js
var platform = process.platform;
platform = /^win/.test(platform) ? 'win' : /^darwin/.test(platform) ? 'mac' : 'linux' + (process.arch === 'ia32' ? '32' : '64')

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
			self.emit('error', {
				description: 'Error during checkUpdateAvailable (nodeWebkitUpdater.checkNewVersion).',
				stack: error.stack,
				retryCallback: self.checkUpdateAvailable
			})
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
		// save the manifest (prerequisite for download to run)
		remoteManifest = manifest

		self.emit('updateAvailable', {
			remoteVersion: manifest.version
		})

		running = false
	})
}

Updater.prototype.downloadUpdate = function() {
	var self = this

	// immediately exit if we are already running (or privates manifest are not set!)
	if (running || remoteManifest === false) {
		return false
	}
	running = true

	var sizeLoaded = 0
	var fileData = nodeWebkitUpdater.download(function(error, filename) {
		if (error) {
			// e.g. connection error
			self.emit('error', {
				description: 'Error during downloadUpdate (nodeWebkitUpdater.download).',
				stack: error.stack,
				retryCallback: self.downloadUpdate
			})
			running = false
			return false
		}

		// if we are still here, then the file was properly downloaded.
		// let's verify it's dsa signature!
		self.emit('verifyingSignature')
		try {
			if (verifySignature(filename, remoteManifest.packages[platform].dsa) === false) {
				// OMG, this update is not signed properly!
				self.emit('error', {
					description: 'Error: DSA signature is not valid!',
					stack: 'filename: ' + filename + ' - remoteManifest: ' +  remoteManifest,
					retryCallback: self.downloadUpdate
				})
				running = false
				return false

			} else {
				// clear to install!
				// save the filename (prerequisite for unpacking and install to run)
				downloadedFilename = filename

				self.emit('downloadedUpdate', {
					remoteVersion: remoteManifest.version,
					filename: filename
				})

				running = false
			}

		} catch (e) {
			self.emit('error', {
				description: 'Error during verifyingSignature!',
				stack: e.stack,
				retryCallback: self.downloadUpdate
			})
			running = false
			return false
		}

	}, remoteManifest)

	// hock to the fileData (the progressing download to emit events on status)
	fileData.on('data', function(chunk) {
		sizeLoaded += chunk.length

		self.emit('downloadProgress', {
			loaded: sizeLoaded,
			size: fileData['content-length'],
			percentage: Math.floor(sizeLoaded / fileData['content-length'] * 100),
			remoteVersion: remoteManifest.version
		})
	})
}

Updater.prototype.installUpdate = function() {
	var self = this

	// immediately exit if we are already running (or privates manifest and filename are not set!)
	if (running || remoteManifest === false ||  downloadedFilename === false) {
		return false
	}
	running = true

	// let's unpack it...
	nodeWebkitUpdater.unpack(downloadedFilename, function(error, newAppPath) {

		if (error) {
			// error during unpacking the file
			self.emit('error', {
				description: 'Error during installUpdate (nodeWebkitUpdater.unpack).',
				stack: error.stack,
				retryCallback: self.installUpdate
			})
			running = false
			return false
		}

		self.emit('unpackingFinished', {
			remoteVersion: remoteManifest.version,
			filename: downloadedFilename
		})

		// running the installer
		nodeWebkitUpdater.runInstaller(newAppPath, [nodeWebkitUpdater.getAppPath(), nodeWebkitUpdater.getAppExec()], {})
		self.emit('preInstallationFinished')

		// done, this application can now be closed.
		running = false

	}, remoteManifest)
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
			self.emit('error', {
				description: 'Error during finishUpdate (nodeWebkitUpdater.install).',
				stack: error.stack,
				retryCallback: self.installUpdate
			})
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