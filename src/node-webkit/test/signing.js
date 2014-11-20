// test signing with CURRENT dsa public key against CURRENT bundled signed files in release

var RELEASE_DIR = './../../release/'

var expect = require('chai').expect
var verifySignature = require('../lib/verifySignature')
var pkg = require('../package.json')
var basename = require('path').basename

describe('verifySignature', function() {

	it('validates mac DSA: ' + pkg.packages.mac.dsa, function (done) {
		verifySignature.verifyFileSignatureAsync(RELEASE_DIR + basename(pkg.packages.mac.url), pkg.packages.mac.dsa, function (val) {
			expect(val).to.be.equal(true)
			done()
		})
	})

	it('validates win DSA: ' + pkg.packages.win.dsa, function (done) {
		verifySignature.verifyFileSignatureAsync(RELEASE_DIR + basename(pkg.packages.win.url), pkg.packages.win.dsa, function (val) {
			expect(val).to.be.equal(true)
			done()
		})
	})

	it('validates linux32 dsa: ' + pkg.packages.linux32.dsa, function (done) {
		verifySignature.verifyFileSignatureAsync(RELEASE_DIR + basename(pkg.packages.linux32.url), pkg.packages.linux32.dsa, function (val) {
			expect(val).to.be.equal(true)
			done()
		})
	})

	it('validates linux64 dsa: ' + pkg.packages.linux64.dsa, function (done) {
		verifySignature.verifyFileSignatureAsync(RELEASE_DIR + basename(pkg.packages.linux64.url), pkg.packages.linux64.dsa, function (val) {
			expect(val).to.be.equal(true)
			done()
		})
	})

})