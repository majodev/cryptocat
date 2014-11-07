// This script is injected by node-webkit before all other scripts
// The injecting JavaScript code is to be executed after any files from css, 
// but before any other DOM is constructed or any other script is run; 
// see "inject-js-start" flag in package.json
// For more information see https://github.com/rogerwang/node-webkit/wiki/Manifest-format#inject-js-start--inject-js-end

'use strict';

// ---------------------------------------------------------------------------
// Attach GLOBAL Variable to windows (to enable cryptocat.js to communicate)
// mainInjectEnd.js will only use this global variable to attach methods to it!
// ---------------------------------------------------------------------------

window.NW_DESKTOP_APP = {}