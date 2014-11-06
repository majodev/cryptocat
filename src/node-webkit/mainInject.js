// This is script is injected by node-webkit after document object is loaded, before onload event is fired
// see "inject-js-end" flag in package.json
// For more information see https://github.com/rogerwang/node-webkit/wiki/Manifest-format#inject-js-start--inject-js-end

'use strict';

(function() {

	// requires
	var gui = require('nw.gui')
	var pkg = require('./package.json')
	var updater = require('./lib/updater')

	// private vars
	var coreWindow = gui.Window.get()
	var $versionField;

	// ---------------------------------------------------------------------------
	// All events to listen on from lib/updater.js
	// Here we bind the events to the cryptocat UI!
	// ---------------------------------------------------------------------------

	updater.on('error', function(e) {
		process.mainModule.exports.writeErrorToLog(e)
	})

	updater.on('checkingForUpdate', function() {
		console.log('checkingForUpdate')
		$versionField.text('Checking for updates...')
	})

	updater.on('noUpdateAvailable', function(options) {
		console.log('noUpdateAvailable')
		$versionField.text('Cryptocat ' + options.remoteVersion + ' is the latest version')
	})

	updater.on('updateAvailable', function(options) {
		console.log('updateAvailable')
		$versionField.text('Cryptocat ' + options.remoteVersion + ' is available!')
	})

	updater.on('downloadedUpdate', function(options) {
		console.log('downloadedUpdate')
		$versionField.text('Cryptocat ' + options.remoteVersion + ' is unpacking...')
	})

	updater.on('downloadProgress', function(options) {
		console.log('downloadProgress')
		$versionField.text('Downloading Cryptocat ' + options.remoteVersion + ' (' + options.percentage + '%' + ')')
	})

	updater.on('unpackingFinished', function(options) {
		$versionField.text('Cryptocat ' + options.remoteVersion + ' is installing...')
	})

	updater.on('preInstallationFinished', function() {
		$versionField.text('Exiting...')
		console.log('preInstallationFinished')
		gui.App.quit()
	})

	updater.on('installingUpdate', function() {
		$versionField.text('Cryptocat is installing...')
		console.log('installingUpdate')
	})

	updater.on('updateFinished', function(options) {
		window.alert('Your application was updated successfuly and now needs to be restarted.')
		options.execute(gui)
	})

	// ---------------------------------------------------------------------------
	// startup
	// ---------------------------------------------------------------------------

	// wait for jquery to ready then startup!
	$(function() {

		// append app version to window title
		coreWindow.title = coreWindow.title + ' ' + pkg.version

		$versionField = $('#version')

		// app is hidden during startup, show it the first time here...
		coreWindow.show()

		// dev: show dev tools
		coreWindow.showDevTools()
		coreWindow.focus()

		// init updater and start auto-update process!
		updater.init(gui.App.argv)
	});

}())