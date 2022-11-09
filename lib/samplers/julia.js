"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.julia = julia;
var MAX_SAMPLES = 1 << 10;
var MAX_RADIUS = 1 << 16;

/**
 * a complex number, c, belongs to The Mandelbrot Set if the iterative application
 * of the function f(z)=z^2+c, starting at z=0, does not result in divergence
 * beyond a specified radius before a specified number of iterations
 *
 * a complex number, z, belongs to The Julia Set if the iterative application
 * of the function f(z)=z^2+c, where c is a constant, does not result in divergence
 * beyond a specified radius before a specified number of iterations
 *
 * @param {Number?} zr the real part of the complex number
 * @param {Number?} zi the imaginary part of the complex number
 * @param {Number?} cr the real part of the complex number
 * @param {Number?} ci the imaginary part of the complex number
 * @param {Number?} maxRadius the maximum distance an orbit point may be
 * @param {Number?} maxSamples the maximum number of samples to take before assuming the orbit does not diverge
 */
function julia() {
  var zr = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
  var zi = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var cr = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
  var ci = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
  var maxRadius = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : MAX_RADIUS;
  var maxSamples = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : MAX_SAMPLES;
  var escaped = false;
  var orbitDistance = 0;
  var orbitPoints = [{
    zr: zr,
    zi: zi
  }];
  while (!escaped && orbitPoints.length < maxSamples) {
    //this is literally just the FOIL method
    //we subtract the Last terms from the First because `i**2===-1`, and they are
    //no longer imaginary, then we combine the Inside and Outside because they are
    var tempR = zr * zr - zi * zi + cr;
    zi = 2 * zr * zi + ci;
    zr = tempR;
    orbitDistance = zr * zr + zi * zi; //pythagoras
    escaped = orbitDistance >= maxRadius;
    orbitPoints.push({
      zr: zr,
      zi: zi
    });
  }
  var iterations = orbitPoints.length;
  return {
    escaped: escaped,
    iterations: iterations,
    orbitPoints: orbitPoints,
    orbitDistance: orbitDistance
  };
}
//# sourceMappingURL=julia.js.map