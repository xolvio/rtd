Real Time Development ([RTD](https://github.com/xolvio/real-time-development-with-meteor/wiki/Real-Time-Development)) with Meteor
=======================================
This is an add-in module to use in your development and build process that allows you to do acceptance test driven development ([ATDD](http://mydailyvowels.com/atdd-tdd-agile)) in an [RTD](https://github.com/xolvio/real-time-development-with-meteor/wiki/Real-Time-Development) fashion with Meteor.

What does it do?
----------------
Every time you save a file:
* All your unit tests will run
* All your end-to-end acceptance tests will run
* You'll get a test-coverage report

Why?
----
With the combination of acceptance and unit tests, you can consistently achieve 100% test coverage. What's missing is the tools to let you know how you're doing. RTD aims to solve this by providing these tools.

Instructions
------------
Ensure you have [node](http://nodejs.org/download/) and [Meteor](http://meteor.com) and that these dependencies globally installed:
```bash
  npm i -g karma phantomjs selenium-webdriver grunt-cli jasmine-node
```

Next you'll need to get RTD. You can use a git sub-module as follows: (advised method as you'll get updates as we do them)
```bash
cd <your project root>
mkdir test; git submodule add git@github.com:xolvio/rtd.git ./test/rtd; cd test/rtd; npm install;
```

Alternatively, you can download a copy of the RTD library: (you'll have to redo this when you want the latest updates)
```bash
cd <your project root>
curl -O -L https://github.com/xolvio/rtd/archive/master.zip; unzip master.zip; mkdir test; mv rtd-master test/rtd; rm master.zip; cd test/rtd; npm install;
```

Now every time you start development, just run this: (the first time will a few minutes as selenium is downloaded)
```bash
  cd <your project root>/test/rtd
  grunt
```

And enjoy seeing all your acceptance & unit tests run with coverage reports, every time you save a file.

Find out more
-------------
* [What is RTD](https://github.com/xolvio/real-time-development-with-meteor/wiki/Real-Time-Development)
* [What is ATDD](http://mydailyvowels.com/atdd-tdd-agile) ([more](http://www.qualitestgroup.com/Acceptance-Test-Driven-Development))
* [How RTD for Meteor works](https://github.com/xolvio/rtd)
* [Unit-testing with Meteor](http://blog.xolv.io/2013/04/unit-testing-with-meteor.html)
* [End-to-end testing with Meteor](http://blog.xolv.io/2013/04/end-to-end-testing-for-web-apps-meteor.html)
* [Use RTD in your Meteor app](https://github.com/xolvio/rtd)
* [See an example of RTD with Meteor + Leaderboard sample app](https://github.com/xolvio/rtd-meteor-example)
* [Get started by forking a boilerplate project with AWS deployment support](https://github.com/xolvio/rtd-meteor-boilerplate)