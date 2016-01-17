/* jshint node: true */

var path = require('path');

var _ = require('lodash');
var through = require('through2');
var gutil = require('gulp-util');
var File = gutil.File;
var PluginError = gutil.PluginError;

var obfuscator = require('obfuscator').obfuscator;
var reader = require('./lib/read-vinyl.js');
var register = require('./lib/register.js');

var pluginName = 'gulp-obfuscator-wrapper';

module.exports = function(options) {
    options = options || {};
    
    if (!options.entry) {
        throw new PluginError(pluginName, 'options.entry is required');
    }
    
    options = _.defaults(options, {
        strings: true
    });
    
    var fileStore = {};
    var firstFile;
    
    function bufferContents(file, enc, cb) {
        firstFile = firstFile || file;
        
        var fullBase = path.resolve('.', file.base);
        var fileKey = path.relative(fullBase, file.path);
        
        reader(file, enc, function(err, content, filepath) {
            if (err) {
                return cb(err);
            }
            
            fileStore[fileKey] = content;
            cb();
        });
    }
    
    function endStream(cb) {
        var that = this;
        var base = firstFile.base;
        
        register(obfuscator, fileStore);
        
        // run obfuscation
        var fileList = _.keys(fileStore);
        var entry = options.entry;
        var strings = options.strings;
        
        var obfuscatorOptions = obfuscator.Options(fileList, './', entry, strings);
        obfuscatorOptions.compressor = options.compressor || {};
        
        obfuscator(obfuscatorOptions, function(err, obfuscated) {
            if (err) {
                err = new PluginError(pluginName, 'Obfuscation error: ' + err.message);
                return cb(err);
            }
            
            var file = firstFile.clone({ contents: false });
            file.path = path.join(firstFile.base, 'obfuscated.js');
            file.contents = new Buffer(obfuscated);
            
            that.push(file);
            cb();
        });
    }
    
    return through.obj(bufferContents, endStream);
};
