/* jshint node: true */

var gulp = require('gulp');

(function real() {
    var Options = require('obfuscator').Options;
    var obfuscator = require('obfuscator').obfuscator;
    var options = new Options(
        [ '../fixtures/main.js', '../fixtures/included.js' ], 
        '../fixtures', 
        'main.js',
        true
    );

    // custom compression options 
    // see https://github.com/mishoo/UglifyJS2/#compressor-options 
    options.compressor = {
      conditionals: true,
      evaluate: true,
      booleans: true,
      loops: true,
      unused: false,
      hoist_funs: false
    };

    gulp.task('real', function(done) {
        obfuscator(options, function (err, obfuscated) {
            if (err) {
                throw err;
            }

            console.log(obfuscated);
            done();
        });    
    });
})();

(function test() {
    var obfuscator = require('../index.js');
    
    gulp.task('test', function() {
        return gulp.src('../fixtures/**/*.js', { base: '../fixtures' })
            .pipe(obfuscator({
                entry: 'main.js',
                strings: true,
                compressor: {
                    unused: false
                }
            }))
            .pipe(gulp.dest('./'));   
    });
    
})();
