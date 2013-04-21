var emptyFunction = function () {
};

var Meteor = {
    instantiationCounts: {},
    publishFunctions: {},
    subscribeFunctions: {},
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

