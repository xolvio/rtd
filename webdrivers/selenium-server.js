(function () {
    "use strict";

    // If you'd like to use the Selenium standalone server, you'll need to
    // download it from here:
    // https://code.google.com/p/selenium/downloads/list
    // and run it using:
    // java -jar selenium-server-standalone-<VERSION>.jar

    module.exports = function (webdriver, capabilities) {
        return new webdriver.Builder().
            usingServer('http://localhost:4444/wd/hub').
            withCapabilities(capabilities).
            build();
    };

})();