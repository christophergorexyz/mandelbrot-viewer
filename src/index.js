import Renderer from './graphics/renderer';
import Canvas from 'canvas';
import express from 'express';

let app = express();

app.use(express.static('static'));

app.get('/', (req, res) => {
    res.sendfile('static/index.html');
});

app.get('/preview/:x/:y/:scale', (req, res) => {
    res.setHeader('Content-Type', 'image/png');
    render(
        parseFloat(req.params.x),
        parseFloat(req.params.y),
        parseFloat(req.params.scale),
        200,
        200
    ).pipe(res);
});

app.get('/render/:width/:height/:x/:y/:scale', (req, res) => {
    res.setHeader('Content-Type', 'image/png');
    render(
        parseFloat(req.params.x),
        parseFloat(req.params.y),
        parseFloat(req.params.scale),
        parseInt(req.params.width),
        parseInt(req.params.height)
    ).pipe(res);
});

function render(x, y, scale, width, height) {
    let canvas = new Canvas(width, height),
        renderer = new Renderer(canvas);

    renderer.render(scale, x, y);

    return canvas.pngStream();
}

app.listen(3000);

console.log('Express server listening on port 3000');
