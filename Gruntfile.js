(function () {
    "use strict";

    var PROJECT_BASE_PATH = __dirname + '/../..',
        DEFAULT_KARMA_CONFIG_FILE = PROJECT_BASE_PATH + '/test/rtd/karma.conf.js',
        CUSTOM_KARMA_CONFIG_FILE = PROJECT_BASE_PATH + '/test/karma.conf.js',
        DEFAULT_RTD_CONFIG_FILE = PROJECT_BASE_PATH + '/test/rtd/rtd.conf.js',
        CUSTOM_RTD_CONFIG_FILE = PROJECT_BASE_PATH + '/test/rtd.conf.js',
        http = require('http'),
        fs = require('fs'),
        growl = require('growl'),
        libnotify = require('libnotify'),
        rtdConf = require(fs.existsSync(CUSTOM_RTD_CONFIG_FILE) ? CUSTOM_RTD_CONFIG_FILE : DEFAULT_RTD_CONFIG_FILE);

    var constructStartupTasks = function () {
        var tasks = [];
        tasks.push('bgShell:killAll');
        tasks.push('downloadAndOrStartSelenium');
        tasks.push('bgShell:synchronizeMirrorApp');
        if (rtdConf.options.coverage.enabled) {
            tasks.push('bgShell:instrumentCode');
        }
        tasks.push('bgShell:startMirrorApp');
        tasks.push('bgShell:startKarma');
        tasks.push('bgShell:startApp');
        tasks.push('runOnce');
        tasks.push('outputPorts');
        tasks.push('watch');
        return tasks;
    };

    var constructWatchTasks = function () {
        var tasks = [];
        tasks.push('bgShell:karmaRun');
        tasks.push('bgShell:synchronizeMirrorApp');
        tasks.push('bgShell:instrumentCode');
        tasks.push('bgShell:runTests');
        if (rtdConf.options.coverage.enabled) {
            if (rtdConf.options.coverage.includeUnitCoverage) {
                tasks.push('postLatestUnitCoverage');
            }
            tasks.push('bgShell:killReports');
            tasks.push('bgShell:runCoverageCheck');
        }
        return tasks;
    };

    var constructRunOnceTasks = function() {
        var tasks = constructWatchTasks();
        tasks.unshift('bgShell:sleep');
        return tasks;
    };

    var startupTasks = constructStartupTasks(),
        watchTasks = constructWatchTasks(),
        runOnce = constructRunOnceTasks();

    function getLatestCoverageObject() {
        var coverageDir = PROJECT_BASE_PATH + '/build/reports/coverage';

        if (!fs.existsSync(coverageDir)) {
            return null;
        }

        var files = fs.readdirSync(coverageDir);
        if (files.length === 0) {
            return null;
        }
        var newestTime = 0, newestFile;
        for (var i = 0; i < files.length; i += 1) {
            if (files[i].indexOf('coverage') !== -1) {
                var stat = fs.statSync(coverageDir + '/' + files[i]);
                if (newestTime < stat.ctime.getTime()) {
                    newestTime = stat.ctime.getTime();
                    newestFile = files[i];
                }
            }
        }
        return fs.readFileSync(coverageDir + '/' + newestFile).toString();
    }

    function postJson(host, port, path, data, done) {

        if (!data) {
            return;
        }

        var find = './app';
        var re = new RegExp(find, 'g');
        data = data.replace(re, PROJECT_BASE_PATH.substring(0, PROJECT_BASE_PATH.indexOf('/test/rtd')) + '/app');

        var options = {
            hostname: host,
            port: port,
            path: path,
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            }
        };

        var req = http.request(options, function (res) {
            res.setEncoding('utf8');
            res.on('data', function () {
                done();
            });
        });

        req.on('error', function (e) {
            console.log('Error submitting coverage: ' + e.message);
            console.log(e.stack);
            done();
        });

        req.write(data);
        req.end();
    }

    function getRunCmd(grunt) {
        var runCmd = fs.existsSync(PROJECT_BASE_PATH + '/app/smart.json') ? 'mrt' : 'meteor run',
            settingsPath = getSettingsPath(grunt);

        if (settingsPath) {
            runCmd += ' --settings ' + settingsPath;
        }
        return runCmd;
    }

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
    function getSettingsPath(grunt) {
        var settingsPath,
            viaOption,
            fileExists,
            relativeToProjectBase;

        viaOption = grunt.option('settingsPath');
        settingsPath = viaOption || (PROJECT_BASE_PATH + '/app/settings.json');
        fileExists = fs.existsSync(settingsPath);

        if (viaOption && !fileExists) {
            grunt.fatal("Settings file '" + viaOption + "' not found.  " +
                "Note: Path must be relative to the current directory.");
        }
        if (!fileExists) {
            return null;
        }

        relativeToProjectBase = (0 === settingsPath.indexOf(PROJECT_BASE_PATH));
        if (relativeToProjectBase) {

            // ex. ../../app/settings.json
            settingsPath = settingsPath.substring(PROJECT_BASE_PATH.length);

            if (0 === settingsPath.indexOf('/app/')) {
                // strip left-over relative part
                settingsPath = settingsPath.substring(5);
            }

        }
        return settingsPath;
    }

    function rtdGrowl(opt) {
        growl(opt.name, {
            title: opt.message
        });
        libnotify.notify(opt.name, {
            title: opt.message
        }, null);
    }

    var getGruntDebugMode = function (grunt) {
        var gruntFlags = grunt.option.flags();
        for (var i = 0; i < gruntFlags.length; gruntFlags += 1) {
            if (gruntFlags[i].indexOf('--debug') !== -1) {
                return true;
            }
        }
        return false;
    };

    var getInstrumentedCodeString = function (excludesArray) {
        var build = '';
        for (var i = 0; i < excludesArray.length; i += 1) {
            build += ' -x "' + excludesArray[i] + '"';
        }
        return build;
    };

    module.exports = function (grunt) {

        var runCmd = getRunCmd(grunt),
            debug = getGruntDebugMode(grunt) || rtdConf.output.debug,
            instrumentationExcludes = getInstrumentedCodeString(rtdConf.options.instrumentationExcludes);

        if (!debug) {
            grunt.log.ok = function () {
            };
            grunt.log.header = function () {
            };
        }

        grunt.initConfig({
            basePath: PROJECT_BASE_PATH,
            karmaConfigFile: fs.existsSync(CUSTOM_KARMA_CONFIG_FILE) ? CUSTOM_KARMA_CONFIG_FILE : DEFAULT_KARMA_CONFIG_FILE,
            coverageThresholds: JSON.stringify(rtdConf.options.coverage.thresholds),
            chromeDriverName: rtdConf.selenium[process.platform].chromeDriverName,
            chromeDriverOs: rtdConf.selenium[process.platform].chromeDriverOs,
            chromeDriverVersion: rtdConf.selenium[process.platform].chromeDriverVersion,
            debugMode: debug,
            watch: {
                files: [
                    '<%= basePath %>/test/unit/**/*.js',
                    '<%= basePath %>/test/unit/**/*.coffee',
                    '<%= basePath %>/test/rtd/lib/**/*.js',
                    '<%= basePath %>/test/rtd/lib/**/*.coffee',
                    '<%= basePath %>/test/acceptance/**/*.js',
                    '<%= basePath %>/test/acceptance/**/*.coffee',
                    '<%= basePath %>/app/**/*',
                    '!<%= basePath %>/app/.meteor/local/**/*'
                ],
                tasks: watchTasks
            },
            bgShell: {
                _defaults: {
                    bg: true,
                    stdout: true,
                    stderr: true,
                    fail: true,
                    done: function (err, stdout) {
                        if (err) {
                            var message;
                            // Horrible mechanism, but done doesn't seem to work inside tasks
                            if (stdout.toLowerCase().indexOf('unit') !== -1) {
                                message = 'Unit Tests Failed';
                            } else if (stdout.toLowerCase().indexOf('acceptance') !== -1) {
                                message = 'Acceptance Tests Failed';
                            } else if (stdout.toLowerCase().indexOf('coverage') !== -1) {
                                message = 'Coverage Checks Failed';
                            } else {
                                return;
                            }
                            rtdGrowl({name: 'Check the console for more information', message: message});
                        }
                    }
                },
                startKarma: {
                    cmd: 'cd <%= basePath %>/test/rtd;' +
                        'karma start <%= karmaConfigFile %>;'
                },
                instrumentCode: {
                    cmd: 'istanbul instrument <%= basePath %>/app -o <%= basePath %>/build/mirror_app' + instrumentationExcludes + (debug ? ';' : ' > /dev/null 2>&1;'),
                    bg: false
                },
                killAll: {
                    cmd: "rm -rf <%= basePath %>/build/mirror_app;" +
                        "mkdir -p <%= basePath %>/build/mirror_app;" +
                        "kill `ps -ef|grep -i meteor   | grep -v grep| awk '{print $2}'` > /dev/null 2>&1;" +
                        "kill `ps -ef|grep -i mrt      | grep -v grep| awk '{print $2}'` > /dev/null 2>&1;" +
                        (rtdConf.options.killMongo ? "kill `ps -ef|grep -i mongod   | grep -v grep| awk '{print $2}'` > /dev/null 2>&1;" : "") +
                        "kill `ps -ef|grep -i selenium | grep -v grep| awk '{print $2}'` > /dev/null 2>&1;" +
                        "kill `ps -ef|grep -i karma    | grep -v grep| awk '{print $2}'` > /dev/null 2>&1;" +
                        "kill `ps -ef|grep -i phantomjs| grep -v grep| awk '{print $2}'` > /dev/null 2>&1;" +
                        "if `test -d <%= basePath %>/build/reports/coverage`; then rm -rf <%= basePath %>/build/reports/coverage; fi;",
                    fail: false,
                    bg: false,
                    stdout: false,
                    stderr: false
                },
                killReports: {
                    cmd: "rm <%= basePath %>/build/reports/coverage/*.json;",
                    fail: false,
                    bg: false,
                    stdout: true,
                    stderr: true
                },
                startApp: {
                    cmd: 'cd <%= basePath %>/app;' +
                        runCmd + ' --port 3000' + (rtdConf.output.appOutput || debug ? ';' : ' > /dev/null 2>&1;')
                },
                startMirrorApp: {
                    cmd: 'cd <%= basePath %>/build/mirror_app;' +
                        runCmd + ' --port 8000' + (rtdConf.output.mirrorOutput || debug ? ';' : ' > /dev/null 2>&1;')
                },
                synchronizeMirrorApp: {
                    cmd: 'rsync -av --delete -q --delay-updates --force --exclude=".meteor/local" <%= basePath %>/app/ <%= basePath %>/build/mirror_app;' +
                        'mkdir -p <%= basePath %>/build/mirror_app/packages;' +
                        'cd <%= basePath %>/build/mirror_app/packages;' +
                        'ln -s ../../../test/rtd/lib/istanbul-middleware-port .;' +
                        'ln -s ../../../test/rtd/lib/meteor-fixture .;' +
                        'cp <%= basePath %>/test/acceptance/fixtures/* <%= basePath %>/build/mirror_app/server;',
                    bg: false
                },
                karmaRun: {
                    cmd: 'echo ; echo - - - Running unit tests - - -;' +
                        'karma run' + (rtdConf.output.karma || debug ? ';' : ' > /dev/null 2>&1;'),
                    bg: false,
                    fail: true
                },
                runTests: {
                    cmd: 'echo - - - Running acceptance tests - - -;' +
                        'export NODE_PATH="$(pwd)/node_modules";' +
                        'jasmine-node --coffee <%= basePath %>/test/acceptance/;',
                    bg: false,
                    fail: true
                },
                runCoverageCheck: {
                    cmd: 'echo - - - Running coverage tests - - -;' +
                        'export NODE_PATH="$(pwd)/node_modules";' +
                        'jasmine-node --noStack <%= basePath %>/test/rtd/lib --config THRESHOLDS "<%= coverageThresholds %>";',
                    bg: false,
                    fail: true
                },
                touchMirrorApp: {
                    cmd: 'touch <%= basePath %>/build/mirror_app/.meteor/packages;',
                    bg: false,
                    fail: false
                },
                sleep: {
                    cmd: 'echo; echo "Sleeping some to wait for browser to start"; echo; sleep 2; open http://localhost:9876/; sleep 2',
                    bg: false
                }
            },
            'unzip': {
                chromeDriver: {
                    src: '<%= basePath %>/test/rtd/lib/bin/<%= chromeDriverName %>_<%= chromeDriverOs %>_<%= chromeDriverVersion %>.zip',
                    dest: '<%= basePath %>/test/rtd/lib/bin/'
                }
            }
        });
        grunt.loadNpmTasks('grunt-bg-shell');
        grunt.loadNpmTasks('grunt-contrib-watch');
        grunt.loadNpmTasks('grunt-zip');

        grunt.registerTask('chmod', 'chmod', function () {
            fs.chmodSync(PROJECT_BASE_PATH + '/test/rtd/lib/bin/chromedriver', '755');
        });

        ['warn', 'fatal'].forEach(function (level) {
            grunt.util.hooker.hook(grunt.fail, level, function (opt) {
                rtdGrowl(opt);
            });
        });

        grunt.registerTask('postLatestUnitCoverage', 'postLatestUnitCoverage', function () {
            var done = this.async();
            if (getLatestCoverageObject() === null) {
                console.log('No coverage reports available from unit tests');
                return;
            }
            console.log(getLatestCoverageObject());
            postJson('localhost', 8000, '/coverage/client', getLatestCoverageObject(), done);
        });

        grunt.registerTask('downloadAndOrStartSelenium', 'downloadAndOrStartSelenium', function () {
            var done = this.async();
            require(PROJECT_BASE_PATH + '/test/rtd/lib/selenium-launcher.js')(function (/*er, selenium*/) {
                if (!fs.existsSync(PROJECT_BASE_PATH + '/test/rtd/lib/bin/chromedriver')) {
                    grunt.task.run('unzip', 'chmod');
                }
                done();
            }, {
                chromeDriverName: rtdConf.selenium[process.platform].chromeDriverName,
                chromeDriverOs: rtdConf.selenium[process.platform].chromeDriverOs,
                chromeDriverVersion: rtdConf.selenium[process.platform].chromeDriverVersion,
                chromeDriverSha: rtdConf.selenium[process.platform].chromeDriverSha,
                seleniumServerVersion: rtdConf.selenium.seleniumServeVersion,
                seleniumServerSha: rtdConf.selenium.seleniumServeSha
            });
        });

        grunt.registerTask('outputPorts', 'outputPorts', function () {
            console.log('Launching Selenium-server on port 4444');
            console.log('Launching Karma listener on port 9876');
            console.log('Launching Karma runner on port 9100');
            console.log('Launching Meteor on port 3000');
            console.log('Launching Mirror on port 8000');
        });

        grunt.registerTask('runOnce', 'runOnce', runOnce);
        grunt.registerTask('default', startupTasks);

    };

})();
