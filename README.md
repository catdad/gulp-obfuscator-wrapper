# Gulp Obfuscator Wrapper

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
        .pipe(rename('my-name.js'))
        .pipe(gulp.dest('./'));
});
```
