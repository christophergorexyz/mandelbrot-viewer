//the bounds of the set
const LEFT_EDGE = -2.5;
const RIGHT_EDGE = 1;
const TOP_EDGE = -1;
const BOTTOM_EDGE = 1;
const HORIZONTAL_OFFSET = LEFT_EDGE - ((RIGHT_EDGE - LEFT_EDGE) / 2);
const MANDEL_RATIO = (RIGHT_EDGE - LEFT_EDGE) / (BOTTOM_EDGE - TOP_EDGE);

      var _mandelRatio = (initRightEdge - initLeftEdge) / (initBottomEdge - initTopEdge);

const DEFAULT_SETTINGS = {
    palette: 'rainbow',
    maxIterations: 1000,
    mandelbrotColor: {
        r: 0,
        g: 0,
        b: 0
    }
};

class Renderer {
    constructor(canvasContext, options) {
        this._context = canvasContext;
        this._maxIterations = options.maxIterations || DEFAULT_SETTINGS.maxIterations;
        this._mandelbrotColor = options.mandelbrotColor || DEFAULT_SETTINGS.mandelbrotColor;
        this._palette = require('palette')[options.palette || DEFAULT_SETTINGS.palette];
}

    plot(x, y, color) {
        this.context
    }

    render(scale, dx0, dy0) {
        var zoom = scale;
        var dx = dx0 - HORIZONTAL_OFFSET / zoom;
        var dy = dy0;

        if (_imageRatio > _mandelRatio) {
            var percentage = (_imageRatio / MANDEL_RATIO);
            var difference = (RIGHT_EDGE - LEFT_EDGE) * percentage;

            //TODO: this shouldn't work
            leftEdge = -difference / (2 * (2.5 / 3.5));
            rightEdge = difference / (2 * (3.5 / 2.5));

            topEdge = initTopEdge;
            bottomEdge = initBottomEdge;
        } else if (_imageRatio < _mandelRatio) {
            var percentage = (_mandelRatio / _imageRatio);
            var difference = (initBottomEdge - initTopEdge) * percentage;
            topEdge = -difference / 2;
            bottomEdge = difference / 2;
            leftEdge = initLeftEdge;
            rightEdge = initRightEdge;
        }

        pMax = rightEdge / zoom + dx;
        pMin = leftEdge / zoom + dx;
        qMax = bottomEdge / zoom + dy;
        qMin = topEdge / zoom + dy;

        xStep = (pMax - pMin) / _imageData.width;
        yStep = (qMax - qMin) / _imageData.height;

        //An implementation of the Escape Time Algorithm
        //https://en.wikipedia.org/wiki/Mandelbrot_set#Escape_time_algorithm
        for (var py = 0; py < _imageData.height; py++) {
            for (var px = 0; px < _imageData.width; px++) {
                //the canvas pixel data is a bit awkward to get at...
                //see: https://www.w3.org/TR/2dcontext/#pixel-manipulation
                var dataIndex = (py * _imageData.width + px) * 4;

                //scale the pixel values to frame the bounds of the set
                var x0 = pMin + xStep * px;
                var y0 = qMin + yStep * py;

                var x = 0.0;
                var y = 0.0;

                var iteration = 0;
                while (x * x + y * y < 2 * 2 && iteration < _maxIterations) {
                    var tempX = x * x - y * y + x0;
                    y = 2 * x * y + y0;
                    x = tempX;
                    iteration++;
                }

                //if we've maxed out our iterations, it's a close
                //enough approximation, so color it black
                var color = iteration === _maxIterations ? _palette._black : _palette.rainbow[iteration % _palette.length];

                _data[dataIndex] = color.r;
                _data[dataIndex + 1] = color.g;
                _data[dataIndex + 2] = color.b;
                _data[dataIndex + 3] = 255;
            }
        }
        //draw it!
        _context.putImageData(_imageData, 0, 0);
        _writeStatus();
        document.getElementById('get-png').href = _canvas.toDataURL('image/png');
    }

}

module.exports = Renderer;
