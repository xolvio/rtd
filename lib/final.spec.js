(function () {
    "use strict";

    // GENERIC MIXIN
    var helper = require('..').helper,
        webdriver = require('selenium-webdriver'),
        driver;

    var error = function (err) {
        console.log('\n');
        console.error(err);
        console.error('Error in acceptance tests');
    };

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

                mainDefer.fulfill();
            });
            return mainDefer.promise;
        };
    };

    describe("Test coverage checker", function () {
        beforeEach(function (done) {
            helper.getDriverPromise().then(function (result) {
                driver = result;
                done();
            });
        });
        it("checks the coverage results against the thresholds", function (done) {
            var thresholds = {};
            this.addMatchers({
                toBeGreaterOrEqualTo: function (expected, type) {
                    this.message = function () {
                        return 'Expected ' + type + ' coverage of ' + this.actual + '% to be greater or equal to ' + expected + '%';
                    };
                    return this.actual >= expected;
                }
            });
            eval('thresholds = ' + process.env.THRESHOLDS);
            openCoveragePage().
                then(verifyCoverageThresholds(thresholds)).
                then(function () {
                    done();
                }, error);
        });
    });
})();