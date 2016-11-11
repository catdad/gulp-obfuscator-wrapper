/* jshint node: true, mocha: true, expr: true */

var expect = require('chai').expect;
var path = require('path');

var obfuscator = require('../index.js');
var Vinyl = require('gulp-util').File;
var shellton = require('shellton');
var through = require('through2');
var gulp = require('gulp');

function File(name, content) {
    return new Vinyl({
        contents: new Buffer(content),
        path: path.resolve('.', name),
        base: path.resolve('.')
    });
}

function execute(code, done) {
    var input = through();

    shellton({
        task: 'node',
        stdin: input
    }, done);

    input.write(code);
    input.end();
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

    it('produces a JS file that executes in Node', function(done) {
        // let's execute the file
        var source = obfuscator({ entry: 'one.js', strings: false });
        var content;

        source.on('data', function(chunk) {
            content = chunk.contents.toString();
        });

        source.on('end', function() {
            execute(content, function(err, stdout, stderr) {
                expect(err).to.not.be.ok;
                expect(stdout.trim()).to.equal('llama');
                expect(stderr.trim()).to.equal('');

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

    it('obfuscates the fixtures files using gulp', function(done) {
        var output;

        var BASE = path.resolve(process.cwd(), 'fixtures', 'root');

        gulp.src('fixtures/root/**', { base: BASE })
            .pipe(obfuscator({
                entry: 'fixtures/root/main.js'
            })).on('data', function(vinylFile) {
                if (output) {
                    throw new Error('only one file should be written after obfuscation');
                }

                output = vinylFile;
            }).on('end', function() {
                expect(Buffer.isBuffer(output.contents)).to.equal(true);
                expect(output.contents.toString()).to.have.length.above(0);

                // test that, by default, strings are obfuscated
                expect(output.contents.toString()).to.not.match(/pineapples/);

                // make sure code executes correctly
                execute(output.contents, function(err, stdout, stderr) {
                    expect(err).to.equal(null);
                    expect(stdout).to.be.a('string');
                    expect(stdout.trim()).to.equal('pineapples');

                    expect(stderr).to.be.a('string')
                        .and.to.have.lengthOf(0);

                    done();
                });
            });
    });

    it('optionally skips obfuscating strings', function(done) {
        var output;

        var BASE = path.resolve(process.cwd(), 'fixtures/root');

        gulp.src('fixtures/root/**', { base: BASE })
            .pipe(obfuscator({
                entry: 'fixtures/root/main.js',
                strings: false
            })).on('data', function(vinylFile) {
                if (output) {
                    throw new Error('only one file should be written after obfuscation');
                }

                output = vinylFile;
            }).on('end', function() {
                expect(Buffer.isBuffer(output.contents)).to.equal(true);
                expect(output.contents.toString()).to.have.length.above(0);

                // the original string should appear in the file
                expect(output.contents.toString()).to.match(/pineapples/);

                // make sure code executes correctly
                execute(output.contents, function(err, stdout, stderr) {
                    expect(err).to.equal(null);
                    expect(stdout).to.be.a('string');
                    expect(stdout.trim()).to.equal('pineapples');

                    expect(stderr).to.be.a('string')
                        .and.to.have.lengthOf(0);

                    done();
                });
            });
    });

    it('creates a new vinyl file in the location of the base as defined in gulp.src', function(done) {
        var output;

        var BASE = path.resolve(process.cwd(), 'fixtures/root');

        gulp.src('fixtures/root/**', { base: BASE })
            .pipe(obfuscator({
                entry: 'fixtures/root/main.js'
            })).on('data', function(vinylFile) {
                if (output) {
                    throw new Error('only one file should be written after obfuscation');
                }

                output = vinylFile;
            }).on('end', function() {
                expect(output.base).to.equal(BASE);
                expect(output.path).to.equal(path.join(BASE, 'obfuscated.js'));

                done();
            });
    });

    it('used the base in gulp.src even when it does not make sense', function(done) {
        var output;

        var BASE = path.resolve(process.cwd());

        gulp.src('fixtures/root/**', { base: BASE })
            .pipe(obfuscator({
                entry: 'fixtures/root/main.js'
            })).on('data', function(vinylFile) {
                if (output) {
                    throw new Error('only one file should be written after obfuscation');
                }

                output = vinylFile;
            }).on('end', function() {
                expect(output.base).to.equal(BASE);
                expect(output.path).to.equal(path.join(BASE, 'obfuscated.js'));

                done();
            });
    });

    it('figures out the base if one is not defined in gulp.src', function(done) {
        var output;

        var BASE = path.resolve(process.cwd(), 'fixtures', 'root');

        gulp.src('fixtures/root/**')
            .pipe(obfuscator({
                entry: 'fixtures/root/main.js'
            })).on('data', function(vinylFile) {
                if (output) {
                    throw new Error('only one file should be written after obfuscation');
                }

                output = vinylFile;
            }).on('end', function() {
                // make sure to normalize both paths, since base could include a trailing slash
                expect(path.join(output.base, '.')).to.equal(path.join(BASE, '.'));

                expect(output.path).to.equal(path.join(BASE, 'obfuscated.js'));

                done();
            });
    });

    it('does nothing if no files are matched', function(done) {
        gulp.src('nonexistent/**')
            .pipe(obfuscator({
                entry: 'nonexistent/file.js'
            }))
            .on('data', function(vinylFile) {
                return done(new Error('no files should be written during this test'));
            })
            .on('end', done);
    });

    it('obfuscates files with an entry not in the base', function(done) {
        var output;

        var BASE = path.resolve(process.cwd(), 'fixtures', 'not-root', 'with', 'deep');

        gulp.src('fixtures/not-root/with/deep/**', { base: BASE })
            .pipe(obfuscator({
                entry: 'fixtures/not-root/with/deep/files/main.js',
                strings: false
            })).on('data', function(vinylFile) {
                if (output) {
                    throw new Error('only one file should be written after obfuscation');
                }

                output = vinylFile;
            }).on('end', function() {
                expect(Buffer.isBuffer(output.contents)).to.equal(true);
                expect(output.contents.toString()).to.have.length.above(0);

                // the original string should appear in the file
                expect(output.contents.toString()).to.match(/bananas/);

                // make sure code executes correctly
                execute(output.contents, function(err, stdout, stderr) {
                    expect(err).to.equal(null);
                    expect(stdout).to.be.a('string');
                    expect(stdout.trim()).to.equal('bananas');

                    expect(stderr).to.be.a('string')
                        .and.to.have.lengthOf(0);

                    done();
                });
            });
    });

    it('obfuscates files with an entry not in the base, using absolute paths', function(done) {
        var output;

        var BASE = path.resolve(process.cwd(), 'fixtures', 'not-root', 'with', 'deep');

        gulp.src(path.join(BASE, '**'), { base: BASE })
            .pipe(obfuscator({
                entry: path.join(BASE, 'files/main.js'),
                strings: false
            })).on('data', function(vinylFile) {
                if (output) {
                    throw new Error('only one file should be written after obfuscation');
                }

                output = vinylFile;
            }).on('end', function() {
                expect(Buffer.isBuffer(output.contents)).to.equal(true);
                expect(output.contents.toString()).to.have.length.above(0);

                // the original string should appear in the file
                expect(output.contents.toString()).to.match(/bananas/);

                // make sure code executes correctly
                execute(output.contents, function(err, stdout, stderr) {
                    expect(err).to.equal(null);
                    expect(stdout).to.be.a('string');
                    expect(stdout.trim()).to.equal('bananas');

                    expect(stderr).to.be.a('string')
                        .and.to.have.lengthOf(0);

                    done();
                });
            });
    });
});

describe('[Register]', function() {
    it('gets called once per vinyl file');
    it('wraps the code');
});
