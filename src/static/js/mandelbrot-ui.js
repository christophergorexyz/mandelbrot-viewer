'use strict';
var _savedList = document.getElementById('saved-list');
var _location = document.getElementById('location');
var _context = _canvas.getContext('2d');

var savedData = window.localStorage.getItem('locations');
var savedLocations = [];
if (savedData) {
    savedLocations = JSON.parse(savedData);
    updateSavedList();
}

var _viewData = {
    scale: 1,
    x: _horizontalOffset,
    y: 0
}; //the current center of the image

_canvas.addEventListener('click', function (e) {

    var px = e.layerX;
    var py = e.layerY;

    _viewData.scale *= 2;
    _viewData.x = pMin + xStep * px;
    _viewData.y = qMin + yStep * py;

    renderScene();
});

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
