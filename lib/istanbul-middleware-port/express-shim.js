express = function () {
    function createRoute(route, handler) {
        route = '/coverage' + (route === '/' ? '' : route);
        Meteor.RRouter.add(route, function () {
            var res = this.response;
            res.setHeader = function (key, value) {
                res.writeHead(200, {key: value});
            };
            res.json = function (obj) {
                res.setHeader('Content-type', 'text/json');
                return res.end(JSON.stringify(obj));
            };
            res.send = function (error, message) {
                return res.end(message);
            };
            handler(this.request, this.response);
        });
    }

    return {
        use: function () {
        },
        get: function (route, handler) {
            createRoute(route, handler);
        },
        post: function (route, handler) {
            createRoute(route, handler);
        }
    };
};

