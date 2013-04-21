(function () {
    "use strict";

    module.exports = function (webdriver) {
        return new webdriver.Builder().build();
    };

})();