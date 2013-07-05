(function () {
    "use strict";

    var createRoute = function (route, handler) {
        __meteor_bootstrap__.app.stack.splice(0, 0, {
            route: '/' + route,
            handle: function (req, res) {
                res.writeHead(200, {'Content-Type': 'text/plain'});
                handler(req, res);
            }.future()
        });
    };

    var messages = [],
        actualSend = Email.send;

    Email.send = function (options) {
        options.id = messages.length;
        messages.push(options);
        actualSend(options);
    };

    createRoute('showEmails', function (req, res) {
        res.end(JSON.stringify(messages));
    });

})();