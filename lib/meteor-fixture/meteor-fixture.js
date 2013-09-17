/*jshint -W020 */

Fixture = {};

(function () {
    "use strict";

    // You can access this from your own fixture.js so you can create routes for selenium to do things with
    Fixture.createRoute = function (route, handler) {
        var connectHandlers;
        if (typeof __meteor_bootstrap__.app !== 'undefined') {
            connectHandlers = __meteor_bootstrap__.app;
        } else {
            connectHandlers = WebApp.connectHandlers;
        }
        connectHandlers.stack.splice(0, 0, {
            route: '/' + route,
            handle: function (req, res) {
                res.writeHead(200, {'Content-Type': 'text/plain'});
                handler(req, res);
                res.end(route + ' complete');
            }.future()
        });
    };

    var createEmailInterceptor = function () {

        var emailMessages = [],
            actualSend = Email.send;
        Email.send = function (options) {
            options.id = emailMessages.length;
            emailMessages.push(options);
            actualSend(options);
        };

        Fixture.createRoute('showEmails', function (req, res) {
            res.end(JSON.stringify(emailMessages));
        });
    };

    if (Email !== undefined) {
        createEmailInterceptor();
    }


})();