/* jshint node: true */

var path = require('path');

/**
 * Force a filepath to start with _./_
 *
 * @api private
 * @param {String} filepath
 * @return {String}
 */
function dotslash(filepath) {
    filepath = filepath.replace(/\\/g, '/');
    switch (filepath[0]) {
    case '.':
    case '/':
        return filepath;
    default:
        return './' + filepath;
    }
}

module.exports = function(obfuscator, fileStore) {
    var originalRegister = obfuscator.register.bind(obfuscator);

    // overload registe function to support vinyl streams
    // it is kind of a hack, bt works very nicely
    obfuscator.register = function(root, file, cb) {
        var rJSON = /\.json$/;

        var filename = dotslash(path.relative(root, file));

        var data = fileStore[file];

        var code =
            'require.register("' + filename + '",' + 'function (module, exports, require) {' + (rJSON.test(file)
                // just export json
                ? 'module.exports = ' + data + ';'
                // add the file as is
                : data) + '\n' + '});';
        return cb(null, code);
    };

    return obfuscator;
};
