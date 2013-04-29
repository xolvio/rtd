(function () {

    "use strict";

    var projectBasePath = '../..',
        fs = require('fs');

    module.exports = function (grunt) {

        var runCmd = fs.existsSync(projectBasePath + '/app/smart.json') 
                        ? 'mrt' 
                        : 'meteor run',
            settingsPath = getSettingsPath(grunt);

        if (settingsPath) {
          runCmd += ' --settings ' + settingsPath;
        }

        console.log(runCmd);

        grunt.initConfig({
            basePath: projectBasePath,
            watch: {
                files: [
                    '<%= basePath %>/test/acceptance/**/*.js',
                    '<%= basePath %>/app/**/*',
                    '!<%= basePath %>/app/.meteor/**/*'
                ],
                tasks: ['bgShell:synchronizeMirrorApp', 'bgShell:instrumentCode', 'bgShell:runTests']
            },

            bgShell: {
                _defaults: {
                    bg: true,
                    stdout: true,
                    stderr: true,
                    fail: true
                },
                startGhostDriver: {
                    cmd: 'phantomjs --webdriver=4444 > /dev/null 2>&1;'
                },
                startKarma: {
                    cmd: 'cd <%= basePath %>/test/rtd;' +
                         'karma start;'
                },
                instrumentCode: {
                    cmd: 'istanbul instrument <%= basePath %>/app -o <%= basePath %>/test/rtd/mirror_app;',
                    bg: false
                },
                killAll: {
                    cmd: "kill `ps -ef|grep -i meteor   | grep -v grep| awk '{print $2}'` > /dev/null 2>&1;" +
                         "kill `ps -ef|grep -i mrt      | grep -v grep| awk '{print $2}'` > /dev/null 2>&1;" +
                         "kill `ps -ef|grep -i mongod   | grep -v grep| awk '{print $2}'` > /dev/null 2>&1;" +
                         "kill `ps -ef|grep -i selenium | grep -v grep| awk '{print $2}'` > /dev/null 2>&1;" +
                         "kill `ps -ef|grep -i karma    | grep -v grep| awk '{print $2}'` > /dev/null 2>&1;" +
                         "kill `ps -ef|grep -i phantomjs| grep -v grep| awk '{print $2}'` > /dev/null 2>&1;",
                    fail: false,
                    bg: false,
                    stdout: false,
                    stderr: false
                },
                startApp: {
                    cmd: 'cd <%= basePath %>/app;' +
                         runCmd + ' --port 3000;'
                },
                startMirrorApp: {
                    cmd: 'cd <%= basePath %>/test/rtd/mirror_app;' +
                         runCmd + ' --port 8000;'
                },
                synchronizeMirrorApp: {
                    cmd: 'rsync -av --delete -q --delay-updates --force --exclude=".meteor/local" <%= basePath %>/app/ <%= basePath %>/test/rtd/mirror_app;' +
                        'cp <%= basePath %>/test/acceptance/fixtures/* <%= basePath %>/test/rtd/mirror_app/server;',
                    bg: false
                },
                runTests: {
                    cmd: 'export NODE_PATH="$(pwd)/node_modules";' +
                         'jasmine-node <%= basePath %>/test/acceptance/;',
                    bg: false,
                    fail: false
                }
            }
        });
        grunt.loadNpmTasks('grunt-bg-shell');
        grunt.loadNpmTasks('grunt-contrib-watch');

        grunt.registerTask('startSeleniumServer', 'startSeleniumServer', function () {
            require(projectBasePath + '/test/rtd/lib/selenium-launcher.js')(function (er, selenium) {
                console.log('selenium-server started on ' + selenium.host + ':' + selenium.port);
            });
        });

        grunt.registerTask('default', [
            'bgShell:killAll',
            'bgShell:synchronizeMirrorApp',
            'bgShell:instrumentCode',
            'bgShell:startMirrorApp',
            'bgShell:startKarma',
            'bgShell:startApp',
            'startSeleniumServer',
            'watch'
        ]);
    };  // end module.exports



    /**
     * Returns the path to a Meteor.settings file, if applicable.
     * If settings file is not found, returns null.
     *
     * Default is to check for 'settings.json' in the 'app' folder.
     *
     * The settings path can be passed via command line, like so:
     * > grunt --settingsPath '~/project/settings.json'
     *   note: if path is not absolute, path should be relative to 
     *         the directory where grunt is executed.
     *
     * @method getSettingsPath
     * @param {Object} grunt
     * @return {String|Null} path to a settings file, for use when 
     *                       executing 'meteor run --settings ...'
     */
    function getSettingsPath (grunt) {
      var settingsPath,
          viaOption,
          fileExists = false,
          relativeToProjectBase = false;

      viaOption = grunt.option('settingsPath');
      settingsPath = viaOption || 
                     (projectBasePath + '/app/settings.json');
      fileExists = fs.existsSync(settingsPath);

      if (viaOption && !fileExists) {
        grunt.fatal("Settings file '" + viaOption + "' not found.  " + 
                    "Note: Path must be relative to the current directory.");
      }
      if (!fileExists) {
        return null;
      }

      relativeToProjectBase = (0 === settingsPath.indexOf(projectBasePath));
      if (relativeToProjectBase) {

        // ex. ../../app/settings.json
        settingsPath = settingsPath.substring(projectBasePath.length);

        if (0 === settingsPath.indexOf('/app/')) {
          // strip left-over relative part
          settingsPath = settingsPath.substring(5);
        }

      } else {
        // not relative, use directly
        // ex. '~/project/settings.json'
      }

      return settingsPath;

    }  // end getSettingsPath 


})();
