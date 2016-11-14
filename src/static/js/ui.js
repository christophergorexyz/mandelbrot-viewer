'use strict';

import Renderer from '../../graphics/renderer';
import {
    html
} from 'common-tags';

function _renderScene(r, viewData) {
    r.render(viewData.scale, viewData.x, viewData.y);
}

function _renderControls(ui, viewData) {
    return html `
        <div>
            <a id="get-png" href="#" target="_blank">GET PNG</a>
        </div>
        <div>
            <button onclick="zoomIn();">+</button>
            <button onclick="zoomOut();">-</button>
            <button onclick="reset();">Reset</button>
        </div>
        <div>
            <button onclick="save();">Save</button>
        </div>
        <div id="location">
            <div>
                <label for="scale">Scale</label>
                <input id="scale" type="text" value="${viewData.scale}"  />
            </div>
            <div>
                <label for="x-location">X</label>
                <input id="x-location" type="text" value="${viewData.x}" />
            </div>
            <div>
                <label for="y-location">Y</label>
                <input id="y-location" type="text" value="${viewData.y}" />
            </div>
            <button onclick="setLocation();">go</button>
        </div>
        <div id="saved-list">${viewData.savedLocations.map((l, i)=>{
            return html `
                <div>
                    <a href="#" class="saved-location" data-location-index="${i}">${l.name}}
                </div>
            `;
        })}</div>
        <div id="mandelog">${viewData.mandelog.map((l, i)=>{
            return html `<p>${i}: ${l}</p>`;
        })}</div>
    `;
}

class UI {
    constructor(canvas, controls) {
        this._canvas = canvas instanceof Node ? canvas : document.getElementById(canvas);
        this._controls = controls instanceof Node ? controls : document.getElementById(controls);

        this._r = new Renderer(this._canvas, {
            coloringMethod: 'continuous-coloring',
            //palette: 'color-schemer-pastel-rainbow',
            palette: 'hue-shift-rainbow-chocolate',
            //loopPalette: true
        });

        this._initViewData = {
            scale: this._r._scale,
            x: this._r._dx, //horizontal offset, used for centering the set
            y: this._r._dy,
            canvasWidth: this._canvas.width,
            canvasHeight: this._canvas.height,
            savedLocations: [],
            mandelog: []
        };

        this._viewHistory = [this._initViewData];
        this._viewData = Object.assign({}, this._initViewData);

        var savedData = window.localStorage.getItem('locations');
        if (savedData) {
            var savedJSON = JSON.parse(savedData);
            if( savedJSON instanceof Array){
                this._viewData.savedLocations = savedJSON;
            }
        }


        let ui = this;
        var resizeCanvas = (timestamp)=>{
            if (ui._viewHistory[0].canvasWidth !== ui._canvas.width || ui._viewHistory[0].canvasHeight !== ui._canvas.height) {
                ui.mandelog(`viewport size changed`);
                ui._viewHistory = [Object.assign({}, ui._viewData)].concat(ui._viewHistory);
                ui._r.updateViewportSize();
                Object.assign(ui._viewData, {
                    canvasWidth: this._canvas.width,
                    canvasHeight: this._canvas.height
                });
                ui.render();
            }
            window.requestAnimationFrame(resizeCanvas);
        };
        window.requestAnimationFrame(resizeCanvas);

        this._canvas.addEventListener('click', function (e) {
            e.preventDefault();
            var pos = ui._r.realPositionToComplexPosition(e.layerX, e.layerY);
            ui._viewData.x = pos.x;
            ui._viewData.y = pos.y;
            ui.zoomIn();
        });
    }

    zoomIn() {
        this._viewData.scale *= 2;
        this.render();
    }

    zoomOut() {
        this._viewData.scale /= 2;
        this.render();
    }
    render() {
        //_renderControls(this, this._viewData);
        _renderScene(this._r, this._viewData);
    }
        //log to the UI's console
    mandelog(msg) {
        this._viewData.mandelog.push(`${+new Date()} ${msg}.`);
    }
    reset() {
        Object.assign(this._viewData, {
            scale: this._initViewData.scale,
            x: this._initViewData.x,
            y: this._initViewData.y
        });
        this.render();
    }

    saveLocation() {
        var saveData = {};
        saveData.name = 'location ' + (this._viewData.savedLocations.length + 1);
        saveData.x = this._viewData.x;
        saveData.y = this._viewData.y;
        saveData.scale = this._viewData.scale;
        this._viewData.savedLocations.push(saveData);
        window.localStorage.setItem('locations', JSON.stringify(this._viewData.savedLocations));
        this._controls.innerHTML = _renderControls(this, this._viewData);
    }

    load(l) {
        Object.assign(this._viewData, l);
        this.render();
    }
    bindControls() {
        this._controls.getElementsByClassName('saved-location').each(function(i){
            i.addEventListener('click', e=> {
                e.preventDefault();
                var index = e.target.getAttribute('data-location-index');
                var loc = this._viewData.savedLocations[index];
                console.log(loc);
                //load(loc);
            });
        });
    }
}

module.exports = UI;

//TODO: update canvas compositor to a proper ES6 module, and use it for more interactivity
