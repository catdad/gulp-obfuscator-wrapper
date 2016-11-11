# Gulp Obfuscator Wrapper

[![Build][1]][2]
[![Test Coverage][3]][4]
[![Code Climate][5]][6]
[![Downloads][7]][8]
[![Version][9]][8]
[![Dependency Status][10]][11]

[1]: https://travis-ci.org/catdad/gulp-obfuscator-wrapper.svg?branch=master
[2]: https://travis-ci.org/catdad/gulp-obfuscator-wrapper

[3]: https://codeclimate.com/github/catdad/gulp-obfuscator-wrapper/badges/coverage.svg
[4]: https://codeclimate.com/github/catdad/gulp-obfuscator-wrapper/coverage

[5]: https://codeclimate.com/github/catdad/gulp-obfuscator-wrapper/badges/gpa.svg
[6]: https://codeclimate.com/github/catdad/gulp-obfuscator-wrapper

[7]: https://img.shields.io/npm/dm/gulp-obfuscator-wrapper.svg
[8]: https://www.npmjs.com/package/gulp-obfuscator-wrapper
[9]: https://img.shields.io/npm/v/gulp-obfuscator-wrapper.svg

[10]: https://david-dm.org/catdad/gulp-obfuscator-wrapper.svg
[11]: https://david-dm.org/catdad/gulp-obfuscator-wrapper

This is a wrapper around the great [node-obfuscator](https://github.com/stephenmathieson/node-obfuscator) library by [stephenmathieson](https://github.com/stephenmathieson). It was made simply because I needed it for my own builds.

## Install

    npm install --save-dev gulp-obfuscator-wrapper

## Use

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

In case you did not see the comment mixed in the code, **it is very important to define `base` in your `gulp.src` call**. While this module might likely work without it, it will help to make sure that your project gets obfuscated correctly, especially with large projects that have a complex nested folder structure.

[![Analytics](https://ga-beacon.appspot.com/UA-17159207-7/gulp-obfuscator-wrapper/readme?flat)](https://github.com/igrigorik/ga-beacon)
