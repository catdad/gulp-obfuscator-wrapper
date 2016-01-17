/* jshint node: true */

var path = require('path');

var _ = require('lodash');
var through = require('through2');
var gutil = require('gulp-util');
var File = gutil.File;
var PluginError = gutil.PluginError;

var obfuscator = require('obfuscator').obfuscator;
var reader = require('./lib/read-vinyl.js');

module.exports = function(options) {
    var fileStore = {};
    var firstFile;
    
    function bufferContents(file, enc, cb) {
        firstFile = firstFile || file;
        
        var fullBase = path.resolve('.', file.base);
        var fileKey = path.relative(fullBase, file.path);
        
        reader(file, enc, function(err, content, filepath) {
            fileStore[fileKey] = content;
            cb();
        });
    }
    
    function endStream(cb) {
        
        var base = firstFile.base;
        
        var register = require('./lib/register.js')(obfuscator, fileStore);
        
        // run obfuscation
        var fileList = _.keys(fileStore);
        var entry = options.entry;
        var strings = options.strings;
        
        var obfuscatorOptions = obfuscator.Options(fileList, './', entry, strings);
        obfuscatorOptions.compressor = options.compressor || {};
        
        obfuscator(obfuscatorOptions, function(err, obfuscated) {
            if (err) {
                gutil.log(gutil.colors.red(err));
                console.log(err.stack);
            }
            
            gutil.log(gutil.colors.green(obfuscated));
        
            var fileOpts = {
                cwd: path.dirname(base),
                base: base,
                path: path.posix.join(base, 'name.js')
            };

            fileOpts.content = new Buffer(obfuscated);

            var joined = new File(fileOpts);

            cb(null, joined);
        });
    }
    
    return through.obj(bufferContents, endStream);
};

// pass the original obfuscator and Options objects through
module.exports.obfuscator = obfuscator;
module.exports.Options = obfuscator.Options;
