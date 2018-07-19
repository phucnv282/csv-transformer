const express = require('express');
const path = require('path');
var bodyParser = require('body-parser');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname)));
app.use(express.static(path.join(__dirname, 'client')));

app.use('/', require('./server/app.router'));

app.listen('8000', function () {
    console.log("Listening on port 8000");
});