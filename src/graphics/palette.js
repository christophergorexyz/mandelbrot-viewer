import uniqwith from 'lodash.uniqwith';

/*
 * the following loop was
 * modified from rainbowify
 * (https://github.com/maxogden/rainbowify)
 * which lifted from mocha
 * (https://github.com/visionmedia/mocha/blob/master/lib/reporters/nyan.js)
 * to generate the color palette
 */

function rgb(r, g, b) {
    return {
        r: r,
        g: g,
        b: b
    };
}
var _rainbow = [];
for (var i = 0; i < (6 * 7); i++) {
    var pi3 = Math.floor(Math.PI / 3);
    var n = (i * (1.0 / 6));

    var r = Math.floor(3 * Math.sin(n) + 3) * 255 / 5;
    var g = Math.floor(3 * Math.sin(n + 2 * pi3) + 3) * 255 / 5;
    var b = Math.floor(3 * Math.sin(n + 4 * pi3) + 3) * 255 / 5;

    _rainbow.push(rgb(r, g, b));
}

var _materialDesignRainbow500 = [
    rgb(244, 67, 54),
    rgb(233, 30, 99),
    rgb(156, 39, 176),
    rgb(103, 58, 183),
    rgb(63, 81, 181),
    rgb(33, 150, 243),
    rgb(3, 169, 244),
    rgb(0, 188, 212),
    rgb(0, 150, 136),
    rgb(76, 175, 80),
    rgb(139, 195, 74),
    rgb(205, 220, 57),
    rgb(255, 235, 59),
    rgb(255, 193, 7),
    rgb(255, 152, 0),
    rgb(255, 87, 34)
];

var _materialDesignRainbowA400 = [
    rgb(255, 23, 68),
    rgb(245, 0, 87),
    rgb(213, 0, 249),
    rgb(101, 31, 255),
    rgb(61, 90, 254),
    rgb(41, 121, 255),
    rgb(0, 176, 255),
    rgb(0, 229, 255),
    rgb(29, 233, 182),
    rgb(0, 230, 118),
    rgb(118, 255, 3),
    rgb(198, 255, 0),
    rgb(255, 234, 0),
    rgb(255, 196, 0),
    rgb(255, 145, 0),
    rgb(255, 61, 0)
];

var _grayScale = [
    rgb(255, 255, 255),
    rgb(0, 0, 0, 0)
];


export default {
    rainbow: uniqwith(_rainbow, function (val1, val2) {
        return val1.r === val2.r && val1.g === val2.g && val1.b === val2.b;
    }),
    materialDesignRainbow500: _materialDesignRainbow500,
    materialDesignRainbowA400: _materialDesignRainbowA400,
    grayScale: _grayScale
};

//TODO:
// 1. create additional predefined palettes
// 2. develop interface for saving/loading user-defined palettes to local storage
