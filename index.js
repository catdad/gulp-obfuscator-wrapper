/* jshint node: true, unused: true */

var path = require('path');

var _ = require('lodash');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;

var readVinylStream = require('read-vinyl-file-stream');

var obfuscator = require('obfuscator').obfuscator;
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

    return readVinylStream(function iterator(content, file, stream, cb) {
        firstFile = firstFile || file;

        var fullBase = path.resolve('.', file.base);
        var fileKey = path.relative(fullBase, file.path);

        fileStore[fileKey] = content;

        cb();
    }, function flush(stream, cb) {
        var fileList = _.keys(fileStore);

        if (fileList.length === 0) {
            return cb();
        }

        register(obfuscator, fileStore);

        var entry = options.entry;
        var strings = options.strings;

        // run obfuscation
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

            stream.push(file);
            cb();
        });
    }, 'buffer');
};
