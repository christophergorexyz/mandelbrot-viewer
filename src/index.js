import Renderer from './ui/renderer';
import Canvas from 'canvas';
import express from 'express';

let app = express();

app.use(express.static('static'));

app.get('/', (req, res) => {
    res.sendfile('static/index.html');
});

app.get('/preview/:x/:y/:scale', (req, res) => {
    res.setHeader('Content-Type', 'image/png');
    render(req.x, req.y, req.scale, 200, 200).pipe(res);
});

app.get('/render/:width/:height/:x/:y/:scale', (req, res) => {
    let x = req.x,
        y = req.y,
        scale = req.scale,
        width = req.width,
        height = req.height;

    res.setHeader('Content-Type', 'image/png');
    render(x, y, scale, width, height).pipe(res);

});

function render(x, y, scale, width, height) {
    console.log(Renderer);
    let canvas = new Canvas(width, height),
        renderer = new Renderer(canvas);

    renderer.renderScene({
        x: x,
        y: y,
        scale: scale
    });

    return canvas.pngStream();
}

app.listen(3000);
