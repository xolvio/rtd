(function () {
    "use strict";

    var PROJECT_BASE_PATH = process.env.PWD,
        RTD_BASE_PATH = __dirname,
        DEFAULT_KARMA_CONFIG_FILE = RTD_BASE_PATH + '/karma.conf.js',
        CUSTOM_KARMA_CONFIG_FILE = PROJECT_BASE_PATH + '/test/karma.conf.js',
        DEFAULT_RTD_CONFIG_FILE = RTD_BASE_PATH + '/rtd.conf.js',
        CUSTOM_RTD_CONFIG_FILE = PROJECT_BASE_PATH + '/test/rtd.conf.js',
        http = require('http'),
        fs = require('fs'),
        path = require('path'),
        growl = require('growl'),
        libnotify = require('libnotify'),
        rtdConf = require(fs.existsSync(CUSTOM_RTD_CONFIG_FILE) ? CUSTOM_RTD_CONFIG_FILE : DEFAULT_RTD_CONFIG_FILE),
        karmaPath = path.resolve(require.resolve('karma'), '../../bin/karma'),
        istanbulPath = path.resolve(require.resolve('istanbul'), '../lib/cli.js'),
        jasminePath = path.resolve(require.resolve('jasmine-node'), '../../../bin/jasmine-node')

    var constructStartupTasks = function () {
        var tasks = [];
        tasks.push('bgShell:killAll');
        tasks.push('downloadAndOrStartSelenium');
        tasks.push('bgShell:startKarma');
        tasks.push('bgShell:synchronizeMirrorApp');
        if (rtdConf.options.coverage.enabled) {
            tasks.push('bgShell:instrumentCode');
        }
        tasks.push('bgShell:startMirrorApp');
        tasks.push('bgShell:startApp');
        tasks.push('pollServices');
        tasks.push('outputPorts');
        tasks.push('watch');
        return tasks;
    };

    var constructWatchTasks = function () {
        var tasks = [];

        if (rtdConf.options.jshint && rtdConf.options.jshint.enabled) {
            tasks.push('jshint:app');
            tasks.push('jshint:test');
        }

        if (rtdConf.options.coffeelint && rtdConf.options.coffeelint.enabled) {
            tasks.push('coffeelint:app');
            tasks.push('coffeelint:test');
        }

        tasks.push('bgShell:karmaRun');
        tasks.push('bgShell:synchronizeMirrorApp');
        tasks.push('bgShell:instrumentCode');

        if (rtdConf.options.useCucumberJs) {
            tasks.push('cucumberjs');
        } else {
            tasks.push('bgShell:runTests');
        }

        if (rtdConf.options.coverage.enabled && !rtdConf.options.useCucumberJs) {
            if (rtdConf.options.coverage.includeUnitCoverage) {
                tasks.push('postLatestUnitCoverage');
            }
            tasks.push('bgShell:killReports');
            tasks.push('bgShell:runCoverageCheck');
        }
        return tasks;
    };

    function constructRunOnceTasks(startupTasks) {
        var tasks = [];
        tasks = tasks.concat(startupTasks);
        tasks.pop(); // Remove the watch
        tasks.push.apply(tasks, constructWatchTasks());
        tasks.push('closeWebdriverSessions');
        return tasks;
    }

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

        var re = /\.\/app/g;
        data = data.replace(re, PROJECT_BASE_PATH + '/app');

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

    function getRunCmd(grunt, appPath) {
        var runCmd = fs.existsSync(PROJECT_BASE_PATH + '/' + appPath + '/smart.json') ? 'mrt' : 'meteor run',
            settingsPath = getSettingsPath(grunt, appPath);

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
     * @param {String} appPath
     * @return {String|Null} path to a settings file, for use when
     *                       executing 'meteor run --settings ...'
     */
    function getSettingsPath(grunt, appPath) {
        var settingsPath,
            viaOption,
            fileExists,
            relativeToProjectBase;

        viaOption = grunt.option('settingsPath');
        settingsPath = viaOption || (PROJECT_BASE_PATH + '/' + appPath + '/settings.json');
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

            if (0 === settingsPath.indexOf('/' + appPath + '/')) {
                // strip left-over relative part
                settingsPath = settingsPath.substring(appPath.length + 2);
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
        for (var i = 0; i < gruntFlags.length; i += 1) {
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

        var runCmd3000 = getRunCmd(grunt, 'app'),
            runCmd8000 = getRunCmd(grunt, 'build/mirror_app'),
            debug = getGruntDebugMode(grunt) || rtdConf.output.debug,
            instrumentationExcludes = getInstrumentedCodeString(rtdConf.options.instrumentationExcludes),
            startupTasks = constructStartupTasks(),
            watchTasks = constructWatchTasks(),
            runOnceTasks = constructRunOnceTasks(startupTasks);

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
            istanbulExclude: rtdConf.options.coverage.exclude ? '-x ' + rtdConf.options.coverage.exclude : '',
            debugMode: debug,
            watch: {
                files: [
                    '<%= basePath %>/test/unit/**/*.js',
                    '<%= basePath %>/test/unit/**/*.coffee',
                    RTD_BASE_PATH + '/lib/**/*.js',
                    RTD_BASE_PATH + '/lib/**/*.coffee',
                    '<%= basePath %>/test/acceptance/**/*.js',
                    '<%= basePath %>/test/acceptance/**/*.coffee',
                    '<%= basePath %>/test/features/**/*.js',
                    '<%= basePath %>/test/features/**/*.feature',
                    '<%= basePath %>/test/features/**/*.coffee',
                    '<%= basePath %>/app/**/*',
                    '<%= basePath %>/app/.meteor/*',
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
                            if (!stdout) {
                                message = 'Unit Tests Failed (internal)';
                            } else if (stdout.toLowerCase().indexOf('unit') !== -1) {
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
                    cmd: 'cd <%= basePath %>; ' + karmaPath + ' start <%= karmaConfigFile %>'
                },
                instrumentCode: {
                    cmd: istanbulPath + ' instrument <%= basePath %>/app <%= istanbulExclude %> <%= istanbulOptions %> -o <%= basePath %>/build/mirror_app' + instrumentationExcludes + (debug ? ';' : ' > /dev/null 2>&1;'),
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
                        runCmd3000 + ' --port 3000' + (rtdConf.output.appOutput || debug ? ';' : ' > /dev/null 2>&1;')
                },
                startMirrorApp: {
                    cmd: 'cd <%= basePath %>/build/mirror_app;' +
                        runCmd8000 + ' --port 8000' + (rtdConf.output.mirrorOutput || debug ? ';' : ' > /dev/null 2>&1;')
                },
                synchronizeMirrorApp: {
                    cmd: 'rsync -av --delete -q --delay-updates --force --exclude=".meteor/local" <%= basePath %>/app/ <%= basePath %>/build/mirror_app;' +
                        'mkdir -p <%= basePath %>/build/mirror_app/packages;' +
                        'cd <%= basePath %>/build/mirror_app/packages;' +
                        'ln -s ' + RTD_BASE_PATH + '/lib/istanbul-middleware-port .;' +
                        'ln -s ' + RTD_BASE_PATH + '/lib/meteor-fixture .;' +
                        'cp <%= basePath %>/test/acceptance/fixtures/* <%= basePath %>/build/mirror_app/server;' +
                        'echo >> <%= basePath %>/build/mirror_app/.meteor/packages;' +
                        'echo http >> <%= basePath %>/build/mirror_app/.meteor/packages;' +
                        'echo istanbul-middleware-port >> <%= basePath %>/build/mirror_app/.meteor/packages;' +
                        'echo meteor-fixture >> <%= basePath %>/build/mirror_app/.meteor/packages;',
                    bg: false
                },
                karmaRun: {
                    cmd: 'echo ; echo - - - Running unit tests - - -;' + karmaPath + ' run  <%= karmaConfigFile %> --reporters progress,junit' + (rtdConf.output.karma || debug ? ';' : ' > /dev/null 2>&1;'),
                    bg: false,
                    fail: true
                },
                runTests: {
                    cmd: 'echo - - - Running acceptance tests - - -;' +
                        'export NODE_PATH="$(pwd)/node_modules";' +
                        jasminePath + ' --verbose --captureExceptions --junitreport --output <%= basePath %>/build/reports/ --coffee <%= basePath %>/test/acceptance/;',
                    bg: false,
                    fail: true
                },
                runCoverageCheck: {
                    cmd: 'echo - - - Running coverage tests - - -;' +
                        'export NODE_PATH="$(pwd)/node_modules";' +
                        jasminePath + ' --verbose --junitreport --output <%= basePath %>/build/reports/ ' + RTD_BASE_PATH + '/lib --config THRESHOLDS "<%= coverageThresholds %>";',
                    bg: false,
                    fail: true
                },
                touchMirrorApp: {
                    cmd: 'touch <%= basePath %>/build/mirror_app/.meteor/packages;',
                    bg: false,
                    fail: false
                }
            },
            'unzip': {
                chromeDriver: {
                    src: RTD_BASE_PATH + '/lib/bin/<%= chromeDriverName %>_<%= chromeDriverOs %>.zip',
                    dest: RTD_BASE_PATH + '/lib/bin/'
                }
            },
            'jshint': {
                app: {
                    options: rtdConf.options.jshint && rtdConf.options.jshint.appOptions ? rtdConf.options.jshint.appOptions : {},
                    src: ['<%= basePath %>/app/**/*.js', '!<%= basePath %>/app/.meteor/**/*.js', '!<%= basePath %>/app/packages/**/*.js']
                },
                test: {
                    options: rtdConf.options.jshint && rtdConf.options.jshint.testOptions ? rtdConf.options.jshint.testOptions : {},
                    src: ['<%= basePath %>/test/**/*.js', '!' + RTD_BASE_PATH + '/**/*.js', '!<%= basePath %>/test/rtd.conf.js', '!<%= basePath %>/test/karma.conf.js']
                }
            },
            'coffeelint': {
                app: {
                    options: rtdConf.options.coffeelint && rtdConf.options.coffeelint.appOptions ? rtdConf.options.coffeelint.appOptions : {},
                    src: ['<%= basePath %>/app/**/*.coffee', '!<%= basePath %>/app/.meteor/**/*.coffee', '!<%= basePath %>/app/packages/**/*.coffee']
                },
                test: {
                    options: rtdConf.options.coffeelint && rtdConf.options.coffeelint.testOptions ? rtdConf.options.coffeelint.testOptions : {},
                    src: ['<%= basePath %>/test/**/*.coffee', '!' + RTD_BASE_PATH + '/**/*.coffee']
                }
            },
            cucumberjs: rtdConf.options.cucumberjs ? rtdConf.options.cucumberjs : {}
        });
        grunt.loadNpmTasks('grunt-bg-shell');
        grunt.loadNpmTasks('grunt-contrib-watch');
        grunt.loadNpmTasks('grunt-zip');
        grunt.loadNpmTasks('grunt-contrib-jshint');
        grunt.loadNpmTasks('grunt-coffeelint');
        grunt.loadNpmTasks('grunt-cucumber');

        grunt.registerTask('chmod', 'chmod', function () {
            fs.chmodSync(RTD_BASE_PATH + '/lib/bin/chromedriver', '755');
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
            postJson('localhost', 8000, '/coverage/client', getLatestCoverageObject(), done);
        });

        grunt.registerTask('downloadAndOrStartSelenium', 'downloadAndOrStartSelenium', function () {
            var done = this.async();
            require(RTD_BASE_PATH + '/lib/selenium-launcher.js')(function (/*er, selenium*/) {
                if (!fs.existsSync(RTD_BASE_PATH + '/lib/bin/chromedriver')) {
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

        grunt.registerTask('closeWebdriverSessions', 'closeWebdriverSessions', function () {
            var helper = require(RTD_BASE_PATH + '/webdrivers/webdriver-helper'),
                done = this.async();
            helper.quitDriverPromise().then(done);
        });

        grunt.registerTask('outputPorts', 'outputPorts', function () {
            console.log('Selenium-server on port 4444');
            console.log('Karma listener on port 9876');
            console.log('Karma runner on port 9100');
            console.log('Meteor on port 3000');
            console.log('Mirror on port 8000');
        });

        grunt.registerTask('pollServices', 'pollServices', function () {
            console.log('RTD is starting up...');
            var done = this.async(),
                readyPorts = {};

            var waitForServer = function (port, callback) {
                var intervalId = setInterval(function () {
                    require('request').get({
                        url: 'http://localhost:' + port
                    }, function (error) {
                        if (!error) {
                            clearInterval(intervalId);
                            callback(port);
                        }
                    });
                }, 500);
            };

            var setReadyFlag = function (port) {
                readyPorts[port] = true;
            };

            waitForServer(4444, setReadyFlag);
            waitForServer(9876, setReadyFlag);
            waitForServer(3000, setReadyFlag);
            waitForServer(8000, setReadyFlag);

            var i = setInterval(function () {
                if (Object.keys(readyPorts).length === 4) {
                    clearInterval(i);
                    if (rtdConf.options.runTestsOnStart) {
                        setTimeout(function () {
                            fs.utimes(PROJECT_BASE_PATH + '/app/.meteor/packages', new Date(), new Date());
                        }, 500);
                    }
                    done();
                }
            }, 500);

        });

        grunt.registerTask('default', startupTasks);
        grunt.registerTask('runOnce', runOnceTasks);

    };

})();
