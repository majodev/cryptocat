// Gruntfile to build desktop os-platform releases (windows, mac and linux)
// by utilizing node-webkit. These apps come with automated updating logic
// as defined in nw.js.
// 
// This Gruntfile is external as the project's root Gruntfile is no longer 
// maintained! It uses its own grunt and dev-dependencies specified in the local 
// package.json
//
// Run 'make node-webkit' to trigger the default task within this file.

'use strict';

// Shortcut CONSTANT to all used target directories within this grunt file
// cwd is the local folder (src/node-webkit/) of this Gruntfile.
var DIRS = {
	LOCAL: './',
	ROOT: '../../',
	CORE: '../core/',
	NWASSETS: './nwassets/',
	CACHE: '../../tmp/node-webkit-cache/',
	BUILD: '../../tmp/node-webkit-build/',
	RELEASE: '../../release/'
}

module.exports = function(grunt) {
	grunt.initConfig({

		// loads local pkg json within this folder
		pkg: grunt.file.readJSON('package.json'),

		'update_json': {
			options: {
				indent: '\t' // always indent with tabs
			},
			nw: {
				src: DIRS.ROOT + 'package.json',
				dest: DIRS.LOCAL + 'package.json',
				// update local package.json used by node-webkit with data from root package.json
				// specify which fields to update here:
				fields: ['version', 'description', 'keywords', 'author', 'license']
			}
		},

		'copy': {
			core: { // copy core Cryptocat files to temporary build folder
				expand: true,
				cwd: DIRS.CORE,
				src: ['**/*.*', '!**/*.mp3'],
				dest: DIRS.BUILD
			},
			nw: { // copy local nw files to temporary build folder
				expand: true,
				cwd: DIRS.LOCAL,
				// only include the things needed (add all needed node plugins here)
				src: ['*.*', '!Gruntfile.js', '!README.md', 'nwassets/*.*', 'node_modules/node-webkit-updater/**/*.*'],
				dest: DIRS.BUILD
			}
		},

		'clean': {
			options: {
				force: true // force is needed to process files outside of cwd
			},
			'cache': DIRS.CACHE,
			'build': DIRS.BUILD,
			'releases': DIRS.RELEASE,
			'releasesNotZipped': DIRS.RELEASE + 'Cryptocat/'
		},

		'nodewebkit': { // build the apps from temp build folder src
			options: {
				// platforms: ['win', 'osx', 'linux32', 'linux64'],
				platforms: ['osx'],
				buildDir: DIRS.RELEASE,
				cacheDir: DIRS.CACHE,
				macIcns: DIRS.NWASSETS + 'Cryptocat.icns',
				winIco: DIRS.NWASSETS + 'logo.ico',
				version: 'v0.11.0-rc1'
			},
			src: DIRS.BUILD + '**/*.*' // src needs grunt glob pattern 
		},

		'watch': {
			options: {
				spawn: false,
			},
			srcChanges: {
				files: [DIRS.CORE + '**/*.*', DIRS.LOCAL + '**/*.*'],
				tasks: ['buildup']
			}
		},

		// gzip assets 1-to-1 for production
		compress: {
			options: {
				dest: ''
			},
			mac: {
				options: {
					archive: DIRS.RELEASE + 'Cryptocat_mac.zip',
					mode: 'zip'
				},
				files: [{
					expand: true,
					cwd: DIRS.RELEASE + 'Cryptocat/osx/',
					src: ['**']
				}]
			},
			// win: {
			// 	options: {
			// 		archive: DIRS.RELEASE + 'Cryptocat_win.zip',
			// 		mode: 'zip'
			// 	},
			// 	files: [{
			// 		expand: true,
			// 		cwd: DIRS.RELEASE + 'Cryptocat/win/',
			// 		src: ['**']
			// 	}]
			// },
			// linux32: {
			// 	options: {
			// 		archive: DIRS.RELEASE + 'Cryptocat_linux32.tar.gz',
			// 		mode: 'tgz'
			// 	},
			// 	files: [{
			// 		expand: true,
			// 		cwd: DIRS.RELEASE + 'Cryptocat/linux32/',
			// 		src: ['**']
			// 	}]
			// },
			// linux64: {
			// 	options: {
			// 		archive: DIRS.RELEASE + 'Cryptocat_linux64.tar.gz',
			// 		mode: 'tgz'
			// 	},
			// 	files: [{
			// 		expand: true,
			// 		cwd: DIRS.RELEASE + 'Cryptocat/linux64/',
			// 		src: ['**']
			// 	}]
			// }
		}

	})

	// Load locally installed grunt plugins
	grunt.loadNpmTasks('grunt-update-json')
	grunt.loadNpmTasks('grunt-node-webkit-builder')
	grunt.loadNpmTasks('grunt-contrib-copy')
	grunt.loadNpmTasks('grunt-contrib-clean')
	grunt.loadNpmTasks('grunt-contrib-watch')
	grunt.loadNpmTasks('grunt-contrib-compress')

	// This default task performs all needed steps to release apps with nodewebkit
	grunt.registerTask('default', ['clean:build', 'clean:releases', 'buildup', 'nodewebkit', 'compress', 'clean:releasesNotZipped'])

	// tasks that need to be performed before the nodewebkit task 
	// useful to execute only if you are within the DIR.BUILD directory and 
	// using 'nw .' to run a app directly
	// best used with the grunt watch task!
	grunt.registerTask('buildup', ['update_json:nw', 'copy'])
}