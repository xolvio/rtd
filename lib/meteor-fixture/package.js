Package.describe({
    summary: "Intercepts the Meteor Email.send method and exposes the messages to Selenium"
});

Package.on_use(function (api) {
    api.use('email', 'server');
    // for backward compat before Meteor linker changes
    if (typeof api.export !== 'undefined') {
        api.use('webapp', 'server');
    }

    api.add_files("meteor-fixture.js", "server");

    api.export([
        'Fixture'
    ], ['server']);
});