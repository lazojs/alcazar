[![Build Status](https://travis-ci.org/lazojs/alcazar.svg?branch=master)](https://travis-ci.org/lazojs/alcazar)

# alcazar

> Things got hot. You look a little hot, you can take off that jacket. Our people don't like to be hot.

alcazar is a bundler utility that creates a RequireJS optimizer configuration and copies loaders for
optimizing a LazoJS application.

## Usage

```javascript
var alcazar = require('alcazar');

// get the configuration that provides the lazo 'empty:' paths and sets the loader (l, text, & json) paths
// perfroms a deep merge of the application conf.json (requirejs property) with the lazo configuration
alcazar.getConf('my/application/path', function (err, conf) {
    if (err) {
        throw err;
    }

    // do something with the conf
});

// copy the loaders for optimizing the application
alcazar.copyLoaders('my/application/path', function (err, paths) {
    if (err) {
        throw err;
    }

    // kick off optimizer
});

// remove the loaders after optimizer runs
alcazar.removeLoaders('my/application/path', function (err, paths) {
    if (err) {
        throw err;
    }

    // finish build
});
```
