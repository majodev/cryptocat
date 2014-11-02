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
				// exclude all grunt plugins
				src: ['**/*.*', '!Gruntfile.js', '!README.md', '!node_modules/grunt/**/*.*', 
				'!node_modules/grunt-contrib-copy/**/*.*', '!node_modules/grunt-contrib-clean/**/*.*', 
				'!node_modules/grunt-node-webkit-builder/**/*.*', '!node_modules/grunt-update-json/**/*.*'],
				dest: DIRS.BUILD
			}
		},

		'clean': {
			options: {
				force: true // force is needed to process files outside of cwd
			},
			'cache': DIRS.CACHE,
			'build': DIRS.BUILD
		},

		'nodewebkit': { // build the apps from temp build folder src
			options: {
				platforms: ['win', 'osx', 'linux32', 'linux64'],
				buildDir: DIRS.RELEASE,
				cacheDir: DIRS.CACHE,
				macIcns: DIRS.NWASSETS + 'Cryptocat.icns',
				winIco: DIRS.NWASSETS + 'logo.ico',
				version: 'v0.11.0-rc1'
			},
			src: DIRS.BUILD + '**/*.*' // src needs grunt glob pattern 
		},

	})

	// Locally installed grunt plugins
	grunt.loadNpmTasks('grunt-update-json')
	grunt.loadNpmTasks('grunt-node-webkit-builder')
	grunt.loadNpmTasks('grunt-contrib-copy')
	grunt.loadNpmTasks('grunt-contrib-clean')

	// This default task performs all needed steps
	grunt.registerTask('default', ['clean:build', 'update_json:nw', 'copy', 'nodewebkit'])
}