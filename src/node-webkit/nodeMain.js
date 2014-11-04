'use strict';
// Catch all global exceptions for now by this listener
// ATTENTION: this won't be the way to go with productive apps!

var fs = require('fs');

// https://coderwall.com/p/bnyhbg/get-home-directory-in-nodejs
var homeDir = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
var logFile = 'cryptocat-node-webkit-errors.log';

// https://github.com/rogerwang/node-webkit/issues/1699
process.on('uncaughtException', function(e) {
  var logData = new Date() + ' - error: ' + e.stack + '\n';

  console.error(e);

  // write error to log file in homeDirectory
  fs.appendFile(homeDir + '/' + logFile, logData, function(err) {
    if (err) {
      console.error('Cannot write exception to log file' + err);
    }
  });

});