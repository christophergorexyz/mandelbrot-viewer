const MAX_SAMPLES = 1 << 10;
const MAX_RADIUS = 1 << 16;

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
export function julia(
  zr = 0,
  zi = 0,
  cr = 0,
  ci = 0,
  maxRadius = MAX_RADIUS,
  maxSamples = MAX_SAMPLES
) {
  let escaped = false;
  let orbitDistance = 0;
  let orbitPoints = [{
    zr,
    zi
  }];

  while (!escaped && orbitPoints.length < maxSamples) {
    //this is literally just the FOIL method
    //we subtract the Last terms from the First because `i**2===-1`, and they are
    //no longer imaginary, then we combine the Inside and Outside because they are
    let tempR = zr * zr - zi * zi + cr;
    zi = 2 * zr * zi + ci;
    zr = tempR;

    orbitDistance = zr * zr + zi * zi; //pythagoras
    escaped = orbitDistance >= maxRadius;

    orbitPoints.push({
      zr,
      zi
    });
  }

  let iterations = orbitPoints.length;

  return {
    escaped,
    iterations,
    orbitPoints,
    orbitDistance
  };
}
