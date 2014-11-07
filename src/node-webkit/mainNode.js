// This script is run by the node engine (NOT WEBKIT) of node-webkit.
// see "node-main" flag in package.json
// For more information see https://github.com/rogerwang/node-webkit/wiki/Manifest-format#node-main

'use strict';

// requires
var fs = require('fs')
var path = require('path')
var notifier = require('node-notifier');
var pkg = require('./package.json')

// constants
var LOG_FILENAME = 'cryptocat-node-webkit-errors.log' // name of the log file outputted on errors to fs

// private vars
var openNotifyCallback = null // holds reference to callback function on notify click or null
var homeDir = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE // get homedir all platforms


// functions

// write logData to log file in homeDirectory
function logger(logData) {
	var currDate = new Date() + ' - '

	fs.appendFile(path.join(homeDir, LOG_FILENAME), currDate + logData, function(err) {
		if (err) {
			console.error('Cannot write exception to log file' + err)
		}
	})
}

// desktop notifications via node-notifier
// https://www.npmjs.org/package/node-notifier
// Object options { message, title, callback }
function notify(options) {

	if (typeof(options.callback) === 'function') {
		openNotifyCallback = options.callback
	} else {
		openNotifyCallback = null
	}

	notifier.notify({
		title: (options.title === false || options.title.length === 0) ? pkg.name : options.title,
		message: (options.message === false || options.message.length === 0) ? 'no message' : options.message, // empty string fails on mac!
		icon: path.join(__dirname, pkg.window.icon),
		contentImage: path.join(__dirname, pkg.window.icon),
		sound: false, // Only Notification Center or Windows Toasters
		wait: openNotifyCallback === null ? false : true, // wait with callback until user action is taken on notification
		sender: 'com.intel.nw' // mac only, set sender (TODO, change id in plist) https://github.com/alloy/terminal-notifier#options
	}, function(err, response) {
		logger('error: ' + err + ' response: ' + response + '\n')
		// response is response from notification
	})
}



notifier.on('click', function() {
	// Happens if `wait: true` and user clicks notification
	if (typeof(openNotifyCallback) === 'function') {
		openNotifyCallback()
		openNotifyCallback = null
	}
})

notifier.on('timeout', function() {
	// Happens if `wait: true` and notification closes
	openNotifyCallback = null
})

// Catch all global exceptions for now by this listener
// ATTENTION: this won't be the way to go with productive apps!
// https://github.com/rogerwang/node-webkit/issues/1699
process.on('uncaughtException', function(e) {
	var logData = 'error: ' + e.stack + '\n'

	// log error to dev console
	console.error(e)
	logger(logData)
})


// Exports

// export logger to allow logging from client modules
module.exports.logger = logger
module.exports.notify = notify