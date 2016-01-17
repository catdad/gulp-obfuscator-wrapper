/* jshint node: true, mocha: true, expr: true */

var expect = require('chai').expect;

var File = require('gulp-util').File;
var es = require('event-stream');

var reader = require('../lib/read-vinyl.js');

describe('[Read Vinyl]', function() {
    it('takes a vinyl file');
    
    it('reads a vinyl stream file', function(done) {
        var file = new File({
            contents: new Buffer('llama'),
            path: 'file.ext',
            base: __dirname
        });
        
        reader(file, 'utf8', function(err, data) {
            expect(err).to.be.undefined;
            expect(data).to.equal('llama');
            done();
        });
    });
    
    it('reads a vinyl buffer file', function(done) {
        var file = new File({
            contents: es.readArray(['llama']),
            path: 'file.ext',
            base: __dirname
        });
        
        reader(file, 'utf8', function(err, data) {
            expect(err).to.be.undefined;
            expect(data).to.equal('llama');
            done();
        });
    });
    
    
});
