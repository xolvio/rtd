(function () {
    "use strict";

    // GENERIC MIXIN
    var http = require('http'),
        request = require('request'),
        webdriver = require('../node_modules/selenium-webdriver'),
        driver;

    var getWebdriverSessions = function (callback) {
        http.get({
            host: 'localhost',
            port: 4444,
            path: '/wd/hub/sessions'
        },function (resp) {
            resp.on('data', function (chunk) {
                callback(JSON.parse(chunk.toString()).value);
            });
        }).on("error", function (e) {
                console.log("Error getting Webdriver sessions " + e.message);
            });
    };

    var getWebdriverSessionStatus = function (sessionId, callback) {
        request.get({
            url: 'http://localhost:4444/wd/hub/session/' + sessionId + '/url',
            headers: {
                'Content-type': 'application/json'
            }
        }, function (error, response) {
            callback(response.statusCode);
        });
    };

    var deleteWebdriverSession = function (sessionId) {
        request.del({
            url: 'http://localhost:4444/wd/hub/session/' + sessionId,
            headers: {
                'Accept': 'application/json'
            }
        }, null);
    };

    var deleteWebdriverSessions = function (sessions) {
        for (var i = 0; i < sessions.length; i += 1) {
            deleteWebdriverSession(sessions[i].id);
        }
    };

    var reuseOrCreateSession = function (sessions) {
        if (sessions.length === 0) {
            driver = require('../webdrivers/selenium-server.js')(webdriver, { browserName: 'chrome' });
            driver.manage().timeouts().setScriptTimeout(2000);
            driver.manage().timeouts().implicitlyWait(2000);
        } else {
            var tempDriver = require('../webdrivers/selenium-server.js')(webdriver, { browserName: 'chrome' }, sessions[0].id);
            getWebdriverSessionStatus(sessions[0].id, function (status) {
                if (status !== 200) {
                    deleteWebdriverSessions(sessions);
                    tempDriver = require('../webdrivers/selenium-server.js')(webdriver, { browserName: 'chrome' });
                }
                tempDriver.manage().timeouts().setScriptTimeout(2000);
                tempDriver.manage().timeouts().implicitlyWait(2000);
                driver = tempDriver;
            });

        }
    };

    getWebdriverSessions(reuseOrCreateSession);


    var waitForWebdriver = function () {
        waitsFor(function () {
            return driver;
        }, "Webdriver did not initialize.\nYou may need to restart RTD", 750);
        runs(function () {
            if (arguments[0]) {
                arguments[0]();
            }
        });
    };

    var error = function (err) {
        console.log('\n');
        console.error(err);
        console.error('Error in acceptance tests');
    };

    // ****************************************************************************************

    var openCoveragePage = function () {
        return driver.get('http://localhost:8000/coverage');
    };

    var coveragePercentageOf = function (metricMarkup) {
        return parseFloat(metricMarkup.substring(0, metricMarkup.indexOf('%')));
    };

    var verifyCoverageThresholds = function (theThresholdsFor) {
        return function () {

            var mainDefer = webdriver.promise.defer();

            driver.findElements(webdriver.By.className('metric')).then(function (metrics) {

                metrics[0].getText().then(function (statements) {
                    expect(coveragePercentageOf(statements)).toBeGreaterOrEqualTo(theThresholdsFor.statements, 'statements');
                });
                metrics[1].getText().then(function (branches) {
                    expect(coveragePercentageOf(branches)).toBeGreaterOrEqualTo(theThresholdsFor.branches, 'branches');
                });
                metrics[2].getText().then(function (functions) {
                    expect(coveragePercentageOf(functions)).toBeGreaterOrEqualTo(theThresholdsFor.functions, 'functions');
                });
                metrics[3].getText().then(function (lines) {
                    expect(coveragePercentageOf(lines)).toBeGreaterOrEqualTo(theThresholdsFor.lines, 'lines');
                });

                mainDefer.resolve();
            });
            return mainDefer.promise;
        };

    };

    describe("Test coverage checker", function () {

        beforeEach(function () {
            waitForWebdriver();
        });

        it("checks the coverage results against the thresholds", function (done) {

            this.addMatchers({
                toBeGreaterOrEqualTo: function (expected, type) {
                    this.message = function () {
                        return 'Expected ' + type + ' coverage of ' + this.actual + '% to be greater or equal to ' + expected + '%';
                    };
                    return this.actual >= expected;
                }
            });

            var thresholds = {};
            eval('thresholds = ' + process.env.THRESHOLDS);
            openCoveragePage().
                then(verifyCoverageThresholds(thresholds)).
                then(done, error);
        });

    });
})();