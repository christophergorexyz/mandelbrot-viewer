import palette from './palette';

import assign from 'lodash.assign';

//the bounds of the set
const LEFT_EDGE = -2.5;
const RIGHT_EDGE = 1;
const TOP_EDGE = -1;
const BOTTOM_EDGE = 1;


//this is a bitshift operation, not a bool
//i normally wouldn't, but it's really convenient
const MAX_RADIUS = (1 << 16);

//because the bounds of the set are uneven, we're horizontally offset this much
const HORIZONTAL_OFFSET = LEFT_EDGE - ((LEFT_EDGE - RIGHT_EDGE) / 2);

//width / height ratio of the bounds of the set
const MANDEL_RATIO = (RIGHT_EDGE - LEFT_EDGE) / (BOTTOM_EDGE - TOP_EDGE);

const MIMETYPE_PNG = 'image/png';

const DEFAULT_SETTINGS = {
    palette: 'rainbow',
    maxIterations: 1000, //probably better NOT to set this in the options?
    mandelbrotColor: {
        r: 0,
        g: 0,
        b: 0
    }
};

export default class Renderer {
    constructor(canvas, options) {

        options = assign({}, options, DEFAULT_SETTINGS);

        this._canvas = canvas;
        this._context = this._canvas.getContext('2d');
        this._imageData = this._context.createImageData(this._canvas.width, this._canvas.height);
        this._data = this._imageData.data;

        this._maxIterations = options.maxIterations;
        this._mandelbrotColor = options.mandelbrotColor;
        this._palette = palette[options.palette];

        //TODO: decide if this is beset approach.
        //is it better to let user be absolute in this?
        //or to enforce perfect cycle of palette?
        this._maxIterations = this._maxIterations + (this._maxIterations % this._palette.length);

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

    interpolateValue(val1, val2, fraction) {
        return (1 - fraction) * val1 + fraction * val2;
        //return val1 + (val2 - val1) * fraction;
    }

    interpolateColor(color1, color2, fraction) {
            return {
                r: this.interpolateValue(color1.r, color2.r, fraction),
                g: this.interpolateValue(color1.g, color2.g, fraction),
                b: this.interpolateValue(color1.b, color2.b, fraction),
            };
        }
        //scale: how far we've zoomed in from the default
        //dx0: displacement of perspective horizontally
        //dy0: displacement of perspective vertically
    render(scale, dx0, dy0) {
        this._scale = scale;
        this._dx = dx0 - HORIZONTAL_OFFSET / this._scale;
        this._dy = dy0;

        this.updateRealBoundaries();

        //An implementation of the Escape Time Algorithm
        //https://en.wikipedia.org/wiki/Mandelbrot_set#Escape_time_algorithm
        for (var canvasY = 0; canvasY < this._imageData.height; canvasY++) {
            for (var canvasX = 0; canvasX < this._imageData.width; canvasX++) {
                //scale the pixel values to be within the bounds of the set
                var pos = this.canvasPositionToRealPosition(canvasX, canvasY);
                var x0 = pos.x;
                var y0 = pos.y;

                var x = 0.0;
                var y = 0.0;

                var iteration = 0;
                while (x * x + y * y < MAX_RADIUS * 2 && iteration < this._maxIterations) {
                    var tempX = x * x - y * y + x0;
                    y = 2 * x * y + y0;
                    x = tempX;
                    iteration++;
                }

                //deafult to black unless we managed to rule this pixel out
                var color = this._mandelbrotColor;

                if (iteration < this._maxIterations) {
                    var log_zn = Math.log(x * x + y * y) / 2;
                    var nu = Math.log(log_zn / Math.log(2)) / Math.log(2);
                    iteration = iteration + 1 - nu;


                    var color1 = this._palette[Math.floor(iteration) % this._palette.length];
                    var color2 = this._palette[(Math.floor(iteration) + 1) % this._palette.length];

                    color = this.interpolateColor(color1, color2, iteration % 1);
                }

                this.plot(canvasX, canvasY, color);
            }
        }

        //TODO: decide if worth bothering adding below commented code for debugging purposes
        /*
        var whitePos = {
            x: this._imageData.width/2,
            y: this._imageData.height/2
        };

        for (var whiteY = 0; whiteY < this._imageData.height; whiteY++) {
            this.plot(whitePos.x, whiteY, {
                r: 255,
                g: 255,
                b: 255
            });
        }
        for (var whiteX = 0; whiteX < this._imageData.width; whiteX++) {
            this.plot(whiteX, whitePos.y, {
                r: 255,
                g: 255,
                b: 255
            });
        }


        var redPos = this.realPositionToCanvasPosition(0, 0);

        //draw the Real coordinate space axis
        for (var redX = 0; redX < this._imageData.width; redX++) {
            this.plot(redX, redPos.y, {
                r: 255,
                g: 0,
                b: 0
            });
        }

        for (var redY = 0; redY < this._imageData.height; redY++) {
            this.plot(redPos.x, redY, {
                r: 255,
                g: 0,
                b: 0
            });
        }
        */

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
