const DEFAULT_MAX_ITERATIONS = 1000;
class Renderer {
    constructor(canvasContext, options){
        this.context = canvasContext;
        this._maxIterations = options.maxIterations || DEFAULT_MAX_ITERATIONS;
    }
}