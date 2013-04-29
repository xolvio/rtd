// All credits go to https://github.com/daaku/nodejs-selenium-launcher
// This file has been modified to always run selenium on port 4444

(function () {
    "use strict";
    var fs = require('fs'),
        path = require('path'),
        request = require('request'),
        hashFile = require('hash_file'),
        spawn = require('child_process').spawn,
        freeport = require('freeport'),
        EventEmitter = require('events').EventEmitter,
        util = require('util');

    var override = process.env.SELENIUM_VERSION ? process.env.SELENIUM_VERSION.split(':') : [],
        version = override[0] || '2.32.0',
        expectedSha = override[1] || 'c94e6d5392b687d3a141a35f5a489f50f01bef6a',
        filename = 'selenium-server-standalone-' + version + '.jar',
        url = 'http://selenium.googlecode.com/files/' + filename,
        outfile = path.join(path.dirname(__filename), filename);

    function download(url, outfile, expectedSha, cb) {
        var real = function () {
            console.log('Downloading Selenium ' + version);
            var i = 0;
            request({ url: url })
                .on('end', function () {
                    process.stdout.write('\n');
                    cb();
                })
                .on('data', function () {
                    if (i === 8000) {
                        process.stdout.write('\n');
                        i = 0;
                    }
                    if (i % 100 === 0) {
                        process.stdout.write('.');
                    }
                    i += 1;
                })
                .pipe(fs.createWriteStream(outfile));
        };

        fs.stat(outfile, function (er) {
            if (er) {
                return real();
            }
            hashFile(outfile, 'sha1', function (er, actualSha) {
                if (er) {
                    return cb(er);
                }
                if (actualSha !== expectedSha) {
                    return real();
                }
                cb();
            });
        });
    }

    function run(cb) {
        console.log('Starting Selenium ' + version + ' on port 4444');
        var child = spawn('java', [
            '-jar', outfile,
            '-port', 4444
        ]);
        child.host = '127.0.0.1';
        child.port = 4444;

        var badExit = function () {
            cb(new Error('Could not start Selenium.'));
        };
        child.stdout.on('data', function (data) {
            var sentinel = 'Started org.openqa.jetty.jetty.Server';
            if (data.toString().indexOf(sentinel) !== -1) {
                child.removeListener('exit', badExit);
                cb(null, child);
            }
        });
        child.on('exit', badExit);
    }

    function FakeProcess(port) {
        EventEmitter.call(this);
        this.host = '127.0.0.1';
        this.port = port;
    }

    util.inherits(FakeProcess, EventEmitter);

    module.exports = function (cb) {
        download(url, outfile, expectedSha, function (er) {
            if (er) {
                return cb(er);
            }
            run(cb);
        });
    };
})();