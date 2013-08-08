// Stubs for the tmeasday's Router package. https://github.com/tmeasday/meteor-router

(function () {
    "use strict";

    var emptyFunction = function () {
    };

    // The Meteor stub needs to be call before.
    Meteor = Meteor || {};

    Meteor.Router = {
        add: function(paths){
            var options;
            for(var i in paths){
                if(paths.hasOwnProperty(i)){
                    options = paths[i];
                    // Need to create the *Path function when a route is added.
                    if(options && typeof(options) == 'string'){
                        Meteor.router[options+'Path'] = emptyFunction;
                    } else if(options && options.as){
                        Meteor.Router[options.as+'Path'] = emptyFunction;
                    }
                }
            }
        },
        page: emptyFunction,
        to: emptyFunction,
        beforeRouting: emptyFunction,
        filters: emptyFunction,
        filter: emptyFunction,
        configure: emptyFunction
    };
})();