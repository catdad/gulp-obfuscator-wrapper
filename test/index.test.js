/* jshint node: true, mocha: true, expr: true */

var expect = require('chai').expect;
var path = require('path');

var obfuscator = require('../index.js');
var Vinyl = require('gulp-util').File;
var shellton = require('shellton');

function File(name, content) {
    return new Vinyl({
        contents: new Buffer(content),
        path: path.join(__dirname, name),
        base: __dirname
    });
}

describe('[Index]', function() {
    it('takes an options object and returns a stream', function() {
        var out = obfuscator({
            entry: 'main.js'
        });
        
        // test for pipe
        expect(out).to.have.property('pipe').and.to.be.a('function');
        expect(out).to.have.property('readable').and.to.equal(true);
        expect(out).to.have.property('writable').and.to.equal(true);
    });
    
    it('accepts vinyl files and returns 1 vinyl file', function(done) {
        var source = obfuscator({ entry: 'one.js' });
        var count = 0;
        source.on('data', function(chunk) {
            count++;
            
            expect(Vinyl.isVinyl(chunk)).to.equal(true);
            expect(chunk.contents).to.be.instanceof(Buffer);
            
            var content = chunk.contents.toString();
            
            // match the content of both files
            expect(content).to.match(/([a-zA-Z]{1,})\=1\;console\.log\(\1\)/);
            expect(content).to.match(/([a-zA-Z]{1,})\=2\;console\.log\(\1\)/);
        });
        
        source.on('end', function() {
            expect(count).to.equal(1);
            done();
        });
        
        source.on('error', function(err) {
            throw err;
        });
        
        source.write(File('one.js', 'var one = 1; console.log(one)'));
        source.write(File('two.js', 'var two = 2; console.log(two)'));
        
        source.end();
    });
    
    xit('produces a JS file that executes in Node', function(done) {
        // let's execute the file
        var source = obfuscator({ entry: 'one.js' });
        var content;
        
        source.on('data', function(chunk) {
            content = chunk.contents.toString();
        });
        
        source.on('end', function() {
            shellton('node -e "' + content + '"', function(err, stdout) {
                console.log(err);
                console.log(stdout);
                done();
            });
        });
        
        source.write(File('one.js', 'console.log(\'llama\')'));
        
        source.end();
    });
    
    it('throws if no entry file is specified', function() {
        var guilty = function() {
            var source = obfuscator();    
        };
        
        expect(guilty).to.throw(Error, 'options.entry is required');
    });
    
    it('handles errors with obfuscating the files', function(done) {
        var source = obfuscator({ entry: 'one.js' });

        source.on('data', function(chunk) {
            throw new Error('expected the task to fail');
        });
        
        source.on('end', function() {
            throw new Error('expected the stream to error and not end');
        });
        
        source.on('error', function(err) {
            expect(err).to.be.instanceof(Error);
            expect(err).to.have.property('plugin').and.to.equal('gulp-obfuscator-wrapper');
            expect(err).to.have.property('message').and.to.match(/Obfuscation error\:/i);
            expect(err).to.have.property('message').and.to.match(/unexpected token punc/i);
            
            done();
        });
        
        // Uglify cannot handle object expansion yet, so this will error
        source.write(File('one.js', 'var one = 1; var two = { one };'));
        
        source.end();
    });
});

describe('[Register]', function() {
    it('gets called once per vinyl file');
    it('wraps the code');
});
