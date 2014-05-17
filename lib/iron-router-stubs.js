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

    var RouteControllerClass = function(route){
        //apply properties of route to controller so you can test against them later
        for(var i in route){
            //noinspection JSUnfilteredForInLoop
            this[i] = route[i];
        }
    };

    RouteControllerClass.prototype = {
        extend: function(route) {
            return new RouteControllerClass(route);
        }
    };

    RouteController = new RouteControllerClass();

})();