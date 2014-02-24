var $, jQuery;

(function () {
    "use strict";

    var emptyFunction = function () {
    };

    var JQuery = function () {
    };

    JQuery.prototype = {
        onEventMap: {},
        ready: emptyFunction,
        show: emptyFunction,
        scroll: emptyFunction,
        scrollTop: emptyFunction,
        resize: emptyFunction,
        val: emptyFunction,
        live: emptyFunction,
        slideUp: emptyFunction,
        on: function (eventKey, eventFunction) {
            JQuery.prototype.onEventMap[eventKey] = eventFunction;

        },
        fireOnEvent: function (key, eventObject) {
            JQuery.prototype.onEventMap[key](eventObject);
        },
        fn: {},
        addedClasses: [],
        addClass: function (className) {
            JQuery.prototype.addedClasses.push(className);
        }
    };
    jQuery = new JQuery();

    $ = function () {
        return jQuery;
    };

    $.extend = emptyFunction;

})();
