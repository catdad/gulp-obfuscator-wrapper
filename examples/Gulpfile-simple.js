/* jshint node: true */

// A simple exampe, showing the task to run the standard Obfuscator
// library, as well as the equivalent options for running the 
// Gulp plugin.

var gulp = require('gulp');

(function real() {
    var Options = require('obfuscator').Options;
    var obfuscator = require('obfuscator').obfuscator;
    var options = new Options(
        // list of all of the files
        [ '../fixtures/main.js', '../fixtures/included.js' ],
        // the base for all files
        '../fixtures', 
        // the entry file
        'main.js',
        // mandle stings?
        true
    );

    options.compressor = {
        // I like settings this one, because it makes leaving it
        // true makes Express apps fail sometimes.
        unused: false
    };

    gulp.task('real', function(done) {
        obfuscator(options, function (err, obfuscated) {
            if (err) {
                throw err;
            }

            // write the file yourself, ugh
            console.log(obfuscated);
            done();
        });    
    });
})();

(function test() {
    var obfuscator = require('../index.js');
    
    gulp.task('test', function() {
        //     source list                     base for the files
        return gulp.src('../fixtures/**/*.js', { base: '../fixtures' })
            // feel free to pipe through anything else before obfuscating
            .pipe(obfuscator({
                // the entry file
                entry: 'main.js',
                // any compressor options
                compressor: {
                    unused: false
                }
            }))
            // use Gulp to write the output!
            .pipe(gulp.dest('./'));   
    });
    
})();
