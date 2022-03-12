import Renderer from './renderer';


const UNIT_PERCENT = '%';
const UNIT_PX = 'px';
const UNIT_DEG = 'deg';
const UNIT_RAD = 'rad';
const UNIT_TURN = 'turn';

const FILTERS = {
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
  return `
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
        <div id="saved-list">${viewData.savedLocations.map((l, i)=>{ return  `
                <div>
                    <a href="#" class="saved-location" data-location-index="${i}">${l.name}}
                </div>
            `;})}</div>
        <div id="log">
          ${viewData.log.map((l, i)=>{ return  `<p>${i}: ${l}</p>`;})}
        </div>
    `;
}

class UI {
  constructor(canvas, controls) {
    this._canvas = canvas instanceof Node ? canvas : document.getElementById(canvas);
    this._controls = controls instanceof Node ? controls : document.getElementById(controls);

    this._r = new Renderer(this._canvas, {
      //coloringMethod: 'default',
      coloringMethod: 'continuous-coloring',
      //palette: 'material-design-rainbow-a400',
      palette: 'default',
      //loopPalette: true
    });

    this._initViewData = {
      scale: this._r._scale,
      x: this._r._dx, //horizontal offset, used for centering the set
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


    let ui = this;
    var resizeCanvas = () => {
      if (ui._viewHistory[0].canvasWidth !== ui._canvas.width || ui._viewHistory[0].canvasHeight !== ui._canvas.height) {
        ui.log(`viewport size changed`);
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
      let {
        r,
        i
      } = ui._r.realPositionToComplexPosition(e.layerX, e.layerY);
      ui._viewData.x = r;
      ui._viewData.y = i;
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
  log(msg) {
    this._viewData.log.push(`${+new Date()} ${msg}.`);
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
    this._controls.getElementsByClassName('saved-location').each(function (i) {
      i.addEventListener('click', e => {
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
