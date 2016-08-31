import coloringMethod from './coloring-method';
import assign from 'lodash.assign';

//the bounds of the set
const LEFT_EDGE = -2.5;
const RIGHT_EDGE = 1;
const TOP_EDGE = -1;
const BOTTOM_EDGE = 1;

//because the bounds of the set are uneven, we're horizontally offset this much
const HORIZONTAL_OFFSET = LEFT_EDGE - ((LEFT_EDGE - RIGHT_EDGE) / 2);

//width / height ratio of the bounds of the set
const MANDEL_RATIO = (RIGHT_EDGE - LEFT_EDGE) / (BOTTOM_EDGE - TOP_EDGE);

const MIMETYPE_PNG = 'image/png';

const DEFAULT_SETTINGS = {
    coloringMethod: 'default',
    palette: 'default'
};

class Renderer {
    constructor(canvas, options) {

        this._options = assign({}, DEFAULT_SETTINGS, options);

        this._canvas = canvas;
        this._context = this._canvas.getContext('2d');
        this._imageData = this._context.createImageData(this._canvas.width, this._canvas.height);
        this._data = this._imageData.data;

        this._coloringMethod = coloringMethod[this._options.coloringMethod];

        this.updateViewportSize();

        this._scale = 1;
        this._dx = HORIZONTAL_OFFSET;
        this._dy = 0;
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
        //the canvas pixel data is a bit awkward to get at...
        //see: https://www.w3.org/TR/2dcontext/#pixel-manipulation
        var dataIndex = (y * this._imageData.width + x) * 4;
        if (dataIndex < this._data.length && dataIndex >= 0) {
            this._data[dataIndex] = color.r;
            this._data[dataIndex + 1] = color.g;
            this._data[dataIndex + 2] = color.b;
            this._data[dataIndex + 3] = 255; //max saturation
        }
    }

    updateViewportSize() {
        //width / height ratio of the viewport
        this._imageData = this._context.createImageData(this._canvas.width, this._canvas.height);
        this._data = this._imageData.data;
        this._imageRatio = this._imageData.width / this._imageData.height;

        var ratio = 1;
        var product = 0;

        this._topEdge = TOP_EDGE;
        this._bottomEdge = BOTTOM_EDGE;
        this._leftEdge = LEFT_EDGE;
        this._rightEdge = RIGHT_EDGE;

        //modify the bounds we display based on the
        //difference between the viewport ratio and
        //the ratio of the bounds of the mandelbrot
        if (this._imageRatio > MANDEL_RATIO) {
            ratio = (this._imageRatio / MANDEL_RATIO);
            product = (RIGHT_EDGE - LEFT_EDGE) * ratio;

            this._leftEdge = -product * (2.5 / 3.5);
            this._rightEdge = product * (1 / 3.5);
        } else {
            ratio = (MANDEL_RATIO / this._imageRatio);
            product = (BOTTOM_EDGE - TOP_EDGE) * ratio;

            this._topEdge = -product * (1 / 2.0);
            this._bottomEdge = product * (1 / 2.0);
        }
    }

    updateRealBoundaries() {
        //the Real (ℝ) boundaries of the rendering given the zoom and offset
        this.xMax = this._rightEdge / this.scale + this.x;
        this.xMin = this._leftEdge / this.scale + this.x;
        this.yMax = this._bottomEdge / this.scale + this.y;
        this.yMin = this._topEdge / this.scale + this.y;

        //translation of "Pixel space" to Real (ℝ) space
        //i.e., these variables represent the Real difference
        //between two pixels, horizonatally and vertically
        this.xStep = (this.xMax - this.xMin) / this._imageData.width;
        this.yStep = (this.yMax - this.yMin) / this._imageData.height;
    }

    //scale: how far we've zoomed in from the default
    //dx0: displacement of perspective horizontally
    //dy0: displacement of perspective vertically
    render(scale, dx0, dy0) {
        this._scale = scale;
        this._dx = dx0 - HORIZONTAL_OFFSET / this._scale;
        this._dy = dy0;

        this.updateRealBoundaries();

        for (var canvasY = 0; canvasY < this._imageData.height; canvasY++) {
            for (var canvasX = 0; canvasX < this._imageData.width; canvasX++) {
                //scale the pixel values to be within the bounds of the set
                var pos = this.canvasPositionToRealPosition(canvasX, canvasY);
                var x0 = pos.x;
                var y0 = pos.y;

                var color = this._coloringMethod(x0, y0, assign(this._options, {
                    pixelSize: this.xStep,
                    canvasWidth: this._canvas.width
                }));

                this.plot(canvasX, canvasY, color);
            }
        }

        //draw it!
        this._context.putImageData(this._imageData, 0, 0);
    }

    realPositionToCanvasPosition(realX, realY) {
        return {
            x: parseInt((realX - this.xMin) / this.xStep),
            y: parseInt((realY - this.yMin) / this.yStep)
        };
    }

    canvasPositionToRealPosition(canvasX, canvasY) {
        //scale the pixel values to frame the bounds of the set
        return {
            x: this.xMin + this.xStep * canvasX,
            y: this.yMin + this.yStep * canvasY
        };
    }
}

export default Renderer;
