(function () {
    "use strict";

    var webdriver = require('../node_modules/selenium-webdriver'),
        driver = require('../webdrivers/selenium-server.js')(webdriver, { browserName: 'chrome' });

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
                    expect(coveragePercentageOf(statements)).toBeGreaterThan(theThresholdsFor.statements);
                });
                metrics[1].getText().then(function (branches) {
                    expect(coveragePercentageOf(branches)).toBeGreaterThan(theThresholdsFor.branches);
                });
                metrics[2].getText().then(function (functions) {
                    expect(coveragePercentageOf(functions)).toBeGreaterThan(theThresholdsFor.functions);
                });
                metrics[3].getText().then(function (lines) {
                    expect(coveragePercentageOf(lines)).toBeGreaterThan(theThresholdsFor.lines);
                });

                mainDefer.resolve();
            });
            return mainDefer.promise;
        };

    };


    var finish = function (done) {
        driver.quit().then(function () {
            done();
        });
    };

    var error = function () {
        driver.quit().then(function () {
            console.log('\n');
            console.error('ACCEPTANCE TESTS ERROR');
            console.error(arguments);
        });
    };


    describe("Test coverage checker", function () {

        it("checks the coverage results against the thresholds", function (done) {
            openCoveragePage().
                then(verifyCoverageThresholds({
                    statements: 99.99999,
                    branches: 99.99999,
                    functions: 99.99999,
                    lines: 99.99999
                })).
                then(finish(done), error);
        });

    });
})();