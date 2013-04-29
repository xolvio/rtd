(function () {

    "use strict";

    var projectBasePath = '../..';

    module.exports = function (grunt) {
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
                    cmd: "kill `ps -ef|grep -i meteor| grep -v grep| awk '{print $2}'` > /dev/null 2>&1;" +
                        "kill `ps -ef|grep -i mongod| grep -v grep| awk '{print $2}'` > /dev/null 2>&1;" +
                        "kill `ps -ef|grep -i selenium| grep -v grep| awk '{print $2}'` > /dev/null 2>&1;" +
                        "kill `ps -ef|grep -i karma| grep -v grep| awk '{print $2}'` > /dev/null 2>&1;" +
                        "kill `ps -ef|grep -i phantomjs| grep -v grep| awk '{print $2}'` > /dev/null 2>&1;",
                    fail: false,
                    bg: false,
                    stdout: false,
                    stderr: false
                },
                startApp: {
                    cmd: 'cd <%= basePath %>/app;' +
                        'meteor run --port 3000;'
                },
                startMirrorApp: {
                    cmd: 'cd <%= basePath %>/test/rtd/mirror_app;' +
                        'meteor run --port 8000;'
                },
                synchronizeMirrorApp: {
                    cmd: 'rsync -av --delete -q --delay-updates --force --exclude=".meteor/local" <%= basePath %>/app/ <%= basePath %>/test/rtd/mirror_app;' +
                        'cp <%= basePath %>/test/acceptance/fixtures/* <%= basePath %>/test/rtd/mirror_app/server;',
                    bg: false
                },
                runTests: {
                    cmd: 'jasmine-node <%= basePath %>/test/acceptance/;',
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
    };
})();