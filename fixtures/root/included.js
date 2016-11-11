/* jshint node: true */

var anotherFile = require('./sub/another-file.js');

module.exports = function() {
    return anotherFile();
};
