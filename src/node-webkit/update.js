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

	// hide buttons in the beginning
	$('.updateButtons').hide()


	function setUIStatus(text) {
		console.log(text);
		$('#updateStatus').text(text)
	}

	function loadMainApplication() {
		setTimeout(function() {
			window.location.href = 'app/index.html'
		}, 1500)
	}

	// Args passed when new app is launched from temp dir during update
	if (gui.App.argv.length) {
		// ------------- Step 5 -------------
		setUIStatus('Launching new version from tmp...')
		copyPath = gui.App.argv[0]
		execPath = gui.App.argv[1]

		// Replace old app, Run updated app from original location and close temp instance
		upd.install(copyPath, function(error) {

			if (error) {
				setUIStatus('error: ' + error)
				return false
			}

			// ------------- Step 6 -------------
			setUIStatus('Successfully replaced old version!')

			if (process.platform === 'win32') {
				// fix restart on windows (https://github.com/cryptocat/cryptocat/issues/566#issuecomment-61947221)
				gui.Shell.openItem(execPath)
			} else {
				upd.run(execPath, null)
			}

			gui.Window.get().hide()

			setTimeout(function() {
				gui.App.quit()
			}, 1000) // wait 1 sec until closing tmp completely

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
				return false
			}

			// supply user with info of the remote version
			$('#remoteVersion').text(manifest.version)

			if (!newVersionExists) {
				// running the most up to date version of cryptocat
				setUIStatus('Update procedure FINISHED, launching...')
				loadMainApplication()
				return false
			}

			// ------------- Step 2 -------------
			setUIStatus('Cryptocat ' + manifest.version + ' is available!')

			$('.updateButtons').show()

			$('#abortUpdate').on('click', function() {
				// user decided to update later!
				// run the older version even tough a newer version was found
				$('.updateButtons').hide()
				setUIStatus('Update procedure ABORTED, launching...')
				loadMainApplication()
				return false
			})

			$('#installUpdate').on('click', function() {
				// user decided to update now!
				$('.updateButtons').hide()
				setUIStatus('Downloading Cryptocat ' + manifest.version + '...')

				var loaded = 0;
				var newVersion = upd.download(function(error, filename) {

					if (error) {
						setUIStatus('error: ' + error)
						return false
					}

					// ------------- Step 3 -------------
					setUIStatus('Unpacking Cryptocat ' + manifest.version + '...')
					upd.unpack(filename, function(error, newAppPath) {

						if (error) {
							setUIStatus('error: ' + error)
							return false
						}

						// ------------- Step 4 -------------
						setUIStatus('Running installer...')
						upd.runInstaller(newAppPath, [upd.getAppPath(), upd.getAppExec()], {})
						gui.App.quit()

					}, manifest)

				}, manifest)

				newVersion.on('data', function(chunk) {
					loaded += chunk.length;
					setUIStatus('Downloading Cryptocat ' + manifest.version + '... (' + Math.floor(loaded / newVersion['content-length'] * 100) + '%)')
				})

			})



		})
	}

}())