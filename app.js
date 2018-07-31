const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static(path.join(__dirname)));
app.use(express.static(path.join(__dirname, 'client')));
app.use('/csv', express.static(path.join(__dirname, 'client')));
app.use('/', require('./server/app.router'));
app.use('/ip', (req, res) => {
    res.send(req.connection.remoteAddress);
});

app.listen('8000', '0.0.0.0', function() {
    console.log('Listening on port 8000');
});
