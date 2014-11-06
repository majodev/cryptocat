// This is script is injected by node-webkit after document object is loaded, before onload event is fired
// see "inject-js-end" flag in package.json
// For more information see https://github.com/rogerwang/node-webkit/wiki/Manifest-format#inject-js-start--inject-js-end

'use strict';


// We dont' want to pullute the global namescape (it's a security software!), all is encapsulated.
(function() {

	// requires
	var gui = require('nw.gui')
	var pkg = require('./package.json')
	var updater = require('./lib/updater')

	// private vars
	var coreWindow = gui.Window.get()
	var oldStatusText
	var $status;


	// private function to show confirmation and start DOWNLOAD
	// if declined, binding to status with click to download later.
	function askConfirmToDownload() {
		var confirmerValue = window.confirm('Do you want to download it now?',
			'Cryptocat ' + updater.getSavedRemoteVersion() + ' is available')

		if (confirmerValue === true) {
			unBindReask()
			updater.downloadUpdate() // triggers file download!
		} else {
			bindReask(askConfirmToDownload, 'Click here to download Cryptocat '
				+ updater.getSavedRemoteVersion() + '!')
		}
	}

	// private function to show confirmation and start INSTALLATION
	// if declined, binding to status with click to install later.
	function askConfirmToInstall() {
		var confirmerValue = window.confirm('Do you want to install it now?',
			'Cryptocat ' + updater.getSavedRemoteVersion() + ' has been downloaded')

		if (confirmerValue === true) {
			unBindReask()
			updater.installUpdate() // triggers install!
		} else {
			bindReask(askConfirmToInstall, 'Click here to install Cryptocat '
				+ updater.getSavedRemoteVersion() + '!')
		}
	}

	// binds $status to click and reask confirmation dialog
	function bindReask(targetFunc, statusText) {
		$status.text(statusText)
		$status.on('click', function() {
			$status.off() // dismiss eventhandler of versionField.
			$status.css('cursor', 'pointer');
			targetFunc() // reask
		})
	}

	// unbinds $status
	function unBindReask() {
		$status.off()
		$status.css('cursor', 'inherit');
	}

	// ---------------------------------------------------------------------------
	// All events to listen on from lib/updater.js
	// Here we bind the events to the cryptocat UI!
	// ---------------------------------------------------------------------------

	updater.on('error', function(e) {
		process.mainModule.exports.writeErrorToLog(e)
	})

	updater.on('checkingForUpdate', function() {
		console.log('checkingForUpdate')
		$status.text('Checking for updates...')
	})

	updater.on('noUpdateAvailable', function(options) {
		console.log('noUpdateAvailable')
		$status.text('Your Cryptocat ' + options.remoteVersion + ' is the latest version')

		setTimeout(function() {
			// restore old text in version field after a while.
			$status.text(oldStatusText)
		}, 1500)
	})

	updater.on('updateAvailable', function(options) {
		console.log('updateAvailable')
		$status.text('Cryptocat ' + options.remoteVersion + ' is available!')

		askConfirmToDownload()
	})

	updater.on('downloadedUpdate', function(options) {
		console.log('downloadedUpdate')
		$status.text('Cryptocat ' + options.remoteVersion + ' was downloaded!')

		askConfirmToInstall()
	})

	updater.on('downloadProgress', function(options) {
		console.log('downloadProgress')
		$status.text('Downloading Cryptocat ' + options.remoteVersion + ' (' + options.percentage + '%' + ')')
	})

	updater.on('unpackingFinished', function(options) {
		$status.text('Cryptocat ' + options.remoteVersion + ' is installing...')
	})

	updater.on('installingUpdate', function() {
		$status.text('Cryptocat is installing...')
		console.log('installingUpdate')
	})

	updater.on('preInstallationFinished', function() {
		$status.text('Update finished, restarting...')
		console.log('preInstallationFinished')

		gui.App.quit() // exit the app (a newer instance restarts from tmp)
	})

	updater.on('updateFinished', function(options) {
		console.log('updateFinished')

		options.execute(gui) // open new app and exit old from tmp!
	})

	// ---------------------------------------------------------------------------
	// Startup
	// ---------------------------------------------------------------------------

	// wait for jquery to ready then startup!
	$(function() {

		// append app version to window title
		coreWindow.title = coreWindow.title + ' ' + pkg.version

		// we will write every information directly to the #version field in the crypto ui
		oldStatusText = $('#version').text()
		$status = $('#version')

		if (gui.App.argv.length) {
			// arguments to start app have been provided
			// this is the postinstall procedure, DON'T SHOW THE APP!
			console.log('postinstall procedure, not showing application.')
		} else {
			// app is hidden during startup, show it the first time...
			coreWindow.show()
		}

		// useful while developing: show dev tools...
		// coreWindow.showDevTools()
		// coreWindow.focus()

		// init updater and start auto-update process!
		updater.init(gui.App.argv)
	});

}())