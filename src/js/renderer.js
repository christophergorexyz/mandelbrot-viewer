import palette from './palette';

//the bounds of the set
const LEFT_EDGE = -2.5;
const RIGHT_EDGE = 1;
const TOP_EDGE = -1;
const BOTTOM_EDGE = 1;

//because the bounds of the set are uneven, we're horizontally offset this much
const HORIZONTAL_OFFSET = LEFT_EDGE - ((RIGHT_EDGE - LEFT_EDGE) / 2);

//width / height ratio of the bounds of the set
const MANDEL_RATIO = (RIGHT_EDGE - LEFT_EDGE) / (BOTTOM_EDGE - TOP_EDGE);

const MIMETYPE_PNG = 'image/png';

const DEFAULT_SETTINGS = {
    palette: 'rainbow',
    maxIterations: 1000, //probably better NOT to set this in the options
    mandelbrotColor: {
        r: 0,
        g: 0,
        b: 0
    }
};

export default class Renderer {
    constructor(canvas, options) {
        this._canvas = canvas;
        this._context = this._canvas.getContext('2d');
        this._imageData = this._context.createImageData(this._canvas.width, this._canvas.height);
        this._data = this._imageData.data;

        this._maxIterations = options.maxIterations || DEFAULT_SETTINGS.maxIterations;
        this._mandelbrotColor = options.mandelbrotColor || DEFAULT_SETTINGS.mandelbrotColor;
        this._palette = palette[options.palette || DEFAULT_SETTINGS.palette];

        //TODO: decide if this is beset approach.
        //is it better to let user be absolute in this?
        //or to enforce perfect cycle of palette?
        this._maxIterations = this._maxIterations + (this._maxIterations % this._palette.length);

        this.updateViewportSize();

        this._scale = 1;
        this._dx = HORIZONTAL_OFFSET;
        this._dy = 0;
    }

    updateViewportSize() {
        //width / height ratio of the viewport
        this._imageRatio = this._imageData.width / this._imageData.height;

        var ratio = 1;
        var product = 0;

        //modify the bounds we display based on the
        //difference between the viewport ratio and
        //the ratio of the bounds of the mandelbrot
        if (this._imageRatio > MANDEL_RATIO) {
            ratio = (this._imageRatio / MANDEL_RATIO);
            product = (RIGHT_EDGE - LEFT_EDGE) * ratio;

            //TODO: this shouldn't work, magic numbers, etc
            this._leftEdge = -product / (2 * (2.5 / 3.5));
            this._rightEdge = product / (2 * (3.5 / 2.5));

            this._topEdge = TOP_EDGE;
            this._bottomEdge = BOTTOM_EDGE;
        } else {
            ratio = (MANDEL_RATIO / this._imageRatio);
            product = (BOTTOM_EDGE - TOP_EDGE) * ratio;

            this._topEdge = -product / 2;
            this._bottomEdge = product / 2;

            this._leftEdge = LEFT_EDGE;
            this._rightEdge = RIGHT_EDGE;
        }
    }

    get DataUrl() {
        return this._canvas.toDataURL(MIMETYPE_PNG);
    }

    get x() {
        return this._dx;
    }

    get y() {
        return this._dy;
    }

    get scale() {
        return this._scale;
    }

    plot(x, y, color) {
        var dataIndex = (y * this._imageData.width + x) * 4;
        this._data[dataIndex] = color.r;
        this._data[dataIndex + 1] = color.g;
        this._data[dataIndex + 2] = color.b;
        this._data[dataIndex + 3] = 255; //max saturation
    }

    //scale: how far we've zoomed in from the default
    //dx0: displacement of perspective horizontally
    //dy0: displacement of perspective vertically
    render(scale, dx0, dy0) {
        this._scale = scale;
        this._dx = dx0 - HORIZONTAL_OFFSET / this._scale;
        this._dy = dy0;

        var leftEdge = LEFT_EDGE;
        var rightEdge = RIGHT_EDGE;
        var topEdge = TOP_EDGE;
        var bottomEdge = BOTTOM_EDGE;

        //the Real (ℝ) boundaries of the rendering given the zoom and offset
        var xMax = rightEdge / this._scale + this._dx;
        var xMin = leftEdge / this._scale + this._dx;
        var yMax = bottomEdge / this._scale + this._dy;
        var yMin = topEdge / this._scale + this._dy;

        //translation of "Pixel space" to Real (ℝ) space
        //i.e., these variables represent the Real difference
        //between two pixels, horizonatally and vertically
        var xStep = (xMax - xMin) / this._imageData.width;
        var yStep = (yMax - yMin) / this._imageData.height;

        //An implementation of the Escape Time Algorithm
        //https://en.wikipedia.org/wiki/Mandelbrot_set#Escape_time_algorithm
        for (var canvasY = 0; canvasY < this._imageData.height; canvasY++) {
            for (var canvasX = 0; canvasX < this._imageData.width; canvasX++) {
                //the canvas pixel data is a bit awkward to get at...
                //see: https://www.w3.org/TR/2dcontext/#pixel-manipulation

                //scale the pixel values to frame the bounds of the set
                var x0 = xMin + xStep * canvasX;
                var y0 = yMin + yStep * canvasY;

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

                this.plot(canvasX, canvasY, color);
            }
        }
        //draw it!
        this._context.putImageData(this._imageData, 0, 0);
    }
}
