/* jshint node: true */

var es = require('event-stream');

module.exports = function(file, enc, callback) {
    var err = new Error('unknown file');
    enc = enc || 'utf8';
    
    // continue if the file is null
    if (file.isNull()) {
        return callback(err);
    }

    if (file.isStream()) {
        file.contents.pipe(es.wait(function(err, data) {
            callback(err || undefined, data.toString(enc));
        }));
    } else if (file.isBuffer()) {
        var data = file.contents.toString(enc);
        callback(undefined, data);
    } else {
        callback(err);
    }
};
