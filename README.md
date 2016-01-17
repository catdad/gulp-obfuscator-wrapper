# Gulp Obfuscator Wrapper

[![Build Status](https://travis-ci.org/catdad/gulp-obfuscator-wrapper.svg?branch=master)](https://travis-ci.org/catdad/gulp-obfuscator-wrapper)
[![Code Climate](https://codeclimate.com/github/catdad/gulp-obfuscator-wrapper/badges/gpa.svg)](https://codeclimate.com/github/catdad/gulp-obfuscator-wrapper)
[![Test Coverage](https://codeclimate.com/github/catdad/gulp-obfuscator-wrapper/badges/coverage.svg)](https://codeclimate.com/github/catdad/gulp-obfuscator-wrapper/coverage)
[![Downloads][7]][8] [![Version][9]][8]

[7]: https://img.shields.io/npm/dm/gulp-obfuscator-wrapper.svg
[8]: https://www.npmjs.com/package/gulp-obfuscator-wrapper
[9]: https://img.shields.io/npm/v/gulp-obfuscator-wrapper.svg

This is a wrapper around the great [node-obfuscator](https://github.com/stephenmathieson/node-obfuscator) library by [stephenmathieson](https://github.com/stephenmathieson). It was made simply because I needed it for my own builds.

# Install

    npm install --save-dev gulp-obfuscator-wrapper
    
# Use

```javascript
var obfuscator = require('gulp-obfuscator-wrapper');
var rename = require('gulp-rename');

gulp.task('obfuscate', function() {
    // it is important to set the base
    return gulp.src('path/to/my/**/*.js', { base: 'path/to/my' })
        .pipe(obfuscator({
            // options are similar to Obfuscator options
            entry: 'main.js',
            strings: true,
            compressor: {
                // any options for compressor
            }
        }))
        // default name is obfuscated.js, so you'll probably want to change it
        .pipe(rename('my-name.js'))
        .pipe(gulp.dest('./'));
});
```
[![Analytics][12]][13]
[12]: https://ga-beacon.appspot.com/UA-17159207-7/gulp-obfuscator-wrapper/readme?flat
[13]: https://github.com/igrigorik/ga-beacon
