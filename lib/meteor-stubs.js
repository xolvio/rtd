var Npm, Deps, Package, Random, Session, Template, Meteor, Handlebars, Accounts;

(function () {
    "use strict";

    var emptyFunction = function () {
    };

    Meteor = {
        instantiationCounts: {},
        publishFunctions: {},
        subscribeFunctions: {},
        methodMap: {},
        startup: function (newStartupFunction) {
            Meteor.startup = newStartupFunction;
        },
        Collection: function (collectionName) {
            Meteor.instantiationCounts[collectionName] = Meteor.instantiationCounts[collectionName] ? Meteor.instantiationCounts[collectionName] + 1 : 1;
        },
        publish: function (modelName, publishFunction) {
            this.publishFunctions[modelName] = publishFunction;
        },
        subscribe: function (modelName, subscribeFunction) {
            this.subscribeFunctions[modelName] = subscribeFunction;
        },
        methods: function (map) {
            for (var name in map) {
                this.methodMap[name] = map[name];
            }
        }
    };

    Meteor.Collection.prototype = {
        insert: emptyFunction,
        find: function () {
            return {
                fetch: emptyFunction
            };
        },
        findOne: emptyFunction,
        update: emptyFunction,
        remove: emptyFunction,
        allow: emptyFunction,
        deny: emptyFunction
    };

    Meteor.autorun = function (func) {
        func();
    };

    Meteor.call = emptyFunction;

    Meteor.loggingIn = emptyFunction;

    Meteor.setInterval = emptyFunction;

    Meteor.user = function () {
        return {
            emails: []
        };
    };

    var TemplateClass = function () {
    };
    TemplateClass.prototype = {
        stub: function (templateName) {
            TemplateClass.prototype[templateName] = {
                eventMap: {},
                events: function (eventMap) {
                    for (var event in eventMap) {
                        TemplateClass.prototype[templateName].eventMap[event] = eventMap[event];
                    }
                },
                helpers: function (helperMap) {
                    for (var helper in helperMap) {
                        TemplateClass.prototype[templateName][helper] = helperMap[helper];
                    }
                },
                fireEvent: function (key) {
                    if (arguments.length > 1) {
                        var args = Array.prototype.slice.call(arguments, 1);
                        TemplateClass.prototype[templateName].eventMap[key].apply(null, args);
                    } else {
                        TemplateClass.prototype[templateName].eventMap[key]();
                    }
                },
                // Allows you to set an attribute in the event 'this' context
                addContextAttribute: function (key, value) {
                    TemplateClass.prototype[templateName].eventMap[key] = value;
                }
            };
        }
    };

    Template = new TemplateClass();

    Session = {
        store: {},
        get: function (key) {
            return this.store[key];
        },
        set: function (key, value) {
            this.store[key] = value;
        },
        equals: function (key, value) {
            return this.store[key] === value;
        },
        setDefault: function (key, value) {
            if (typeof this.get(key) === 'undefined') {
                this.set(key, value);
            }
        }
    };

    Random = {
        fraction: emptyFunction
    };

    Package = {
        describe: function (description) {
        }
    };

    Npm = {
        depends: function (on) {
        }
    };

    Deps = {
        autorun: function (func) {
            func();
        }
    };

    var HandlebarsClass = function () {
    };

    Accounts = {
        urls: {}
    };

    HandlebarsClass.prototype = {
        helpers: {},
        registerHelper: function (name, method) {
            this.helpers[name] = method;
        }
    };
    Handlebars = new HandlebarsClass();

})();
