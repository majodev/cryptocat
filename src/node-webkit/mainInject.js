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

	// constants
	var STATUS_CSS_STYLE = '<style type="text/css">' +
		' .updateStatusClickable { color: rgba(255, 40, 40, 0.95) !important; font-weight:bold; cursor: pointer}' +
		' .updateStatusClickable:hover { text-decoration: underline; }' +
		'</style>'

	// private vars
	var coreWindow = gui.Window.get()
	var oldStatusText
	var $status;

	function makeStatusClickable(enable) {
		if (enable) {
			$status.addClass('updateStatusClickable')
		} else {
			$status.removeClass('updateStatusClickable')
			$status.off()
		}
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

		// ask before downloading!
		$status.text('Cryptocat ' + options.remoteVersion + ' is available. Click to download!')
		makeStatusClickable(true);
		$status.click(function() {
			makeStatusClickable(false);
			updater.downloadUpdate()
			$status.text('Downloading Cryptocat ' + options.remoteVersion + ' (' + 0 + '%' + ')')
		})

	})

	updater.on('downloadedUpdate', function(options) {
		console.log('downloadedUpdate')

		// ask before installing!
		$status.text('Cryptocat ' + options.remoteVersion + ' was downloaded. Click to install!')
		makeStatusClickable(true);
		$status.click(function() {
			makeStatusClickable(false);
			updater.installUpdate()
			$status.off()
		})

	})

	updater.on('downloadProgress', function(options) {
		// console.log('downloadProgress')
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
			// add the status css style
			$(STATUS_CSS_STYLE).appendTo('head')
		}

		// useful while developing: show dev tools...
		coreWindow.showDevTools()
		coreWindow.focus()

		// init updater and start auto-update process!
		updater.init(gui.App.argv)
	});

}())