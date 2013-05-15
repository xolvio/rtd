var $;

(function () {
    "use strict";

    var emptyFunction = function () {
    };

    var JQuery = function () {
    };

    JQuery.prototype = {
        ready: emptyFunction
    };
    var jQuery = new JQuery();

    $ = function () {
        return jQuery;
    };

})();