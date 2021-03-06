// TODO: move lazo conf.json, paths.json, l! to modules to prevent reliance on
// lazo node module; list text and json modules as dependencies as well

var path = require('path');
var lazoPath = require.resolve('lazo').substr(0, require.resolve('lazo').lastIndexOf(path.sep));
var lazoPathsPath = path.resolve(lazoPath, path.join('lib', 'common', 'resolver', 'paths.json'));
var lazoConfPath = path.resolve(lazoPath, path.join('conf.json'));
var fs = require('fs-extra');
var async = require('async');
var _ = require('lodash');

function getPathValue(k, v) {
    // do not include lazo paths in the bundle
    // ensure text and json module paths exist for bundling (they will not be included)
    return k === 'text' || k === 'json' ? k : 'empty:';
}

function getLoaderPaths(appPath) {
    var paths = {};
    ['loader.js', 'text.js', 'json.js'].forEach(function (loader, i) {
        paths[loader] = {
            src: (!i ? path.resolve(lazoPath, path.join('lib', 'client', loader)) :
                path.resolve(lazoPath, path.join('lib', 'vendor', loader))),
            dest: path.resolve(appPath, loader)
        };
    });

    return paths;
}

function runTasks(callback, appPath, task) {
    var paths = getLoaderPaths(appPath);
    var tasks = [];

    for (var k in paths) {
        (function (k) {
            tasks.push(task);
        })(k);
    }

    async.parallel(tasks, function (err, results) {
        if (err) {
            return callback(err, null);
        }

        callback(null, paths);
    });
}

module.exports = {

    getConf: function (appPath, callback) {
        fs.readFile(lazoPathsPath, function (err, lazoPaths) {
            if (err) {
                return callback(err, null);
            }

            try {
                lazoPaths = JSON.parse(lazoPaths);
            } catch (e) {
                return callback(e, null);
            }

            fs.readFile(lazoConfPath, function (err, conf) {
                if (err) {
                    return callback(err, null);
                }
                try {
                    conf = JSON.parse(conf);
                    conf = conf.requirejs;
                } catch (e) {
                    return callback(e, null);
                }

                var paths = {};
                ['common', 'client'].forEach(function (list) {
                    for (var k in lazoPaths[list]) {
                        paths[k] = getPathValue(k, lazoPaths[list][k], appPath);
                    }
                });
                conf.paths = paths;
                conf.map = {
                    '*': {
                        'l': path.join(path.resolve(appPath), 'loader.js')
                    }
                };

                var appConfPath = path.resolve(path.join(appPath, 'conf.json'));
                fs.readFile(appConfPath, function (err, appConf) {
                    if (err) {
                        return callback(err, null);
                    }
                    try {
                        appConf = JSON.parse(appConf);
                        appConf = appConf.requirejs;
                    } catch (e) {
                        return callback(e, null);
                    }

                    callback(null, _.merge(conf, appConf));
                });
            });
        });
    },

    copyLoaders: function (appPath, callback) {
        var paths = getLoaderPaths(appPath);
        var tasks = [];

        for (var k in paths) {
            (function (k) {
                tasks.push(function (callback) {
                    fs.copy(paths[k].src, paths[k].dest, { replace: true }, function (err) {
                        if (err) {
                            return callback(err, null);
                        }

                        callback(null, true);
                    });
                });
            })(k);
        }

        async.parallel(tasks, function (err, results) {
            if (err) {
                return callback(err, null);
            }

            callback(null, paths);
        });
    },

    removeLoaders: function (appPath, callback) {
        var paths = getLoaderPaths(appPath);
        var tasks = [];

        for (var k in paths) {
            (function (k) {
                tasks.push(function (callback) {
                    fs.remove(paths[k].dest, function (err) {
                        if (err) {
                            return callback(err, null);
                        }

                        callback(null, true);
                    });
                });
            })(k);
        }

        async.parallel(tasks, function (err, results) {
            if (err) {
                return callback(err, null);
            }

            callback(null, paths);
        });
    }
};