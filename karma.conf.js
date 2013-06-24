// base path, that will be used to resolve files and exclude
basePath = '../..';

// list of files / patterns to load in the browser
files = [
    JASMINE,
    JASMINE_ADAPTER,

    // stubs come first so they can be available when all the units need them
    'test/rtd/lib/*-stubs.js',

    // the reason we load unit tests next is because they don't depend on the app. On the contrary,
    // they set mocks ahead of time for the units so they have to be loaded first
    'test/unit/**/*.js',

    // Models have to load next as they're auto-stubbed by RTD
    'app/models/**/*.js',

    // simulate loading order of meteor folder structure
    'app/lib/**/*.js',
    'app/client/lib/**/*.js',
    'app/server/lib/**/*.js',

    // now all the dependencies have been sorted, the app code can be loaded
    'app/**/*.js'
];


// list of files to exclude
exclude = [
    '**/3rd/**/*.js',
    '**/istanbul-middleware-port/**/*',
    'karma.conf.js',
    'app/.meteor/local',
    'app/server/fixture.js',
    '/packages/**/*'
];

preprocessors = {
    '**/app/**/*.js': 'coverage'
};

coverageReporter = {
    type: 'text-summary',
    dir: 'build/reports/coverage/',
    file: 'coverage.txt'
};

// test results reporter to use
// possible values: 'dots', 'progress', 'junit'
reporters = ['dots', 'coverage'];


// web server port
port = 9876;


// cli runner port
runnerPort = 9100;


// enable / disable colors in the output (reporters and logs)
colors = true;


// level of logging
// possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
logLevel = LOG_DISABLE;

// enable / disable watching file and executing tests whenever any file changes
autoWatch = false;


// Start these browsers, currently available:
// - Chrome
// - ChromeCanary
// - Firefox
// - Opera
// - Safari (only Mac)
// - PhantomJS
// - IE (only Windows)
browsers = ['PhantomJS'];


// If browser does not capture in given timeout [ms], kill it
captureTimeout = 60000;


// Continuous Integration mode
// if true, it capture browsers, run tests and exit
singleRun = false;
