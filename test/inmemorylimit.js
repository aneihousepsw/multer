var expect = require('chai').expect
var request = require('supertest');
var express = require('express');
var multer = require('../');
var fs = require('fs');
var rimraf = require('rimraf');
var mkdirp = require('mkdirp');
var path = require('path');
var TestFileSizes = require('./testfilesizes.js');

var dest = './temp';

// node >v10 does not parse JSON buffer too a buffer so we must detect and create a buffer within these mocha tests
function createBuffer(buff) {
    return (buff !== undefined && Buffer.isBuffer(buff)) ? buff : new Buffer(buff);
}

describe('InMemoryLimit', function () {
    
    // the mocha default 2000 ms fails in Travis builds
    // related to multer issue #65
    this.timeout(10000);
    
    // create the temp dir
    before(function (done) { mkdirp(dest, function (err) { done(); }); });
    
    // delete the temp dir after the tests are run
    after(function (done) { rimraf(dest, done); });
    
    var app = express();
    app.use(multer({
        dest: dest,
        inMemory: true,
        inMemoryLimit: 1,
        rename: function (fieldname, filename) {
            return fieldname + filename;
        }
    }));
    app.post('/', function (req, res) {
        var form = {
            body: req.body,
            files: req.files
        }
        
        res.send(form);
    });
    
    it('should handle inMemoryLimit', function (done) {
        
        request(app)
            .post('/')
            .type('form')
            .attach('large', __dirname + '/files/large.jpg')
            .field('name', 'Multer')
            .expect(200)
            .end(function (err, res) {
                var form = res.body;
                expect(err).to.be.null;
                expect(form.body).to.be.an('object');
                expect(form.body).to.have.property('name');
                expect(form.body.name).to.equal('Multer');
                expect(form.files).to.be.an('object');
                expect(form.files).to.have.property('large');
                expect(form.files.large).to.have.property('fieldname');
                expect(form.files.large.fieldname).to.equal('large');
                expect(form.files.large).to.have.property('originalname');
                expect(form.files.large.originalname).to.equal('large.jpg');
                expect(form.files.large).to.have.property('size');
                expect(form.files.large.size).to.equal(2413677);
                expect(form.files.large).to.have.property('truncated');
                expect(form.files.large.truncated).to.equal(false);
            
                // Verify that Multer automatically wrote out the file.
                expect(fs.existsSync(form.files.large.path)).to.equal(true);
            
                // The file is the expected size
                var fileStats = fs.statSync(form.files.large.path);
                expect(fileStats['size']).to.equal(TestFileSizes.LargeSize);
            
                done();
            })
    })

})
