Package.describe({
    summary: "Intercepts the Meteor Email.send method and exposes the messages to Selenium"
});

Npm.depends({
});

Package.on_use(function (api) {
    api.add_files("email-fixture.js", "server");
});