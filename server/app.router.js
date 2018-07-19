const express = require('express');
const multer = require('multer');
const csvTransformer = require('./csv-transformer/csv-transformer.model');

var router = express.Router();

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
})

var upload = multer({ storage: storage });

router.get('/', function (req, res) {
    res.sendFile('client/index.html');
});

router.get('/download', function (req, res) {
    csvTransformer.downloadConvertedCSV(req, res).then(result => {
        let fileName = req.query.fileName;
        let fileToDownload = fileName.replace(fileName.slice(fileName.lastIndexOf('.')), '.output.csv');
        res.download('uploads/' + fileToDownload, fileToDownload);
    }, err => {

    })
})

router.post('/csv-transformer', upload.array('file'), function (req, res) {
    csvTransformer.csvTransform(req, res)
        .then(result => {
            res.send(result);
        }, err => {
        })
});

module.exports = router;