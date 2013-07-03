// *********************************************************************************************************************
// IF YOU WANT TO CUSTOMIZE ANYTHING HERE, COPY THIS FILE TO YOUR /test DIRECTORY AND RTD WILL USE THAT FILE INSTEAD
// *********************************************************************************************************************

module.exports = {
    output: {
        debug: false,
        appOutput: false,
        mirrorOutput: false,
        karma: false
    },
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
    },
    selenium: {
        chromeDriverOs: 'mac32', // "linux_64" for linux systems
        chromeDriverVersion: '0.8',
        chromeDriverSha: '5a485bb73a7e85a063cffaab9314837a00b98673',
        seleniumServeVersion: '2.32.0',
        seleniumServeSha: 'c94e6d5392b687d3a141a35f5a489f50f01bef6a'
    }
};