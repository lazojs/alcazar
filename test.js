var alcazar = require('./index');

alcazar.removeLoaders('test/app', function (err, paths) {
    console.log(err);
    console.log(paths);
});

