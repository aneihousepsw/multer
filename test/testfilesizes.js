var fs = require('fs');

var TestFileSizes ={

    EmptySize: 0,
    LargeSize: fs.statSync(__dirname + '/files/large.jpg')['size'],
    MediumSize: fs.statSync(__dirname + '/files/medium.dat')['size'],
    Small0Size: fs.statSync(__dirname + '/files/small0.dat')['size'],
    Small1Size: fs.statSync(__dirname + '/files/small1.dat')['size'],
    Tiny0Size: fs.statSync(__dirname + '/files/tiny0.dat')['size'],
    Tiny1Size: fs.statSync(__dirname + '/files/tiny1.dat')['size']

};

Object.freeze(TestFileSizes);

module.exports = TestFileSizes;