//the bounds of the set
const LEFT_EDGE = -2.5;
const RIGHT_EDGE = 1;
const TOP_EDGE = -1;
const BOTTOM_EDGE = 1;
const HORIZONTAL_OFFSET = LEFT_EDGE - ((RIGHT_EDGE - LEFT_EDGE) / 2);
const MANDEL_RATIO = (RIGHT_EDGE - LEFT_EDGE) / (BOTTOM_EDGE - TOP_EDGE);

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
    constructor(canvas, options) {
        this._canvas = canvas;
        this._context = this._canvas.getContext('2d');
        this._imageData = this._context.createImageData(this._canvas.width, this._canvas.height);
        this._data = this._imageData.data;

        this._imageRatio = this._imageData.width / this._imageData.height;

        this._maxIterations = options.maxIterations || DEFAULT_SETTINGS.maxIterations;
        this._mandelbrotColor = options.mandelbrotColor || DEFAULT_SETTINGS.mandelbrotColor;
        this._palette = require('palette')[options.palette || DEFAULT_SETTINGS.palette];
    }

    get DataUrl() {
        return this._canvas.toDataURL('image/png');
    }

    plot(x, y, color) {
        var dataIndex = (y * this._imageData.width + x) * 4;
        this._data[dataIndex] = color.r;
        this._data[dataIndex + 1] = color.g;
        this._data[dataIndex + 2] = color.b;
        this._data[dataIndex + 3] = 255; //max saturation
    }

    render(scale, dx0, dy0) {
        var zoom = scale;
        var dx = dx0 - HORIZONTAL_OFFSET / zoom;
        var dy = dy0;

        var leftEdge = LEFT_EDGE;
        var rightEdge = RIGHT_EDGE;
        var topEdge = TOP_EDGE;
        var bottomEdge = BOTTOM_EDGE;

        var ratio = 1;
        var difference = 0;

        if (this.imageRatio > MANDEL_RATIO) {
            ratio = (this._imageRatio / MANDEL_RATIO);
            difference = (RIGHT_EDGE - LEFT_EDGE) * ratio;

            //TODO: this shouldn't work
            leftEdge = -difference / (2 * (2.5 / 3.5));
            rightEdge = difference / (2 * (3.5 / 2.5));

            topEdge = TOP_EDGE;
            bottomEdge = BOTTOM_EDGE;
        } else if (this._imageRatio < MANDEL_RATIO) {
            ratio = (MANDEL_RATIO / this._imageRatio);
            difference = (BOTTOM_EDGE - TOP_EDGE) * ratio;

            topEdge = -difference / 2;
            bottomEdge = difference / 2;

            leftEdge = LEFT_EDGE;
            rightEdge = RIGHT_EDGE;
        }

        var xMax = rightEdge / zoom + dx;
        var xMin = leftEdge / zoom + dx;
        var yMax = bottomEdge / zoom + dy;
        var yMin = topEdge / zoom + dy;

        var xStep = (xMax - xMin) / this._imageData.width;
        var yStep = (yMax - yMin) / this._imageData.height;

        //An implementation of the Escape Time Algorithm
        //https://en.wikipedia.org/wiki/Mandelbrot_set#Escape_time_algorithm
        for (var py = 0; py < this._imageData.height; py++) {
            for (var px = 0; px < this._imageData.width; px++) {
                //the canvas pixel data is a bit awkward to get at...
                //see: https://www.w3.org/TR/2dcontext/#pixel-manipulation

                //scale the pixel values to frame the bounds of the set
                var x0 = xMin + xStep * px;
                var y0 = yMin + yStep * py;

                var x = 0.0;
                var y = 0.0;

                var iteration = 0;
                while (x * x + y * y < 2 * 2 && iteration < this._maxIterations) {
                    var tempX = x * x - y * y + x0;
                    y = 2 * x * y + y0;
                    x = tempX;
                    iteration++;
                }

                //if we've maxed out our iterations, it's a close
                //enough approximation, so color it black
                var color = iteration === this._maxIterations ? this._mandelbrotColor : this._palette.rainbow[iteration % this._palette.length];

                this.plot(px, py, color);
            }
        }
        //draw it!
        this._context.putImageData(this._imageData, 0, 0);
    }

}

module.exports = Renderer;