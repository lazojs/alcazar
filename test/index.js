var chai = require('chai');
var alcazar = require('../index');
var path = require('path');
var fs = require('fs-extra');
var appPath = 'test/app-dist';
var async = require('async');
var loaders = ['loader.js', 'text.js', 'json.js'];

// resourceType, resourceName, template, destName, dest, options, callback
describe('alcazar', function () {

    before(function (done) {
        var tasks = [];

        loaders.forEach(function (loader) {
            loader = path.resolve(path.join(appPath, loader));
            tasks.push(function (callback) {
                fs.remove(loader, function (err) {
                    if (err) {
                        return callback(err, null);
                    }

                    callback(null, true);
                });
            });
        });

        async.parallel(tasks, function (err, results) {
            if (err) {
                throw err;
            }

            done();
        });
    });

    it('should create a configuration object', function (done) {
        alcazar.getConf(appPath, function (err, conf) {
            if (err) {
                throw err;
            }

            chai.expect(conf.paths).to.be.Object;
            for (var k in conf.paths) {
                if (k !== 'text' && k !== 'json' && k !== 'appModuleId1' &&
                    k !== 'l!appModuleId2' && k !== 'appModuleId3') {
                    chai.expect(conf.paths[k]).to.be.equal('empty:');
                }
            }

            chai.expect(conf.map['*'].l).to.be.equal(path.resolve(path.join(appPath, 'loader.js')));
            done();
        });
    });

    it('should copy loaders', function (done) {
        alcazar.copyLoaders(appPath, function (err, paths) {
            if (err) {
                throw err;
            }

            var tasks = [];
            for (var k in paths) {
                (function (k) {
                    tasks.push(function (callback) {
                        fs.exists(paths[k].dest, function (exists) {
                            chai.expect(exists).to.be.true;
                            callback(null, true);
                        });
                    });
                })(k);
            }

            async.parallel(tasks, function (err, results) {
                if (err) {
                    throw err;
                }

                done();
            });
        });
    });

    it('should remove loaders', function (done) {
        alcazar.removeLoaders(appPath, function (err, paths) {
            if (err) {
                throw err;
            }

            var tasks = [];
            for (var k in paths) {
                (function (k) {
                    tasks.push(function (callback) {
                        fs.exists(paths[k].dest, function (exists) {
                            chai.expect(exists).to.be.false;
                            callback(null, true);
                        });
                    });
                })(k);
            }

            async.parallel(tasks, function (err, results) {
                if (err) {
                    throw err;
                }

                done();
            });
        });
    });

});