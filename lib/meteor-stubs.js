var emptyFunction = function () {
};

var Meteor = {
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
    find: emptyFunction,
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

Meteor.user = function () {
    return {
        emails: []
    };
};

var TemplateClass = function () {
};
TemplateClass.prototype = {
    eventMap: {},
    stub: function (templateName) {
        TemplateClass.prototype[templateName] = {
            events: function (eventMap) {
                for (var event in eventMap) {
                    TemplateClass.prototype.eventMap[event] = eventMap[event];
                }
            },
            helpers: function (helperMap) {
                for (var helper in helperMap) {
                    TemplateClass.prototype[helper] = helperMap[helper];
                }
            },
            fireEvent: function (key) {
                TemplateClass.prototype.eventMap[key]();
            },
            addAttribute: function (key, value) {
                TemplateClass.prototype.eventMap[key] = value;
            }
        };
    }
};
var Template = new TemplateClass();

var Session = {
    store: {},
    get: function (key) {
        return this.store[key];
    },
    set: function (key, value) {
        this.store[key] = value;
    },
    equals: function (key, value) {
        return this.store[key] === value;
    }
};

var Random = {
    fraction: emptyFunction
};

var Package = {
    describe: function (description) {
    }
};

var Npm = {
    depends: function (on) {
    }
};

var Deps = {
    autorun: function (func) {
        func();
    }
};