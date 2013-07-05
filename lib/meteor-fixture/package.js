Package.describe({
    summary: "Intercepts the Meteor Email.send method and exposes the messages to Selenium"
});

Package.on_use(function (api) {
    api.add_files("meteor-fixture.js", "server");
});