// This script is run by the node engine (NOT WEBKIT) of node-webkit.
// see "node-main" flag in package.json
// For more information see https://github.com/rogerwang/node-webkit/wiki/Manifest-format#node-main

'use strict';

// constant, name of the log file outputted on errors to fs
var LOG_FILENAME = 'cryptocat-node-webkit-errors.log'

var fs = require('fs')

// get users home directory on all platforms
// https://coderwall.com/p/bnyhbg/get-home-directory-in-nodejs
var homeDir = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE

// write logData to log file in homeDirectory
function logger(logData) {
  var currDate = new Date() + ' - '

	fs.appendFile(homeDir + '/' + LOG_FILENAME, currDate + logData, function(err) {
		if (err) {
			console.error('Cannot write exception to log file' + err)
		}
	})
}

// Catch all global exceptions for now by this listener
// ATTENTION: this won't be the way to go with productive apps!
// https://github.com/rogerwang/node-webkit/issues/1699
process.on('uncaughtException', function(e) {
  var logData = 'error: ' + e.stack + '\n'

  // log error to dev console (if open)
  console.error(e)

  logger(logData)
})


// Module Exports
// export logger to allow logging from client modules
module.exports.logger = logger