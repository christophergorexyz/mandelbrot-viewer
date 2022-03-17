"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var DEFAULT_SETTINGS = {
  mandelbrotColor: {
    r: 0,
    g: 0,
    b: 0
  },
  loopPalette: false
};

function loopPalette(palette) {
  if (palette.length > 2) {
    return palette.concat(palette.slice(1, palette.length - 1).reverse());
  }

  return palette;
} //An implementation of the Escape Time Algorithm with continuous coloring
//almost directly from https://en.wikipedia.org/wiki/Mandelbrot_set#Escape_time_algorithm
//with https://en.wikipedia.org/wiki/Mandelbrot_set#Continuous_.28smooth.29_coloring


function _escapeTime(sample, options) {
  options = Object.assign({}, DEFAULT_SETTINGS, options);

  var _palette = options.loopPalette ? loopPalette(options.palette) : options.palette; //deafult to black unless we managed to rule this pixel out


  var color = options.mandelbrotColor;

  if (sample.escaped) {
    color = _palette[Math.floor(sample.iterations % _palette.length)];
  }

  return color;
}

function _interpolateValue(val1, val2, fraction) {
  return (1 - fraction) * val1 + fraction * val2;
}

function _interpolateColor(color1, color2, fraction) {
  return {
    r: _interpolateValue(color1.r, color2.r, fraction),
    g: _interpolateValue(color1.g, color2.g, fraction),
    b: _interpolateValue(color1.b, color2.b, fraction)
  };
}

function _continuousColoring(sample, options) {
  options = Object.assign({}, DEFAULT_SETTINGS, options);

  var _palette = options.loopPalette ? loopPalette(options.palette) : options.palette; //deafult to black unless we managed to rule this pixel out


  var color = options.mandelbrotColor;

  if (sample.escaped) {
    //TODO: explicate the math here–  it's non-trivial
    var log_zn = Math.log(sample.orbitDistance) / 2;
    var nu = Math.log(log_zn / Math.log(2)) / Math.log(2);
    var fraction = sample.iterations + 1 - nu;

    var color1 = _palette[Math.floor(fraction) % _palette.length];

    var color2 = _palette[(Math.floor(fraction) + 1) % _palette.length];

    color = _interpolateColor(color1, color2, fraction % 1);
  }

  return color;
}

var _default = {
  'default': _escapeTime,
  'escape-time': _escapeTime,
  'continuous-coloring': _continuousColoring
};
exports["default"] = _default;
//# sourceMappingURL=coloring-method.js.map