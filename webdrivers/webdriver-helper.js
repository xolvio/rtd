(function () {
    "use strict";

    var request = require('request'),
        webdriver = require('selenium-webdriver'),
        executer = require('../node_modules/selenium-webdriver/executors'),
        driver = null,
        waitForCallback = null,
        newRun;

    function getWebdriverSessions(callback) {
        request.get({
            url: 'http://localhost:4444/wd/hub/sessions',
            headers: {
                'Content-type': 'application/json'
            }
        }, function (error, response, body) {
            callback(JSON.parse(body).value);
        });
    }
    function reuseOrCreateSession(sessions) {
        if (sessions.length === 0) {
            driver = new webdriver.Builder().
                withCapabilities(webdriver.Capabilities.chrome()).
                usingServer("http://localhost:4444/wd/hub").
                build();

            driver.manage().timeouts().setScriptTimeout(500);
            driver.manage().timeouts().implicitlyWait(500);
        } else {
            driver = webdriver.WebDriver.attachToSession(executer.createExecutor("http://localhost:4444/wd/hub"), sessions[0].id);
        }
        if (waitForCallback) {
            waitForCallback();
    }
    }

    getWebdriverSessions(reuseOrCreateSession);

    exports.postBackCoverage = function () {
        return driver.executeScript(function () {
            document.postCoverage();
        });
    };

    exports.getDriverPromise = function () {
        var deferred = webdriver.promise.defer();
        if (driver) {
            deferred.fulfill(driver);
        } else {
            newRun = true;
            waitsFor(function () {
                return driver;
            }, "Webdriver did not initialize.\nYou may need to restart RTD", 20000);
            runs(function () {
                deferred.fulfill(driver);
            });
        }
        return deferred;
    };

    exports.quitDriverPromise = function () {
        var deferred = webdriver.promise.defer();
        if (driver) {
            driver.quit().then(deferred.fulfill);
        } else {
            waitForCallback = function () {
                driver.quit().then(function () {
                    deferred.fulfill();
                });
            }
        }
        return deferred;
    };
    exports.driver = driver;
}());
