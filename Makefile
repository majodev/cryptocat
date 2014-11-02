chrome:
	@make cryptojs
	@mkdir -p release
	@rm -f release/cryptocat.chrome.zip
	@cd src/core/ && zip -q -r9 ../../release/cryptocat.chrome.zip * -x "*/\.*" -x "\.*" -x "*.ogg"
	@/bin/echo "[Cryptocat] Chrome build available in release/"

firefox:
	@make cryptojs
	@mkdir -p release
	@rm -f release/cryptocat.firefox.xpi
	@mkdir src/firefox/chrome/content/data/
	@cp -R src/core/css src/core/firstRun.html src/core/fonts src/core/img src/core/index.html src/core/js src/core/locale src/core/snd src/firefox/chrome/content/data/
	@rm -f src/firefox/chrome/content/data/snd/*.mp3
	@cd src/firefox/ && zip -q -r9 ../../release/cryptocat.firefox.xpi * -x "*/\.*" -x "\.*"
	@rm -r src/firefox/chrome/content/data/
	@/bin/echo "[Cryptocat] Firefox build available in release/"

safari:
	@make cryptojs
	@rm -rf src/cryptocat.safariextension
	@mkdir src/cryptocat.safariextension
	@cp -R src/core/css src/core/firstRun.html src/core/fonts src/core/img src/core/index.html src/core/js src/core/locale src/core/snd src/cryptocat.safariextension
	@rm -f src/cryptocat.safariextension/snd/*.ogg
	@cp -R src/safari/* src/cryptocat.safariextension
	@/bin/echo "[Cryptocat] Safari extension packaged for testing."

opera:
	@make cryptojs
	@mkdir -p release
	@rm -f release/cryptocat.opera.nex
	@cp -R src/core/css src/core/firstRun.html src/core/fonts src/core/img src/core/index.html src/core/js src/core/locale src/core/snd src/opera
	@rm -f src/opera/snd/*.mp3
	@cd src/opera/ && zip -q -r9 ../../release/cryptocat.opera.nex * -x "*/\.*" -x "\.*"
	@rm -rf src/opera/css src/opera/firstRun.html src/opera/fonts src/opera/img src/opera/index.html src/opera/js src/opera/locale src/opera/snd
	@/bin/echo "[Cryptocat] Opera build available in release/"

mac:
	@make cryptojs
	@rm -rf release/Cryptocat.app
	@rm -rf release/cryptocat.mac.zip
	@cp -R src/core/css src/core/firstRun.html src/core/fonts src/core/img src/core/index.html src/core/js src/core/locale src/core/snd src/mac/htdocs
	@rm -f src/mac/htdocs/snd/*.ogg
	@xcodebuild -project src/mac/Cryptocat.xcodeproj -configuration 'Release' clean
	@xcodebuild CONFIGURATION_BUILD_DIR="${PWD}/release" -project src/mac/Cryptocat.xcodeproj -configuration 'Release' build
	@rm -rf release/Cryptocat.app.dSYM
	@rm -rf src/mac/htdocs/*
	@echo "." >> src/mac/htdocs/placeholder.txt
	@cd release && zip -q -r9 cryptocat.mac.zip Cryptocat.app
	@/bin/echo "[Cryptocat] Mac app available in release/"

node-webkit:
	@make cryptojs
	@/bin/echo "[Cryptocat] Bundling for node-webkit src/node-webkit/Gruntfile.js..."
	@cd src/node-webkit && npm install -d && grunt
	@/bin/echo "[Cryptocat] node-webkit apps available in release/"

tests:
	@/bin/echo -n "[Cryptocat] Running tests... "
	@`/usr/bin/which npm` install
	@node_modules/.bin/mocha --ui exports --reporter spec test/core/js/*.test.js

lint:
	@/bin/echo -n "[Cryptocat] Linting code... "
	@node_modules/.bin/jshint --verbose --config .jshintrc \
		src/core/js/cryptocat.js \
		src/core/js/lib/elliptic.js \
		src/core/js/lib/salsa20.js \
		src/core/js/etc/*.js \
		src/standaloneServer.js \
		src/firefox/chrome/content/cryptocat.js \
		src/opera/opera.js \
		src/core/chrome.js \
		test/testBase.js \
		test/core/js/*.js \
		Gruntfile.js
	@/bin/echo ""

vendor=src/core/js/lib
cryptojs_path=$(vendor)/crypto-js
cryptojs_js=$(vendor)/crypto-js.js
cryptojs:  # order matters
	@/bin/echo "[Cryptocat] Concatenating crypto-js files..."
	@cat $(cryptojs_path)/header.js > $(cryptojs_js)
	@cat $(cryptojs_path)/core.js >> $(cryptojs_js)
	@cat $(cryptojs_path)/enc-base64.js >> $(cryptojs_js)
	@cat $(cryptojs_path)/cipher-core.js >> $(cryptojs_js)
	@cat $(cryptojs_path)/x64-core.js >> $(cryptojs_js)
	@cat $(cryptojs_path)/aes.js >> $(cryptojs_js)
	@cat $(cryptojs_path)/sha1.js >> $(cryptojs_js)
	@cat $(cryptojs_path)/sha256.js >> $(cryptojs_js)
	@cat $(cryptojs_path)/sha512.js >> $(cryptojs_js)
	@cat $(cryptojs_path)/hmac.js >> $(cryptojs_js)
	@cat $(cryptojs_path)/pbkdf2.js >> $(cryptojs_js)
	@cat $(cryptojs_path)/pad-nopadding.js >> $(cryptojs_js)
	@cat $(cryptojs_path)/mode-ctr.js >> $(cryptojs_js)
	@cat $(cryptojs_path)/footer.js >> $(cryptojs_js)

all: lint tests