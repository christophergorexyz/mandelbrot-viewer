function rgb(colorArray) {
  return {
    r: colorArray[0],
    g: colorArray[1],
    b: colorArray[2]
  };
}

var _grayScale = [
  rgb([255, 255, 255]),
  rgb([0, 0, 0, 0])
];


export default {
  'default': _grayScale,
  'gray-scale': _grayScale,
};

//TODO: allow users to CRUD their own color palettes to localstorage
