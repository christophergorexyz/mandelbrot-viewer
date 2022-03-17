"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _renderer = _interopRequireDefault(require("./renderer"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

var UNIT_PERCENT = '%';
var UNIT_PX = 'px';
var UNIT_DEG = 'deg';
var UNIT_RAD = 'rad';
var UNIT_TURN = 'turn';
var FILTERS = {
  url: '',
  blur: {
    val: 0,
    unit: UNIT_PX
  },
  brightness: {
    val: 100,
    unit: UNIT_PERCENT
  },
  contrast: {
    val: 100,
    unit: UNIT_PERCENT
  },
  //'drop-shadow': {} // TODO: ugh
  grayscale: {
    val: 0,
    unit: UNIT_PERCENT
  },
  'hue-rotate': {
    val: 0,
    unit: UNIT_DEG
  },
  invert: {
    val: 0,
    unit: UNIT_PERCENT
  },
  opacity: {
    val: 100,
    unit: UNIT_PERCENT
  },
  saturate: {
    val: 100,
    unit: UNIT_PERCENT
  },
  sepia: {
    val: 0,
    unit: UNIT_PERCENT
  },
  none: 'none'
};
var BUTTON_ZOOM_IN = 'button--zoom-in';
var BUTTON_ZOOM_OUT = 'button--zoom-out';
var BUTTON_RESET = 'button--reset';
var BUTTON_SET_LOCATION = 'button--set-location';
var INPUT_PALETTE_SEED = 'input--palette-seed';
var INPUT_PALETTE_MODE = 'input--palette-mode';
var INPUT_PALETTE_SIZE = 'input--palette-size';

function _renderScene(r, viewData) {
  r.render(viewData.scale, viewData.x, viewData.y);
}

function _renderControls(viewData) {
  return "\n        <div>\n            <a id=\"get-png\" href=\"#\" target=\"_blank\">GET PNG</a>\n        </div>\n        <div>\n            <button id=\"".concat(BUTTON_ZOOM_IN, "\">+</button>\n            <button id=\"").concat(BUTTON_ZOOM_OUT, "\">-</button>\n            <button id=\"").concat(BUTTON_RESET, "\">Reset</button>\n        </div>\n        <div>\n            <button class=\"button--save\">Save</button>\n        </div>\n        <hr>\n        <input type=\"color\" id=\"").concat(INPUT_PALETTE_SEED, "\" value=").concat(viewData.paletteSeed, ">\n        <select id=\"").concat(INPUT_PALETTE_MODE, "\">\n          <option>analogic</option>\n          <option>monochrome</option>\n          <option>monochrome-light</option>\n          <option>monochrome-dark</option>\n          <option>complement</option>\n          <option>analogic-complement</option>\n          <option>triad</option>\n          <option>quad</option>\n        </select>\n        <br>\n        <input id=\"").concat(INPUT_PALETTE_SIZE, "\" type=\"number\" value=\"5\">\n\n        <hr>\n\n        <div id=\"location\">\n            <div>\n                <label for=\"scale\">Scale</label>\n                <input id=\"scale\" type=\"text\" value=\"").concat(viewData.scale, "\"  />\n            </div>\n            <div>\n                <label for=\"x-location\">X</label>\n                <input id=\"x-location\" type=\"text\" value=\"").concat(viewData.x, "\" />\n            </div>\n            <div>\n                <label for=\"y-location\">Y</label>\n                <input id=\"y-location\" type=\"text\" value=\"").concat(viewData.y, "\" />\n            </div>\n            <button id=\"").concat(BUTTON_SET_LOCATION, "\">go</button>\n        </div>\n        <div id=\"saved-list\">").concat(viewData.savedLocations.map(function (l, i) {
    return "\n                <div>\n                    <a href=\"#\" class=\"saved-location\" data-location-index=\"".concat(i, "\">").concat(l.name, "}\n                </div>\n            ");
  }), "</div>\n        <div id=\"log\">\n          ").concat(viewData.log.map(function (l, i) {
    return "<p>".concat(i, ": ").concat(l, "</p>");
  }), "\n        </div>\n    ");
}

var UI = /*#__PURE__*/function () {
  function UI(canvas, controls) {
    var _this = this;

    (0, _classCallCheck2["default"])(this, UI);
    this._canvas = canvas instanceof Node ? canvas : document.getElementById(canvas);
    this._controls = controls instanceof Node ? controls : document.getElementById(controls);
    this._r = new _renderer["default"](this._canvas, {
      //coloringMethod: 'default',
      coloringMethod: 'continuous-coloring' //loopPalette: true

    });
    this._initViewData = {
      scale: this._r._scale,
      x: this._r._dx,
      //horizontal offset, used for centering the set
      y: this._r._dy,
      canvasWidth: this._canvas.width,
      canvasHeight: this._canvas.height,
      savedLocations: [],
      paletteSeed: '#000000',
      log: []
    };
    this._viewHistory = [this._initViewData];
    this._viewData = _objectSpread({}, this._initViewData);
    var savedData = window.localStorage.getItem('locations');

    if (savedData) {
      var savedJSON = JSON.parse(savedData);

      if (savedJSON instanceof Array) {
        this._viewData.savedLocations = savedJSON;
      }
    }

    this.updateInterface();
    var ui = this;

    var resizeCanvas = function resizeCanvas() {
      if (ui._viewHistory[0].canvasWidth !== ui._canvas.width || ui._viewHistory[0].canvasHeight !== ui._canvas.height) {
        ui.log('viewport size changed');
        ui._viewHistory = [Object.assign({}, ui._viewData)].concat(ui._viewHistory);

        ui._r.updateViewportSize();

        Object.assign(ui._viewData, {
          canvasWidth: _this._canvas.width,
          canvasHeight: _this._canvas.height
        });
        ui.render();
      }
    };

    window.requestAnimationFrame(resizeCanvas);

    this._canvas.addEventListener('click', function (e) {
      e.preventDefault();

      var _ui$_r$realPositionTo = ui._r.realPositionToComplexPosition(e.layerX, e.layerY),
          r = _ui$_r$realPositionTo.r,
          i = _ui$_r$realPositionTo.i;

      ui._viewData.x = r;
      ui._viewData.y = i;
      ui.zoomIn();
    });
  }

  (0, _createClass2["default"])(UI, [{
    key: "updateInterface",
    value: function updateInterface() {
      var _this2 = this;

      this._controls.innerHTML = _renderControls(this._viewData);
      document.getElementById(BUTTON_ZOOM_IN).addEventListener('click', function () {
        return _this2.zoomIn.apply(_this2, arguments);
      });
      document.getElementById(BUTTON_ZOOM_OUT).addEventListener('click', function () {
        return _this2.zoomOut.apply(_this2, arguments);
      });
      document.getElementById(INPUT_PALETTE_SEED).addEventListener('change', function () {
        _this2._viewData.paletteSeed = _this2.paletteSeed;

        _this2.retrievePalette.apply(_this2, arguments);
      });
      document.getElementById(INPUT_PALETTE_SIZE).addEventListener('change', function () {
        return _this2.retrievePalette.apply(_this2, arguments);
      });
      document.getElementById(INPUT_PALETTE_MODE).addEventListener('change', function () {
        return _this2.retrievePalette.apply(_this2, arguments);
      });
    }
  }, {
    key: "paletteSeed",
    get: function get() {
      return document.getElementById(INPUT_PALETTE_SEED).value;
    }
  }, {
    key: "paletteSize",
    get: function get() {
      return document.getElementById(INPUT_PALETTE_SIZE).value;
    }
  }, {
    key: "paletteMode",
    get: function get() {
      return document.getElementById(INPUT_PALETTE_MODE).value;
    }
  }, {
    key: "retrievePalette",
    value: function () {
      var _retrievePalette = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
        var response, json;
        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return fetch("//www.thecolorapi.com/scheme?hex=".concat(this.paletteSeed.slice(1), "&mode=").concat(this.paletteMode, "&count=").concat(this.paletteSize));

              case 2:
                response = _context.sent;
                _context.next = 5;
                return response.json();

              case 5:
                json = _context.sent;
                this._r.palette = json.colors.map(function (c) {
                  return c.rgb;
                });

                _renderScene(this._r, this._viewData);

              case 8:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function retrievePalette() {
        return _retrievePalette.apply(this, arguments);
      }

      return retrievePalette;
    }()
  }, {
    key: "zoomIn",
    value: function zoomIn() {
      this._viewData.scale *= 2;
      this.render();
    }
  }, {
    key: "zoomOut",
    value: function zoomOut() {
      this._viewData.scale /= 2;
      this.render();
    }
  }, {
    key: "render",
    value: function render() {
      //_renderControls(this, this._viewData);
      //bring up something to stop extra rendering
      _renderScene(this._r, this._viewData);

      this.updateInterface();
    } //log to the UI's console

  }, {
    key: "log",
    value: function log(msg) {
      this._viewData.log.push("".concat(+new Date(), " ").concat(msg, "."));
    }
  }, {
    key: "reset",
    value: function reset() {
      Object.assign(this._viewData, {
        scale: this._initViewData.scale,
        x: this._initViewData.x,
        y: this._initViewData.y
      });
      this.render();
    }
  }, {
    key: "saveLocation",
    value: function saveLocation() {
      var saveData = {};
      saveData.name = 'location ' + (this._viewData.savedLocations.length + 1);
      saveData.x = this._viewData.x;
      saveData.y = this._viewData.y;
      saveData.scale = this._viewData.scale;

      this._viewData.savedLocations.push(saveData);

      window.localStorage.setItem('locations', JSON.stringify(this._viewData.savedLocations));
      this._controls.innerHTML = _renderControls(this, this._viewData);
    }
  }, {
    key: "load",
    value: function load(l) {
      Object.assign(this._viewData, l);
      this.render();
    }
  }, {
    key: "bindControls",
    value: function bindControls() {
      this._controls.getElementsByClassName('saved-location').each(function (i) {
        var _this3 = this;

        i.addEventListener('click', function (e) {
          e.preventDefault();
          var index = e.target.getAttribute('data-location-index');
          var loc = _this3._viewData.savedLocations[index];
          console.log(loc); //load(loc);
        });
      });
    }
  }]);
  return UI;
}();

module.exports = UI; //TODO: update canvas compositor to a proper ES6 module, and use it for more interactivity
//# sourceMappingURL=ui.js.map