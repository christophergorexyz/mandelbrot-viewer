'use strict';
let express = require('express'),
    app = express();
    //renderer = require('./js/renderer');


app.use('/js', express.static('js'));

app.get('/', (req, res)=>{
    res.sendfile('index.html');
});

app.listen(3000);
