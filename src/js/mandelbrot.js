var _palette = require('palette');

var _status = document.getElementById('status');
var _canvas = document.getElementById('canvas');
var _savedList = document.getElementById('saved-list');
var _context = _canvas.getContext('2d');

var savedData = window.localStorage.getItem('locations');
var savedLocations = [];
if (savedData) {
    savedLocations = JSON.parse(savedData);
    updateSavedList();
}

var _imageData;
var _data;

var xStep;
var yStep;
var pMax;
var pMin;
var qMax;
var qMin;

//The bounds of the mandelbrot set
var initLeftEdge = -2.5;
var initRightEdge = 1;
var initTopEdge = -1;
var initBottomEdge = 1;

var leftEdge = initLeftEdge;
var rightEdge = initRightEdge;
var topEdge = initTopEdge;
var bottomEdge = initBottomEdge;

var _horizontalOffset = initRightEdge - ((initRightEdge - initLeftEdge) / 2);

var _viewData = {
    scale: 1,
    x: _horizontalOffset,
    y: 0
}; //the current center of the image

var _mandelRatio = (initRightEdge - initLeftEdge) / (initBottomEdge - initTopEdge);
var _imageRatio = _canvas.width / _canvas.height;
var _maxIterations = 1000;
//zoom and displacement
function renderScene(scale, dx0, dy0) {
    var zoom = scale || _viewData.scale;
    var dx = dx0 || _viewData.x - _horizontalOffset / zoom;
    var dy = dy0 || _viewData.y;

    if (_imageRatio > _mandelRatio) {
        var percentage = (_imageRatio / _mandelRatio);
        var difference = (initRightEdge - initLeftEdge) * percentage;

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

_canvas.addEventListener('click', function (e) {

    var px = e.layerX;
    var py = e.layerY;

    _viewData.scale *= 2;
    _viewData.x = pMin + xStep * px;
    _viewData.y = qMin + yStep * py;

    renderScene();
});

function _handleWindowResize() {
    _canvas.width = window.innerWidth;
    _canvas.height = window.innerHeight;
    _imageData = _context.createImageData(_canvas.width, _canvas.height);

    _imageRatio = _imageData.width / _imageData.height;
    _data = _imageData.data;
    renderScene();
}

function zoomIn() {
    _viewData.scale *= 2;
    renderScene();
}

function zoomOut() {
    _viewData.scale /= 2;
    renderScene();
}

function reset() {
    _viewData.scale = 1;
    _viewData.x = -0.75;
    _viewData.y = 0;
    renderScene();
}

function save() {
    var saveData = {};
    saveData.name = 'location ' + (savedLocations.length + 1);
    saveData.x = _viewData.x;
    saveData.y = _viewData.y;
    saveData.scale = _viewData.scale;
    savedLocations.push(saveData);
    window.localStorage.setItem('locations', JSON.stringify(savedLocations));
    updateSavedList();
}

function load(l) {
    _viewData.x = l.x;
    _viewData.y = l.y;
    _viewData.scale = l.scale;
    renderScene();
}

function showSetLocation() {
    document.getElementById('set-location').style.display = 'block';
}

function setLocation() {
    var scaleElement = document.getElementById('scale');
    var xElement = document.getElementById('x-location');
    var yElement = document.getElementById('y-location');
    var location = {};
    location.scale = parseFloat(scaleElement.value);
    location.x = parseFloat(xElement.value);
    location.y = parseFloat(yElement.value);
    scaleElement.value = '';
    xElement.value = '';
    yElement.value = '';
    document.getElementById('set-location').style.display = 'none';
    load(location);
}

function handleSavedLocationClick(e) {
    e.preventDefault();
    var index = e.target.getAttribute('data-location-index');
    var loc = savedLocations[index];
    load(loc);
}

function updateSavedList() {
    _savedList.innerHTML = '';
    for (var l in savedLocations) {
        var linkwrapper = document.createElement('div');
        var anchor = document.createElement('a');
        anchor.onclick = handleSavedLocationClick;
        anchor.setAttribute('data-location-index', l);
        anchor.href = '#';
        anchor.innerHTML = savedLocations[l].name;
        linkwrapper.appendChild(anchor);
        _savedList.appendChild(linkwrapper);
    }
}

function _writeStatus() {
    var zoomText = document.createElement('div');
    zoomText.textContent = 'Scale: ' + _viewData.scale;
    var xText = document.createElement('div');
    xText.textContent = 'x0: ' + _viewData.x;
    var yText = document.createElement('div');
    yText.textContent = 'y0: ' + _viewData.y;

    _status.innerHTML = '';

    _status.appendChild(zoomText);
    _status.appendChild(xText);
    _status.appendChild(yText);
}

window.onresize = _handleWindowResize;
_handleWindowResize();
