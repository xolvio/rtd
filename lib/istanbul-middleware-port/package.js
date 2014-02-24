Package.describe({
    summary: "Expose istanbul-middleware"
});

Npm.depends({
    'istanbul': '0.2.4',
    'path': '0.4.9',
    'url': '0.7.9',
    'archiver': '0.4.3',
    'connect': '2.7.10'
});

Package.on_use(function (api) {
    api.use('underscore', 'server');
    api.add_files('router_server.js', 'server');
    api.add_files('router_common.js', 'server');

    // for backward compat before Meteor linker changes
    if (typeof api.export !== 'undefined') {
        api.use('webapp', 'server');
    }

    api.add_files("core.js", "server");
    api.add_files("zip-writer.js", "server");
    api.add_files("express-shim.js", "server");
    api.add_files("handlers.js", "server");
    api.add_files("client-coverage-poster.js", "client");
});