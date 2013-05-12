(function () {
    "use strict";

    module.exports = function (webdriver, capabilities, sessionId) {
        return sessionId ?
            new webdriver.Builder().
                usingSession(sessionId).
                usingServer('http://localhost:4444/wd/hub').
                withCapabilities(capabilities).
                build() :
            new webdriver.Builder().
                usingServer('http://localhost:4444/wd/hub').
                withCapabilities(capabilities).
                build();
    };

})();