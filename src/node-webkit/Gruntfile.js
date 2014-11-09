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
	NWASSETS: './assets/',
	CACHE: '../../tmp/node-webkit-cache/',
	BUILD: '../../tmp/node-webkit-build/',
	RELEASE: '../../release/'
}

// Specify the remote url path (add TRAILING SLASH) were the updated desktop binaries will live
var REMOTE_UPDATE_DIR = 'https://dl.dropboxusercontent.com/u/2624630/cryptocat_nw_update_test/'

module.exports = function(grunt) {
	grunt.initConfig({

		'update_json': {
			options: {
				indent: '\t' // always indent with tabs
			},
			'nw': {
				src: DIRS.ROOT + 'package.json',
				dest: DIRS.LOCAL + 'package.json',
				// update local package.json used by node-webkit with data from root package.json
				// specify which fields to update here:
				// the package url to the remote packages gets automatically set!
				fields: ['version', 'description', 'keywords', 'author', 'license', {
					packages: function() {
						var rootPkg = require(DIRS.ROOT + 'package.json')

						return {
							'mac': {
								'url': REMOTE_UPDATE_DIR + 'Cryptocat_mac_v' + rootPkg.version + '.zip'
							},
							'win': {
								'url': REMOTE_UPDATE_DIR + 'Cryptocat_win_v' + rootPkg.version + '.zip'
							},
							'linux32': {
								'url': REMOTE_UPDATE_DIR + 'Cryptocat_linux32_v' + rootPkg.version + '.tar.gz'
							},
							'linux64': {
								'url': REMOTE_UPDATE_DIR + 'Cryptocat_linux64_v' + rootPkg.version + '.tar.gz'
							}
						}
					}
				}]
			},
			'fake': {
				src: DIRS.ROOT + 'package.json',
				dest: DIRS.LOCAL + 'package.json',
				fields: [{
					version: function() {
						// reset version to 2.2.1-fake to create a FAKE older version!
						return '2.2.1-fake'
					}
				}]
			}
		},

		'copy': {
			options: {
				mode: true // keep existing file permissions
			},
			'core': { // copy core Cryptocat files to temporary build folder (add app subdirectory)
				expand: true,
				cwd: DIRS.CORE,
				src: ['**/*.*', '!**/*.mp3'],
				dest: DIRS.BUILD + 'core/'
			},
			'nw': { // copy local nw files to temporary build folder
				expand: true,
				cwd: DIRS.LOCAL,
				// only include the things needed (add all REALLY needed node plugins here)
				// (exclude all dev-dependencies only used in grunt)
				src: ['*.*', '!Gruntfile.js', '!README.md',
					DIRS.NWASSETS + '*.*',
					'lib/**/*.*',
					'node_modules/node-webkit-updater/**/**', 
					'node_modules/node-notifier/**/**'
				],
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
				platforms: ['win', 'osx', 'linux32', 'linux64'],
				// platforms: ['osx'],
				buildDir: DIRS.RELEASE,
				cacheDir: DIRS.CACHE,
				macIcns: DIRS.NWASSETS + 'Cryptocat.icns',
				winIco: DIRS.NWASSETS + 'logo.ico',
				version: 'v0.11.0-rc1'
			},
			src: DIRS.BUILD + '**/**' // src needs grunt glob pattern 
		},

		'watch': {
			options: {
				spawn: false,
			},
			'srcChanges': { // only watch local files in node-webkit
				files: [DIRS.LOCAL + '**/*.*', '!' + DIRS.LOCAL + 'node_modules/**/*.*'],
				//files: [DIRS.CORE + '**/*.*', DIRS.LOCAL + '**/*.*'],
				tasks: ['build']
			}
		},

		// gzip assets 1-to-1 for production
		'compress': {
			options: {
				dest: '' //mac & win - linux needs extra attention
			},
			'mac': {
				options: {
					archive: DIRS.RELEASE + 'Cryptocat_mac_v<%=grunt.option("pkg").version%>.zip',
					mode: 'zip'
				},
				files: [{
					expand: true,
					cwd: DIRS.RELEASE + 'Cryptocat/osx/',
					src: ['**']
				}]
			},
			'win': {
				options: {
					archive: DIRS.RELEASE + 'Cryptocat_win_v<%=grunt.option("pkg").version%>.zip',
					mode: 'zip'
				},
				files: [{
					expand: true,
					cwd: DIRS.RELEASE + 'Cryptocat/win/',
					src: ['**']
				}]
			},
			'linux32': {
				options: {
					archive: DIRS.RELEASE + 'Cryptocat_linux32_v<%=grunt.option("pkg").version%>.tar.gz',
					mode: 'tgz'
				},
				files: [{
					expand: true,
					cwd: DIRS.RELEASE + 'Cryptocat/linux32/',
					src: ['**'],
					dest: 'Cryptocat/' // important, needs root folder at tar.gz for node-webkit-updater to operate!
				}]
			},
			'linux64': {
				options: {
					archive: DIRS.RELEASE + 'Cryptocat_linux64_v<%=grunt.option("pkg").version%>.tar.gz',
					mode: 'tgz'
				},
				files: [{
					expand: true,
					cwd: DIRS.RELEASE + 'Cryptocat/linux64/',
					src: ['**'],
					dest: 'Cryptocat/' // important, needs root folder at tar.gz for node-webkit-updater to operate!
				}]
			}
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
	grunt.registerTask('default', ['make'])

	// pipelines
	grunt.registerTask('make', ['clean:build', 'build', 'release'])
	grunt.registerTask('makeFake', ['clean:build', 'buildFake', 'release'])

	// build task that need to be performed before the nodewebkit task 
	// useful to execute only if you are within the DIR.BUILD directory and 
	// using 'nw .' to run a app directly
	// best used with the grunt watch task!
	grunt.registerTask('build', ['update_json:nw', 'copy'])

	// same as above BUT change version to 2.2.1 to output a fake release
	grunt.registerTask('buildFake', ['update_json:fake', 'copy'])

	// release full node-webkit version for all defined platforms (requires build before)
	grunt.registerTask('release', ['readJSON', 'nodewebkit', 'compress', 'clean:releasesNotZipped'])

	// task that reads & saves the proper updated version of the local package.json 
	// even after it was updated from root and sets via grunt.options to use fields
	// within follow up tasks
	grunt.registerTask('readJSON', 'Reading updated JSON...', function() {
		var pkg = require('./package.json')

		grunt.option('pkg', pkg)
	})
}