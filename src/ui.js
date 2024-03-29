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

const BUTTON_ZOOM_IN = 'button--zoom-in';
const BUTTON_ZOOM_OUT = 'button--zoom-out';
const BUTTON_RESET = 'button--reset';
const BUTTON_SET_LOCATION = 'button--set-location';
const INPUT_PALETTE_SEED = 'input--palette-seed';
const INPUT_PALETTE_MODE = 'input--palette-mode';
const INPUT_PALETTE_SIZE = 'input--palette-size';
const INPUT_REAL_COORDINATE = 'x-location';
const INPUT_IMAGINARY_COORDINATE = 'y-location';
const INPUT_SCALE = 'scale';


function _renderScene(r, viewData) {
  r.render(viewData.scale, viewData.x, viewData.y);
}

function _renderControls(viewData) {
  return `
        <div>
            <a id="get-png" href="#" target="_blank">GET PNG</a>
        </div>
        <div>
            <button id="${BUTTON_ZOOM_IN}">+</button>
            <button id="${BUTTON_ZOOM_OUT}">-</button>
            <button id="${BUTTON_RESET}">Reset</button>
        </div>
        <div>
            <button class="button--save">Save</button>
        </div>
        <hr>
        <input type="color" id="${INPUT_PALETTE_SEED}" value=${viewData.paletteSeed}>
        <select id="${INPUT_PALETTE_MODE}">
          <option>analogic</option>
          <option>monochrome</option>
          <option>monochrome-light</option>
          <option>monochrome-dark</option>
          <option>complement</option>
          <option>analogic-complement</option>
          <option>triad</option>
          <option>quad</option>
        </select>
        <br>
        <input id="${INPUT_PALETTE_SIZE}" type="number" value="5">

        <hr>

        <div id="location">
            <div>
                <label for="${INPUT_SCALE}">Scale</label>
                <input id="${INPUT_SCALE}" type="text" value="${viewData.scale}"  />
            </div>
            <div>
                <label for="${INPUT_REAL_COORDINATE}">X</label>
                <input id="${INPUT_REAL_COORDINATE}" type="text" value="${viewData.x}" />
            </div>
            <div>
                <label for="${INPUT_IMAGINARY_COORDINATE}">Y</label>
                <input id="${INPUT_IMAGINARY_COORDINATE}" type="text" value="${viewData.y}" />
            </div>
            <button id="${BUTTON_SET_LOCATION}">go</button>
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

  /**
   *
   * @param {HTMLCanvasElement|String} canvas the HTMLCanvasElement element for rendering fractal images, or its `id`
   * @param {HTMLElement|String} controls the HTMLElement that houses the controls or its `id`
   * @param {URLSearchParams|String} urlParams the ULRSearchParams or the query string returned by `window.location.search`;
   */
  constructor(canvas, controls, urlParams) {
    this._canvas = canvas instanceof Element ? canvas : document.getElementById(canvas);
    this._controls = controls instanceof Element ? controls : document.getElementById(controls);
    this._urlParams = new Proxy(urlParams instanceof URLSearchParams ? urlParams : new URLSearchParams(window.location.search), {
      get: (params, prop) => params.get(prop)
    });

    this._r = new Renderer(this._canvas, {
      //coloringMethod: 'default',
      coloringMethod: 'continuous-coloring',
      //loopPalette: true
    });

    this._initViewData = {
      scale: this._r._scale,
      x: this._r._dx, //horizontal offset, used for centering the set
      y: this._r._dy,
      canvasWidth: this._canvas.width,
      canvasHeight: this._canvas.height,
      savedLocations: [],
      paletteSeed:'#000000',
      log: []
    };

    this._viewHistory = [this._initViewData];
    this._viewData = {...this._initViewData};

    var savedData = window.localStorage.getItem('locations');
    if (savedData) {
      var savedJSON = JSON.parse(savedData);
      if (savedJSON instanceof Array) {
        this._viewData.savedLocations = savedJSON;
      }
    }

    this._canvas.addEventListener('click', (e)=>this.handleClick(e));
    this.updateInterface();
    window.requestAnimationFrame((e)=>this.resizeCanvas(e));
  }


  handleClick(e){
    e.preventDefault();
    let {
      r,
      i
    } = this._r.realPositionToComplexPosition(e.layerX, e.layerY);
    this._viewData.x = r;
    this._viewData.y = i;
    this.zoomIn();
  }

  resizeCanvas(){
    if (this._viewHistory[0].canvasWidth !== this._canvas.width || this._viewHistory[0].canvasHeight !== this._canvas.height) {
      this.log('viewport size changed');
      this._viewHistory = [Object.assign({}, this._viewData)].concat(this._viewHistory);
      this._r.updateViewportSize();
      Object.assign(this._viewData, {
        canvasWidth: this._canvas.width,
        canvasHeight: this._canvas.height
      });
      this.render();
    }
  }

  updateInterface(){
    this._controls.innerHTML = _renderControls(this._viewData);

    this._goButton = document.getElementById(BUTTON_SET_LOCATION);
    this._realInput = document.getElementById(INPUT_REAL_COORDINATE);
    this._scaleInput = document.getElementById(INPUT_SCALE);
    this._imaginaryInput = document.getElementById(INPUT_IMAGINARY_COORDINATE);
    this._paletteSizeInput =document.getElementById(INPUT_PALETTE_SIZE);
    this._paletteModeInput =document.getElementById(INPUT_PALETTE_MODE);
    this._paletteColorPicker = document.getElementById(INPUT_PALETTE_SEED);
    this._zoomInButton = document.getElementById(BUTTON_ZOOM_IN);
    this._zoomOutButton = document.getElementById(BUTTON_ZOOM_OUT);

    this._zoomInButton.addEventListener('click', (...args)=>this.zoomIn(...args));
    this._zoomOutButton.addEventListener('click', (...args)=>this.zoomOut(...args));

    this._paletteModeInput.addEventListener('change',(...args)=>this.retrievePalette(...args));
    this._paletteSizeInput.addEventListener('change',(...args)=>this.retrievePalette(...args));
    this._paletteColorPicker.addEventListener('change',(...args)=>{
      this._viewData.paletteSeed = this.paletteSeed;
      this.retrievePalette(...args);
    });


    this._goButton.addEventListener('click', ()=>{
      this._viewData.x = parseFloat(this._realInput.value);
      this._viewData.y = parseFloat(this._imaginaryInput.value);
      this._viewData.scale = parseFloat(this._scaleInput.value);
      this.render();
    });

  }

  get paletteSeed (){
    return this._paletteColorPicker.value;
  }

  get paletteSize (){
    return this._paletteSizeInput.value;
  }

  get paletteMode(){
    return this._paletteModeInput.value;
  }

  async retrievePalette(){
    let response = await fetch(`//www.thecolorapi.com/scheme?hex=${this.paletteSeed.slice(1)}&mode=${this.paletteMode}&count=${this.paletteSize}`);
    let json = await response.json();
    this._r.palette = json.colors.map(c=>c.rgb);

    //_renderScene(this._r, this._viewData);
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
    //bring up something to stop extra rendering
    _renderScene(this._r, this._viewData);
    this.updateInterface();

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
