document.postCoverage = function () {

    Meteor.http.post("http://localhost:8000/coverage/client", {
        content: JSON.stringify(__coverage__),
        headers: {
            'Content-type': 'application/json'
        }
    }, function (error, result) {
        console.log(error, JSON.stringify(result));
    });

};