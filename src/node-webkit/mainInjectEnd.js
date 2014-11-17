// This script is injected by node-webkit after all other scripts
// The injecting JavaScript code is to be executed after the document object is loaded, 
// before onload event is fired.
// see "inject-js-end" flag in package.json
// For more information see https://github.com/rogerwang/node-webkit/wiki/Manifest-format#inject-js-start--inject-js-end

'use strict';

// We dont' want to pullute the global namescape (it's a security software!), all is encapsulated.
(function() {

	// constant, CSS style to append when updates are available
	var STATUS_CSS_STYLE = '<style type="text/css">' +
		' .updateStatusClickable { color: rgba(255, 40, 40, 0.95) !important; font-weight:bold; cursor: pointer}' +
		' .updateStatusClickable:hover { text-decoration: underline; }' +
		'</style>'

	// requires
	var gui = require('nw.gui')
	var pkg = require('./package.json')
	var updater = require('./lib/updater')

	// bridge to directly attach to functions that mainNode.js exports
	var logger = process.mainModule.exports.logger
	var notify = process.mainModule.exports.notify

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
		// if user click the notification it, it will get focused via callback
		if (windowIsFocused === false) {
			notify({
				title: options.title,
				message: options.body,
				callback: focusMainWindow
			})
		}
	}

	// ---------------------------------------------------------------------------
	// desktop window focus listeners and focus function
	// ---------------------------------------------------------------------------

	coreWindow.on('blur', function() {
		windowIsFocused = false
	})

	coreWindow.on('focus', function() {
		windowIsFocused = true
		coreWindow.setAlwaysOnTop(false)

		// if available, focus the message text input
		$('#userInputText').focus()
	})

	function focusMainWindow() {
		console.log('focusMainWindow')
		// hacky solution, bring window to top but reset to false when window gets focused
		coreWindow.setAlwaysOnTop(true)
	}

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
			hideWindow: false
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
	// Listen to lib/updater.js + some convenience methods
	// Here we bind these events to the cryptocat UI!
	// ---------------------------------------------------------------------------

	// make version in footer clickable
	function makeStatusClickable() {
		$status.addClass('updateStatusClickable')
	}

	// undo clickable
	function undoStatusClickable() {
		$status.removeClass('updateStatusClickable')
		$status.off()
	}

	// Tell lib/updater.js to download update + update UI
	function startDownload() {
		focusMainWindow()
		undoStatusClickable()
		updater.downloadUpdate()
		$status.text('Downloading Cryptocat ' + updater.getSavedRemoteVersion() + ' (' + 0 + '%' + ')')
	}

	// Tell lib/updater.js to install update + update UI
	function startInstall() {
		focusMainWindow()
		undoStatusClickable()
		updater.installUpdate()
		$status.text('Unpacking Cryptocat ' + updater.getSavedRemoteVersion() + ' ...')
	}

	// Log errors from updater, add retry callback to desktop notification and version footer
	var errorRetryMethod;
	updater.on('error', function(error) {

		console.error(error.description)
		logger('error: ' + error.description + ' stack: ' + error.stack + '\n')

		$status.text(error.description)

		// remember retry method, bind it to updater to execute in right manner
		errorRetryMethod = error.retryCallback.bind(updater)

		// ask before retrying after error encountered in statusbar
		$status.text(error.description + ' Click to retry!')
		makeStatusClickable()
		$status.click(function() {
			undoStatusClickable()
			errorRetryMethod() // execute remembered retry method.
		})
	})

	// append clickable version footer and callback in desktop notification when update is available.
	// callback => startDownload()
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

	// append clickable version footer and callback in desktop notification on download + verification finished.
	// callback => startInstall()
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

	// quit app on preinstallation finished (after startInstall)
	updater.on('preInstallationFinished', function() {
		console.log('preInstallationFinished')
		$status.text('Update finished, restarting...')

		gui.App.quit() // exit the app (a newer instance restarts from tmp)
	})

	// execute postInstall after update is finished (but app currently running in tmp)
	updater.on('updateFinished', function(options) {
		console.log('updateFinished')

		options.execute(gui) // open new app and exit old from tmp!
	})


	// !!!
	// ALL following listeners only change the status text in the ui
	// !!!

	updater.on('noUpdateAvailable', function(options) {
		console.log('noUpdateAvailable')
		$status.text(options.remoteVersion + ' is the latest version.')

		setTimeout(function() {
			$status.text(oldStatusText) // restore old text in version field after a while.
		}, 2000)
	})

	updater.on('checkingForUpdate', function() {
		console.log('checkingForUpdate')
		$status.text('Checking for updates...')
	})

	updater.on('downloadProgress', function(options) {
		$status.text('Downloading Cryptocat ' + options.remoteVersion + ' (' + options.percentage + '%' + ')')
	})

	updater.on('verifyingSignature', function() {
		console.log('verifyingSignature')
		$status.text('Verifying DSA signature...')
	})

	updater.on('unpackingFinished', function(options) {
		console.log('unpackingFinished')
		$status.text('Cryptocat ' + options.remoteVersion + ' is installing...')
	})

	updater.on('installingUpdate', function() {
		console.log('installingUpdate')
		$status.text('Cryptocat is installing...')
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