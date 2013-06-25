// *********************************************************************************************************************
// IF YOU WANT TO CUSTOMIZE ANYTHING HERE, COPY THIS FILE TO YOUR /test DIRECTORY AND RTD WILL USE THAT FILE INSTEAD
// *********************************************************************************************************************

module.exports = {
    DEBUG: false,
    startupTasks: [
        'bgShell:killAll',
        'downloadAndOrStartSelenium',
        'bgShell:synchronizeMirrorApp',
        'bgShell:instrumentCode',
        'bgShell:startMirrorApp',
        'bgShell:startKarma',
        'bgShell:startApp',
        'outputPorts',
        'watch'
    ],
    watchTasks: [
        'bgShell:karmaRun',
        'bgShell:synchronizeMirrorApp',
        'bgShell:instrumentCode',
        'bgShell:runTests',
        'postLatestUnitCoverage',
        'bgShell:killReports',
        'bgShell:runCoverageCheck'
    ],
    coverageThresholds: {
        'statements': 100,
        'branches': 100,
        'functions': 100,
        'lines': 100
    }
};