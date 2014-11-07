// This script is injected by node-webkit after all other scripts
// The injecting JavaScript code is to be executed after the document object is loaded, 
// before onload event is fired.
// see "inject-js-end" flag in package.json
// For more information see https://github.com/rogerwang/node-webkit/wiki/Manifest-format#inject-js-start--inject-js-end

'use strict';

// We dont' want to pullute the global namescape (it's a security software!), all is encapsulated.
(function() {

	// requires
	var gui = require('nw.gui')
	var pkg = require('./package.json')
	var updater = require('./lib/updater')

	// bridge to directly attach to functions that mainNode.js exports
	var logger = process.mainModule.exports.logger
	var notify = process.mainModule.exports.notify

	// constants
	var STATUS_CSS_STYLE = '<style type="text/css">' +
		' .updateStatusClickable { color: rgba(255, 40, 40, 0.95) !important; font-weight:bold; cursor: pointer}' +
		' .updateStatusClickable:hover { text-decoration: underline; }' +
		'</style>'

	// private vars
	var coreWindow = gui.Window.get()
	var oldStatusText
	var $status
	var windowIsFocused = false

	// ---------------------------------------------------------------------------
	// Attach to global NW_DESKTOP_APP object: Desktop notifications bridge
	// ---------------------------------------------------------------------------

	// options: {image, title, body, timeout}
	window.NW_DESKTOP_APP.desktopNotification = function desktopNotification(options) {

		// only do desktop notifications if the window is not focused
		if (windowIsFocused === false) {
			notify({
				title: options.title,
				message: options.body
			})
		}
	}

	// ---------------------------------------------------------------------------
	// desktop window focus listeners
	// ---------------------------------------------------------------------------

	coreWindow.on('blur', function() {
		windowIsFocused = false
	})

	coreWindow.on('focus', function() {
		windowIsFocused = true
	})

	// ---------------------------------------------------------------------------
	// Menu and default shortcuts (Cut/Copy/Paste hotkeys on Mac)
	// see https://github.com/rogerwang/node-webkit/wiki/Menu#menucreatemacbuiltinappname
	// ---------------------------------------------------------------------------

	var nativeMenuBar = new gui.Menu({
		type: 'menubar'
	})

	try {
		nativeMenuBar.createMacBuiltin(pkg.name, {
			hideEdit: false,
			hideWindow: true
		})
		coreWindow.menu = nativeMenuBar
	} catch (ex) {
		console.error(ex.message)
	}

	// ---------------------------------------------------------------------------
	// Keyboard shortcuts
	// see https://github.com/rogerwang/node-webkit/wiki/Shortcut
	// ---------------------------------------------------------------------------

	// Create a keyBoardShortcut to show developerTools
	var devToolsShortcut = new gui.Shortcut({
		key: 'Ctrl+Shift+J',
		active: function() {
			console.log('dev tools keyboard shortcut activated!')
			coreWindow.showDevTools()
		},
		failed: function(msg) {
			console.error(msg)
		}
	})

	// Register global desktop shortcut, which can work without focus.
	gui.App.registerGlobalHotKey(devToolsShortcut)


	// ---------------------------------------------------------------------------
	// All events to listen lib/updater.js and some convenience methods
	// Here we bind these events to the cryptocat UI!
	// ---------------------------------------------------------------------------

	function makeStatusClickable() {
		$status.addClass('updateStatusClickable')
	}

	function undoStatusClickable() {
		$status.removeClass('updateStatusClickable')
		$status.off()
	}

	function startDownload() {
		undoStatusClickable()
		updater.downloadUpdate()
		$status.text('Downloading Cryptocat ' + updater.getSavedRemoteVersion() + ' (' + 0 + '%' + ')')
	}

	function startInstall() {
		undoStatusClickable()
		updater.installUpdate()
		$status.text('Unpacking Cryptocat ' + updater.getSavedRemoteVersion() + ' ...')
	}

	updater.on('error', function(error) {

		console.error(error.discription)
		logger('error: ' + error.discription + ' stack: ' + error.stack + '\n')

		$status.text(error.discription)

		// ask before retrying after error encountered
		// $status.text(error.discription + ' Click to retry!')
		// makeStatusClickable()
		// $status.click(function() {
		// 	undoStatusClickable()
		// 	retryCallback()
		// })
	})

	updater.on('checkingForUpdate', function() {
		console.log('checkingForUpdate')
		$status.text('Checking for updates...')
	})

	updater.on('noUpdateAvailable', function(options) {
		console.log('noUpdateAvailable')
		$status.text(options.remoteVersion + ' is the latest version.')

		setTimeout(function() {
			// restore old text in version field after a while.
			$status.text(oldStatusText)
		}, 2000)
	})

	updater.on('updateAvailable', function(options) {
		var showText = 'Cryptocat ' + options.remoteVersion + ' is available. Click to download!'

		console.log('updateAvailable')

		// ask before downloading!
		$status.text(showText)
		makeStatusClickable()
		$status.click(function() {
			startDownload()
		})

		// desktop notification + callback to start downloading update
		notify({
			message: showText,
			callback: startDownload
		})

	})

	updater.on('downloadedUpdate', function(options) {
		var showText = 'Cryptocat ' + options.remoteVersion + ' was downloaded. Click to install!'

		console.log('downloadedUpdate')

		// ask before installing!
		$status.text(showText)
		makeStatusClickable()
		$status.click(function() {
			startInstall()
		})

		// desktop notification + callback to start install update
		notify({
			message: showText,
			callback: startInstall
		})

	})

	updater.on('downloadProgress', function(options) {
		// console.log('downloadProgress')
		$status.text('Downloading Cryptocat ' + options.remoteVersion + ' (' + options.percentage + '%' + ')')
	})

	updater.on('unpackingFinished', function(options) {
		console.log('unpackingFinished')
		$status.text('Cryptocat ' + options.remoteVersion + ' is installing...')
	})

	updater.on('installingUpdate', function() {
		console.log('installingUpdate')
		$status.text('Cryptocat is installing...')
	})

	updater.on('preInstallationFinished', function() {
		console.log('preInstallationFinished')
		$status.text('Update finished, restarting...')

		gui.App.quit() // exit the app (a newer instance restarts from tmp)
	})

	updater.on('updateFinished', function(options) {
		console.log('updateFinished')

		options.execute(gui) // open new app and exit old from tmp!
	})

	// ---------------------------------------------------------------------------
	// Startup Client View
	// ---------------------------------------------------------------------------

	// wait for jquery to ready then startup!
	$(function() {

		// append app version to window title
		coreWindow.title = coreWindow.title + ' ' + pkg.version

		// we will write every information directly to the #version field in the crypto ui
		oldStatusText = $('#version').text() // remember original text
		$status = $('#version')

		// all encountered links that are external must be opened in new browser window (the OS default one)
		// bind to body as this applies also to all links in the future
		$('body').on('click', 'a[target=_blank]', function(event) {
			event.preventDefault()
			gui.Shell.openExternal(this.href)
			return false
		})

		// app is hidden during startup, show it the first time...
		coreWindow.show()
		coreWindow.focus()
		// add the status css style
		$(STATUS_CSS_STYLE).appendTo('head')

		// init updater and start auto-update process!
		updater.init(gui.App.argv)
	})

}())