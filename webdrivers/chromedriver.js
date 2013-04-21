(function () {
    "use strict";

    // If you'd like to use the ChromeDriver, you'll need to download from here:
    // https://code.google.com/p/chromedriver/downloads/list
    // then run the executable

    module.exports = function (webdriver) {
        return webdriver.WebDriver.createSession(
            new webdriver.http.Executor(
                new webdriver.http.HttpClient('http://localhost:9515')), {});
    };

})();