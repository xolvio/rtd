var $;

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
        val: emptyFunction,
        on: function (eventKey, eventFunction) {
            JQuery.prototype.onEventMap[eventKey] = eventFunction;

        },
        fireOnEvent: function (key, eventObject) {
            JQuery.prototype.onEventMap[key](eventObject);
        },
        addedClasses: [],
        addClass: function (className) {
            JQuery.prototype.addedClasses.push(className);
        }
    };
    var jQuery = new JQuery();

    $ = function () {
        return jQuery;
    };

})();