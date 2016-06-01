'use strict';
let express = require('express');
let app = express();

app.use('/js', express.static('js'));

app.get('/', (req, res)=>{
    res.sendfile('index.html');
});

app.listen(3000);
