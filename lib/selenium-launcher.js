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

    var seleniumServerVersion, seleniumServerSha, seleniumServerFilename, seleniumServerUrl, seleniumServerOutputFile,
        chromeDriverName, chromeDriverOs, chromeDriverVersion, chromeDriverSha, chromeDriverFilename, chromeDriverUrl, chromeDriverOutFile, chromeDriverExecutable;

    function init(options) {
        chromeDriverName = options.chromeDriverName;
        chromeDriverOs = options.chromeDriverOs;
        chromeDriverVersion = options.chromeDriverVersion;
        chromeDriverSha = options.chromeDriverSha;
        seleniumServerVersion = options.seleniumServerVersion;
        seleniumServerSha = options.seleniumServerSha;

        seleniumServerFilename = 'selenium-server-standalone-' + seleniumServerVersion + '.jar',
            seleniumServerUrl = 'http://selenium.googlecode.com/files/' + seleniumServerFilename,
            seleniumServerOutputFile = path.join(path.dirname(__filename), '/bin/' + seleniumServerFilename),
            chromeDriverFilename = chromeDriverName + '_' + chromeDriverOs + '_' + chromeDriverVersion + '.zip',
            chromeDriverUrl = 'http://chromedriver.googlecode.com/files/' + chromeDriverFilename,
            chromeDriverOutFile = path.join(path.dirname(__filename), '/bin/' + chromeDriverFilename),
            chromeDriverExecutable = path.join(path.dirname(__filename), '/bin/chromedriver');
    }

    function download(url, outfile, expectedSha, cb) {
        var real = function () {
            console.log('\nDownloading ' + url);
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
        //console.log('\nStarting selenium-server ' + seleniumServerVersion);
        var child = spawn('java', [
            '-jar', seleniumServerOutputFile,
            '-port', 4444,
            '-Dwebdriver.chrome.driver=' + chromeDriverExecutable
        ]);
        child.host = '127.0.0.1';
        child.port = 4444;

        var badExit = function () {
            cb(new Error('\nCould not start Selenium.'));
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

    module.exports = function (cb, options) {
        init(options);
        download(chromeDriverUrl, chromeDriverOutFile, chromeDriverSha, function () {
            download(seleniumServerUrl, seleniumServerOutputFile, seleniumServerSha, function (er) {
                if (er) {
                    return cb(er);
                }
                run(cb);
            });
        });
    };
})();