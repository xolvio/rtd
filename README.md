Real Time Development ([RTD](https://github.com/xolvio/real-time-development-with-meteor/wiki/Real-Time-Development)) with Meteor
=======================================
This is an add-in module to use in your development and build process that allows you to do [unit testing](http://blog.xolv.io/2013/04/unit-testing-with-meteor.html), and [end-to-end testing](http://blog.xolv.io/2013/04/end-to-end-testing-for-web-apps-meteor.html). The combination of these makes it possible to do acceptance test driven development ([ATDD](http://mydailyvowels.com/atdd-tdd-agile)) in an [RTD](https://github.com/xolvio/real-time-development-with-meteor/wiki/Real-Time-Development) fashion with Meteor.

What does it really do?
-----------------------
Every time you save a file:
* All your unit tests will run
* All your end-to-end acceptance tests will run
* You'll get a combined test-coverage (pretty) report from the units and end-to-end run

RTD by default will fail if you don't have 100% coverage, but you can relax this in the threshold settings.

Instructions
------------
Ensure you have [node](http://nodejs.org/download/) and [Meteor](http://meteor.com) and that these dependencies globally installed (you may need to run this as sudo, depending on how you're setup)
```bash
  npm i -g karma phantomjs selenium-webdriver grunt-cli jasmine-node istanbul
```

Next you need to move your meteor code into an app directory the structure of your application as follows:

    ├── <project root>
    │ ├── .git
    │ ├── app
    │ │ └── .meteor
    │ │ └── <your meteor code here>

RTD will live under the test directory. You can use a git sub-module as follows: (advised method as you'll get updates to the stubs/runners as we do them)
```bash
cd <your project root>
mkdir -p ./test/acceptance/fixtures; mkdir ./test/unit; touch ./test/acceptance/fixtures/empty.js;
git submodule add git@github.com:xolvio/rtd.git ./test/rtd; cd test/rtd; npm install;
```

Once the above runs, you should see this:

    ├── <project root>
    │ ├── .git
    │ ├── app
    │ │ └── .meteor
    │ │ └── <your meteor code here>
    │ ├── test
    │ │ └── acceptance
    | │ │ └── fixtures
    | | │ │ └── empty.js
    | │ │ └── <your end-to-end tests here>
    │ │ └── rtd
    | │ │ └── <a whole bunch of stuff>
    │ │ └── unit
    | │ │ └── <your unit tests here>

Now every time you start development, just run this: (the first time will take a few minutes as selenium-server & chromedriver are downloaded)
```bash
  cd <your project root>/test/rtd
  grunt
```

And enjoy seeing all your acceptance & unit tests run with coverage reports, every time you save a file.

To see the actual coverage report in detail, go to [http://localhost:8000/coverage](http://localhost:8000/coverage)

How does it work?
-----------------
* [Karma](https://github.com/karma-runner) is configured with file watchers, [Jasmine](https://github.com/pivotal/jasmine) (can easily be switched to [Mocha](http://visionmedia.github.io/mocha/)), console reporter and test coverage
* A set of [Template/Collection/Session](https://github.com/xolvio/rtd/blob/master/lib/meteor-stubs.js) stubs ensure code can load without Meteor
* The stubs expose attributes, functions and events to [Jasmine](https://github.com/pivotal/jasmine) so that [spies](https://github.com/pivotal/jasmine/wiki/Spies) can mock and assert
* A [grunt](http://gruntjs.com/) task downloads and starts selenium-server for [WebdriverJS](https://code.google.com/p/selenium/wiki/WebDriverJs)
* A [grunt](http://gruntjs.com/) file watcher monitors the main app and keeps a mirror app in sync, where the destructive acceptance tests run
* The default [grunt](http://gruntjs.com/) task runs all of the above together

Find out more
-------------
* [What is RTD](https://github.com/xolvio/real-time-development-with-meteor/wiki/Real-Time-Development)
* [What is ATDD](http://mydailyvowels.com/atdd-tdd-agile) ([more](http://www.qualitestgroup.com/Acceptance-Test-Driven-Development))
* [Unit-testing with Meteor](http://blog.xolv.io/2013/04/unit-testing-with-meteor.html)
* [End-to-end testing with Meteor](http://blog.xolv.io/2013/04/end-to-end-testing-for-web-apps-meteor.html)
* [Use RTD in your Meteor app](https://github.com/xolvio/rtd)
* [See an example of RTD with Meteor + Leaderboard sample app](https://github.com/xolvio/real-time-development-with-meteor)
* [Get started by forking a boilerplate project with AWS deployment support](https://github.com/xolvio/rtd-meteor-boilerplate)