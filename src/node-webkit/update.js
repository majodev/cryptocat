// Based on https://github.com/edjafarov/node-webkit-updater/blob/master/examples/basic.js

/*

 1. Check the manifest for version (from your running "old" app).
 2. If the version is different from the running one, download new package to a temp directory.
 3. Unpack the package in temp.
 4. Run new app from temp and kill the old one (i.e. still all from the running app).
 5. The new app (in temp) will copy itself to the original folder, overwriting the old app.
 6. The new app will run itself from original folder and exit the process.

*/

'use strict';
(function() {

	var gui = require('nw.gui')
	var pkg = require('./package.json') // Insert your app's manifest here
	var Updater = require('node-webkit-updater')
	var upd = new Updater(pkg)
	var copyPath, execPath

	// force show devtools
	gui.Window.get().showDevTools()
	gui.Window.get().focus()


	function setUIStatus(text) {
		$('#updateStatus').text(text)
	}

	function loadMainApplication() {
		setTimeout(function() {
			window.location.href = 'index.html'
		}, 1500)
	}

	// Args passed when new app is launched from temp dir during update
	if (gui.App.argv.length) {
		// ------------- Step 5 -------------
		setUIStatus('Launching new version from tmp')
		copyPath = gui.App.argv[0]
		execPath = gui.App.argv[1]

		// Replace old app, Run updated app from original location and close temp instance
		upd.install(copyPath, function(error) {

			if (error) {
				setUIStatus('error: ' + error)
				return
			}

			// ------------- Step 6 -------------
			setUIStatus('Successfully replaced old version!')
			upd.run(execPath, null)
			gui.App.quit()

		})
	} else { // if no arguments were passed to the app

		// supply user with info of the current version
		$('#localVersion').text(pkg.version)
		$('#manifestUrl').text(pkg.manifestUrl)

		// ------------- Step 1 -------------
		setUIStatus('Checking for newer version...')
		upd.checkNewVersion(function(error, newVersionExists, manifest) {

			if (error) {
				setUIStatus('error: ' + error)
				return
			}

			// supply user with info of the remote version
			$('#remoteVersion').text(manifest.version)

			if (!newVersionExists) {
				// running the most up to date version of cryptocat
				setUIStatus('Update procedure FINISHED, launching...')
				loadMainApplication();
				return
			}

			// ------------- Step 2 -------------
			setUIStatus('Cryptocat ' + manifest.version + ' is available!')

			if (window.confirm('Cryptocat ' + manifest.version + ' is available!\nDo you want to update now?') !== true) {
				// user decided to update later!
				// run the older version even tough a newer version was found
				setUIStatus('Update procedure ABORTED, launching...')
				loadMainApplication();
				return
			}

			setUIStatus('Downloading Cryptocat ' + manifest.version + '...')
			upd.download(function(error, filename) {

				if (error) {
					setUIStatus('error: ' + error)
					return
				}

				// ------------- Step 3 -------------
				setUIStatus('Unpacking Cryptocat ' + manifest.version + '...')
				upd.unpack(filename, function(error, newAppPath) {

					if (error) {
						setUIStatus('error: ' + error)
						return
					}

					// ------------- Step 4 -------------
					setUIStatus('Running installer...')
					upd.runInstaller(newAppPath, [upd.getAppPath(), upd.getAppExec()], {})
					gui.App.quit()

				}, manifest)

			}, manifest)

		})
	}

}())