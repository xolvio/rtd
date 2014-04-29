// *********************************************************************************************************************
// IF YOU WANT TO CUSTOMIZE ANYTHING HERE, COPY THIS FILE TO YOUR /test DIRECTORY AND CHANGE basePath CONFIGURATION to '..'.
// THEN RTD WILL USE THAT FILE INSTEAD.
// *********************************************************************************************************************

var path = require('path'),
    PROJECT_BASE_PATH = process.cwd(),
    RTD_BASE_PATH = path.dirname(require.resolve('rtd'));

module.exports = function(config){
    config.set({
        // base path, that will be used to resolve files and exclude
        basePath : PROJECT_BASE_PATH,

        // list of files / patterns to load in the browser
        files : [

            // stubs come first so they can be available when all the units need them
            RTD_BASE_PATH + '/lib/*-stubs.js',
            RTD_BASE_PATH + '/lib/*-stubs.coffee',

            // the reason we load unit tests next is because they don't depend on the app. On the contrary,
            // they set mocks ahead of time for the units so they have to be loaded first
            'test/unit/**/*.js',
            'test/unit/**/*.coffee',

            // Models have to load next as they're auto-stubbed by RTD
            'app/models/**/*.js',
            'app/models/**/*.coffee',

	        // simulate meteor's load order rules:
	        // - lib directory first
	        // - deeper directories ahead of shallower ones
	        // we don't currently handle the other meteor load order rule:
	        // - main.js files after everything else
	        'app/lib/*/*/*.js',
	        'app/lib/*/*.js',
	        'app/lib/**/*.js',
	        'app/lib/*/*/*.coffee',
	        'app/lib/*/*.coffee',
	        'app/lib/**/*.coffee',

	        'app/client/lib/*/*/*.js',
	        'app/client/lib/*/*.js',
	        'app/client/lib/**/*.js',
	        'app/client/lib/*/*/*.coffee',
	        'app/client/lib/*/*.coffee',
	        'app/client/lib/**/*.coffee',

	        'app/server/lib/*/*/*.js',
	        'app/server/lib/*/*.js',
	        'app/server/lib/**/*.js',
	        'app/server/lib/*/*/*.coffee',
	        'app/server/lib/*/*.coffee',
	        'app/server/lib/**/*.coffee',

	        // now all the dependencies have been sorted, the app code can be loaded
	        'app/*/*/*/*.js',
	        'app/*/*/*.js',
	        'app/*/*.js',
	        'app/**/*.js',
	        'app/*/*/*/*.coffee',
	        'app/*/*/*.coffee',
	        'app/*/*.coffee',
	        'app/**/*.coffee'

        ],

        // list of files to exclude
        exclude : [
            '**/3rd/**/*.js',
            '**/istanbul-middleware-port/**/*',
            'karma.conf.js',
            'app/.meteor/local',
            'app/server/fixture.js',
            'app/server/fixture.coffee',
            'app/packages/**/*'
        ],

        preprocessors : {
            '**/app/**/*.js': 'coverage',
            '**/*.coffee': 'coffee'
        },


        frameworks : ['jasmine'],

        coverageReporter : {
            type: 'text-summary',
            dir: 'build/reports/coverage/',
            file: 'coverage.txt'
        },

        junitReporter: {
            outputFile: 'build/reports/TEST-UnitTests.xml',
            suite: ''
        },

        // test results reporter to use
        // possible values: 'dots', 'progress', 'junit'
        reporters : ['dots', 'progress', 'coverage', 'junit'],


        // web server port
        port : 9876,


        // cli runner port
        runnerPort : 9100,


        // enable / disable colors in the output (reporters and logs)
        colors : true,


        // level of logging
        // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
        logLevel : config.LOG_ERROR,

        // enable / disable watching file and executing tests whenever any file changes
        autoWatch : false,


        // Start these browsers, currently available:
        // - Chrome
        // - ChromeCanary
        // - Firefox
        // - Opera
        // - Safari (only Mac)
        // - PhantomJS
        // - IE (only Windows)
        browsers : ['PhantomJS'],


        // If browser does not capture in given timeout [ms], kill it
        captureTimeout : 60000,


        // Continuous Integration mode
        // if true, it capture browsers, run tests and exit
        singleRun : false
    });
};
