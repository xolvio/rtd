var Router, RouteController;

(function () {
    "use strict";

    var emptyFunction = function () {
    };

    Router = {
        map: emptyFunction,
        configure: emptyFunction,
        current: emptyFunction,
        onBeforeAction: emptyFunction
    };

    RouteController = {
        extend: function(route){
            return route;
        }
    };

})();
