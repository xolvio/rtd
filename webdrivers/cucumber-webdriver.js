var Webdriver;

(function () {
    "use strict";

    var http = require('http'),
        request = require('request'),
        webdriver = require('selenium-webdriver'),
        rtdSeleniumServer = './selenium-server.js';

    var getWebdriverSessions = function (callback) {
        request.get({
            url: 'http://localhost:4444/wd/hub/sessions',
            headers: {
                'Content-type': 'application/json'
            }
        }, function (error, response, body) {
            callback(JSON.parse(body).value);
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

    var reuseOrCreateSession = function (sessions, webBrowser, scriptTimeout, implicitlyWait, callback) {
        var browser;
        if (sessions.length === 0) {
            browser = require(rtdSeleniumServer)(webdriver, { browserName: webBrowser });
            browser.manage().timeouts().setScriptTimeout(scriptTimeout);
            browser.manage().timeouts().implicitlyWait(implicitlyWait);
            callback(browser);
        } else {
            var tempDriver = require(rtdSeleniumServer)(webdriver, { browserName: webBrowser }, sessions[0].id);
            getWebdriverSessionStatus(sessions[0].id, function (status) {
                if (status !== 200) {
                    deleteWebdriverSessions(sessions);
                    tempDriver = require(rtdSeleniumServer)(webdriver, { browserName: webBrowser });
                }
                tempDriver.manage().timeouts().setScriptTimeout(scriptTimeout);
                tempDriver.manage().timeouts().implicitlyWait(implicitlyWait);
                browser = tempDriver;
                callback(browser);
            });
        }
    };

    Webdriver = function (webBrowser, scriptTimeout, implicitlyWait) {
        return {
            driver: webdriver,
            getBrowser: function (callback) {
                getWebdriverSessions(function (sessions) {
                    reuseOrCreateSession(sessions, webBrowser, scriptTimeout, implicitlyWait, callback);
                });
            }
        };
    };
})();

module.exports = function (webBrowser, scriptTimeout, implicitlyWait) {
    "use strict";
    return new Webdriver(webBrowser, scriptTimeout, implicitlyWait);
};
