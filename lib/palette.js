"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
function rgb(colorArray) {
  return {
    r: colorArray[0],
    g: colorArray[1],
    b: colorArray[2]
  };
}
var _grayScale = [rgb([255, 255, 255]), rgb([0, 0, 0, 0])];
var _default = {
  'default': _grayScale,
  'gray-scale': _grayScale
}; //TODO: allow users to CRUD their own color palettes to localstorage
exports["default"] = _default;
//# sourceMappingURL=palette.js.map