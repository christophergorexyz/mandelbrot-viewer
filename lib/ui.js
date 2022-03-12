"use strict";

var _renderer = _interopRequireDefault(require("./renderer"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

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

function _renderScene(r, viewData) {
  r.render(viewData.scale, viewData.x, viewData.y);
}

function _renderControls(ui, viewData) {
  return "\n        <div>\n            <a id=\"get-png\" href=\"#\" target=\"_blank\">GET PNG</a>\n        </div>\n        <div>\n            <button onclick=\"zoomIn();\">+</button>\n            <button onclick=\"zoomOut();\">-</button>\n            <button onclick=\"reset();\">Reset</button>\n        </div>\n        <div>\n            <button onclick=\"save();\">Save</button>\n        </div>\n        <div id=\"location\">\n            <div>\n                <label for=\"scale\">Scale</label>\n                <input id=\"scale\" type=\"text\" value=\"".concat(viewData.scale, "\"  />\n            </div>\n            <div>\n                <label for=\"x-location\">X</label>\n                <input id=\"x-location\" type=\"text\" value=\"").concat(viewData.x, "\" />\n            </div>\n            <div>\n                <label for=\"y-location\">Y</label>\n                <input id=\"y-location\" type=\"text\" value=\"").concat(viewData.y, "\" />\n            </div>\n            <button onclick=\"setLocation();\">go</button>\n        </div>\n        <div id=\"saved-list\">").concat(viewData.savedLocations.map(function (l, i) {
    return "\n                <div>\n                    <a href=\"#\" class=\"saved-location\" data-location-index=\"".concat(i, "\">").concat(l.name, "}\n                </div>\n            ");
  }), "</div>\n        <div id=\"log\">\n          ").concat(viewData.log.map(function (l, i) {
    return "<p>".concat(i, ": ").concat(l, "</p>");
  }), "\n        </div>\n    ");
}

var UI = /*#__PURE__*/function () {
  function UI(canvas, controls) {
    var _this = this;

    _classCallCheck(this, UI);

    this._canvas = canvas instanceof Node ? canvas : document.getElementById(canvas);
    this._controls = controls instanceof Node ? controls : document.getElementById(controls);
    this._r = new _renderer["default"](this._canvas, {
      //coloringMethod: 'default',
      coloringMethod: 'continuous-coloring',
      //palette: 'material-design-rainbow-a400',
      palette: 'default' //loopPalette: true

    });
    this._initViewData = {
      scale: this._r._scale,
      x: this._r._dx,
      //horizontal offset, used for centering the set
      y: this._r._dy,
      canvasWidth: this._canvas.width,
      canvasHeight: this._canvas.height,
      savedLocations: [],
      log: []
    };
    this._viewHistory = [this._initViewData];
    this._viewData = Object.assign({}, this._initViewData);
    var savedData = window.localStorage.getItem('locations');

    if (savedData) {
      var savedJSON = JSON.parse(savedData);

      if (savedJSON instanceof Array) {
        this._viewData.savedLocations = savedJSON;
      }
    }

    var ui = this;

    var resizeCanvas = function resizeCanvas() {
      if (ui._viewHistory[0].canvasWidth !== ui._canvas.width || ui._viewHistory[0].canvasHeight !== ui._canvas.height) {
        ui.log("viewport size changed");
        ui._viewHistory = [Object.assign({}, ui._viewData)].concat(ui._viewHistory);

        ui._r.updateViewportSize();

        Object.assign(ui._viewData, {
          canvasWidth: _this._canvas.width,
          canvasHeight: _this._canvas.height
        });
        ui.render();
      }

      window.requestAnimationFrame(resizeCanvas);
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

  _createClass(UI, [{
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
      _renderScene(this._r, this._viewData);
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
        var _this2 = this;

        i.addEventListener('click', function (e) {
          e.preventDefault();
          var index = e.target.getAttribute('data-location-index');
          var loc = _this2._viewData.savedLocations[index];
          console.log(loc); //load(loc);
        });
      });
    }
  }]);

  return UI;
}();

module.exports = UI; //TODO: update canvas compositor to a proper ES6 module, and use it for more interactivity
//# sourceMappingURL=ui.js.map