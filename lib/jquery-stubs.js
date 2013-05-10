var JQuery = function () {
};

JQuery.prototype = {
    ready: function (d) {
    }
};
jQuery = new JQuery();

$ = function () {
    return jQuery;
};