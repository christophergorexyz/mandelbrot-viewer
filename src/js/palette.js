/*
 * the following loop was
 * modified from rainbowify
 * (https://github.com/maxogden/rainbowify)
 * which lifted from mocha
 * (https://github.com/visionmedia/mocha/blob/master/lib/reporters/nyan.js)
 * to generate the color palette
 */
var _rainbow = [];
for (var i = 0; i < (6 * 7); i++) {
    var pi3 = Math.floor(Math.PI / 3);
    var n = (i * (1.0 / 6));

    var r = Math.floor(3 * Math.sin(n) + 3) * 255 / 5;
    var g = Math.floor(3 * Math.sin(n + 2 * pi3) + 3) * 255 / 5;
    var b = Math.floor(3 * Math.sin(n + 4 * pi3) + 3) * 255 / 5;

    _rainbow.push({
        r: r,
        g: g,
        b: b
    });
}


export default {
    rainbow: _rainbow
};

//TODO:
// 1. create additional predefined palettes
// 2. develop interface for saving/loading user-defined palettes to local storage
