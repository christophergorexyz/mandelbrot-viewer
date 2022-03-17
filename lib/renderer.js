"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _coloringMethod = _interopRequireDefault(require("./coloring-method"));

var _julia = require("./samplers/julia");

//the bounds of the set
var LEFT_EDGE = -2.5;
var RIGHT_EDGE = 1;
var TOP_EDGE = -1;
var BOTTOM_EDGE = 1; //because the bounds of the set are uneven, we're horizontally offset this much

var HORIZONTAL_OFFSET = LEFT_EDGE - (LEFT_EDGE - RIGHT_EDGE) / 2; //width / height ratio of the bounds of the set

var MANDEL_RATIO = (RIGHT_EDGE - LEFT_EDGE) / (BOTTOM_EDGE - TOP_EDGE);
var MIMETYPE_PNG = 'image/png';
var DEFAULT_SETTINGS = {
  coloringMethod: 'default',
  loopPalette: false,
  filters: 'none',
  palette: [{
    r: 0,
    g: 0,
    b: 0
  }, {
    r: 255,
    g: 255,
    b: 255
  }]
};

var Renderer = /*#__PURE__*/function () {
  function Renderer(canvas, options) {
    (0, _classCallCheck2["default"])(this, Renderer);
    this._options = Object.assign({}, DEFAULT_SETTINGS, options);
    this._canvas = canvas;
    this._context = this._canvas.getContext('2d');
    this._imageData = this._context.createImageData(this._canvas.width, this._canvas.height);
    this._data = this._imageData.data;
    this._coloringMethod = _coloringMethod["default"][this._options.coloringMethod];
    this._sampler = _julia.julia;
    this.updateViewportSize();
    this._scale = 1;
    this._dx = HORIZONTAL_OFFSET;
    this._dy = 0;
  }

  (0, _createClass2["default"])(Renderer, [{
    key: "palette",
    get: function get() {
      return this._options.palette;
    },
    set: function set(val) {
      this._options.palette = val;
    }
  }, {
    key: "DataUrl",
    get: function get() {
      return this._canvas.toDataURL(MIMETYPE_PNG);
    }
  }, {
    key: "plot",
    value: function plot(x, y, color) {
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
  }, {
    key: "updateViewportSize",
    value: function updateViewportSize() {
      //width / height ratio of the viewport
      this._imageData = this._context.createImageData(this._canvas.width, this._canvas.height);
      this._data = this._imageData.data;
      this._imageRatio = this._imageData.width / this._imageData.height;
      var ratio = 1;
      var product = 0;
      this._topEdge = TOP_EDGE;
      this._bottomEdge = BOTTOM_EDGE;
      this._leftEdge = LEFT_EDGE;
      this._rightEdge = RIGHT_EDGE; //modify the bounds we display based on the
      //difference between the viewport ratio and
      //the ratio of the bounds of the mandelbrot

      if (this._imageRatio > MANDEL_RATIO) {
        ratio = this._imageRatio / MANDEL_RATIO;
        product = (RIGHT_EDGE - LEFT_EDGE) * ratio;
        this._leftEdge = -product * (2.5 / 3.5);
        this._rightEdge = product * (1 / 3.5);
      } else {
        ratio = MANDEL_RATIO / this._imageRatio;
        product = (BOTTOM_EDGE - TOP_EDGE) * ratio;
        this._topEdge = -product / 2.0;
        this._bottomEdge = product / 2.0;
      }
    }
  }, {
    key: "updateRealBoundaries",
    value: function updateRealBoundaries() {
      //the Real (ℝ) boundaries of the rendering given the zoom and offset
      this.xMax = this._rightEdge / this._scale + this._dx;
      this.xMin = this._leftEdge / this._scale + this._dx;
      this.yMax = this._bottomEdge / this._scale + this._dy;
      this.yMin = this._topEdge / this._scale + this._dy; //translation of "Pixel space" to Real (ℝ) space
      //i.e., these variables represent the Real difference
      //between two pixels, horizonatally and vertically

      this.xStep = (this.xMax - this.xMin) / this._imageData.width;
      this.yStep = (this.yMax - this.yMin) / this._imageData.height;
    }
  }, {
    key: "sampleCoordinate",
    value: function sampleCoordinate(x, y) {
      //scale the pixel values to be within the bounds of the set
      var _this$realPositionToC = this.realPositionToComplexPosition(x, y),
          r = _this$realPositionToC.r,
          i = _this$realPositionToC.i;

      var sample = this._sampler(0, 0, r, i);

      var color = this._coloringMethod(sample, this._options);

      this.plot(x, y, color);
      return sample;
    } //scale: how far we've zoomed in from the default
    //dx0: displacement of perspective horizontally
    //dy0: displacement of perspective vertically

  }, {
    key: "render",
    value: function () {
      var _render = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(scale, dx0, dy0) {
        var y, x;
        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                this._scale = scale;
                this._dx = dx0 - HORIZONTAL_OFFSET / this._scale;
                this._dy = dy0;
                this.updateRealBoundaries();

                for (y = 0; y < this._imageData.height; y++) {
                  for (x = 0; x < this._imageData.width; x++) {
                    this.sampleCoordinate(x, y);
                  }
                } //TODO: the below is for applying filters to the image
                // this._context.filter = 'blur(5px)';
                // let tempCanvas = document.createElement('canvas');
                // let tempContext = tempCanvas.getContext('2d');
                // tempCanvas.width = this._canvas.width;
                // tempCanvas.height = this._canvas.height;
                // tempContext.putImageData(this._imageData, 0, 0);
                // //draw it!
                // this._context.drawImage(tempCanvas, 0, 0);


                this._context.putImageData(this._imageData, 0, 0);

              case 6:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function render(_x, _x2, _x3) {
        return _render.apply(this, arguments);
      }

      return render;
    }() //r= the real part of the number
    //i= the imaginary part of the number

  }, {
    key: "complexPositionToRealPosition",
    value: function complexPositionToRealPosition(r, i) {
      return {
        x: parseInt((r - this.xMin) / this.xStep),
        y: parseInt((i - this.yMin) / this.yStep)
      };
    }
  }, {
    key: "realPositionToComplexPosition",
    value: function realPositionToComplexPosition(x, y) {
      //scale the pixel values to frame the bounds of the set
      return {
        r: this.xMin + this.xStep * x,
        i: this.yMin + this.yStep * y
      };
    }
  }]);
  return Renderer;
}();

var _default = Renderer;
exports["default"] = _default;
//# sourceMappingURL=renderer.js.map