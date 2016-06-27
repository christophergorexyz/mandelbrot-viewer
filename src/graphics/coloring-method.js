import assign from 'lodash.assign';
import palette from './palette';

//this is a bitshift operation, not a boolean comparison
//i normally wouldn't, but it's really convenient here
const MAX_RADIUS_CONTINUOUS = (1 << 16);

const MAX_RADIUS_DISTANCE_ESTIMATION = (1 << 20);

const MAX_RADIUS_ESCAPE_TIME = (1 << 2);

const MAX_ITERATIONS = 1000;

const DEFAULT_SETTINGS = {
    palette: 'default',
    mandelbrotColor: {
        r: 0,
        g: 0,
        b: 0
    }
};

function _escapeTime(x0, y0, options) {
    options = assign({}, DEFAULT_SETTINGS, options);
    var _palette = palette[options.palette];
    var _maxIterations = MAX_ITERATIONS + (MAX_ITERATIONS % _palette.length);

    var x = 0.0;
    var y = 0.0;
    var iteration = 0;

    while (x * x + y * y < MAX_RADIUS_ESCAPE_TIME && iteration < _maxIterations) {
        var tempX = x * x - y * y + x0;
        y = 2 * x * y + y0;
        x = tempX;
        iteration++;
    }

    //deafult to black unless we managed to rule this pixel out
    var color = options.mandelbrotColor;

    if (iteration < _maxIterations) {
        color = _palette[Math.floor(iteration % _palette.length)];
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
        b: _interpolateValue(color1.b, color2.b, fraction),
    };
}

function _continuousColoring(x0, y0, options) {
    options = assign({}, DEFAULT_SETTINGS, options);
    var _palette = palette[options.palette];
    var _maxIterations = MAX_ITERATIONS + (MAX_ITERATIONS % _palette.length);


    var x = 0.0;
    var y = 0.0;
    var iteration = 0;
    while (x * x + y * y < MAX_RADIUS_CONTINUOUS * 2 && iteration < _maxIterations) {
        var tempX = x * x - y * y + x0;
        y = 2 * x * y + y0;
        x = tempX;
        iteration++;
    }

    //deafult to black unless we managed to rule this pixel out
    var color = options.mandelbrotColor;

    if (iteration < _maxIterations) {
        //TODO: explicate the math here–  not it's non-trivial
        var log_zn = Math.log(x * x + y * y) / 2;
        var nu = Math.log(log_zn / Math.log(2)) / Math.log(2);
        iteration = iteration + 1 - nu;

        var color1 = _palette[Math.floor(iteration) % _palette.length];
        var color2 = _palette[(Math.floor(iteration) + 1) % _palette.length];

        color = _interpolateColor(color1, color2, iteration % 1);
    }

    return color;
}

function _exteriorDistanceEstimation(cx, cy, options) {
    options = assign({}, DEFAULT_SETTINGS, options);
    var _palette = palette[options.palette];
    var _maxIterations = MAX_ITERATIONS + (MAX_ITERATIONS % _palette.length);


    var zx = 0.0;
    var zy = 0.0;
    var dx = 0.0;
    var dy = 0.0;
    var iteration = 0;
    while (zx * zx + zy * zy < MAX_RADIUS_DISTANCE_ESTIMATION && iteration < _maxIterations) {

        dx = 2 * zx * dx - 2 * zy * dx + 1;
        dy = 4 * zx * dy;

        var tempZx = zx * zx - zy * zy + cx;
        zy = 2 * zx * zy + cy;
        zx = tempZx;
        iteration++;
    }

    var distanceEstimate = Math.sqrt((zx * zx + zy * zy) / (dx * dx + dy * dy)) * 0.5 * Math.log(zx * zx + zy * zy);
    //console.log(distanceEstimate);

    var color = options.mandelbrotColor;

    if (iteration < _maxIterations) {
        color = _palette[Math.floor(iteration % _palette.length)];
    }

    return color;
}

export default {
    default: _continuousColoring,
    escapeTime: _escapeTime,
    continuousColoring: _continuousColoring,
    exteriorDistanceEstimation: _exteriorDistanceEstimation
};
