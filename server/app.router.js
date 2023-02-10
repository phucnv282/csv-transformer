const express = require('express');
const multer = require('multer');
const csvTransformer = require('./csv-transformer/csv-transformer.model');

var router = express.Router();

var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    },
});

var upload = multer({storage: storage});

router.get('/download', function(req, res) {
    csvTransformer.downloadConvertedCSV(req, res).then(
        result => {
            res.download(result);
        },
        err => {
            console.log(err);
        },
    );
});

router.post('/download-all', function (req, res) {
    csvTransformer.downloadMultiConvertedCsv(req, res).then(
        result => {
            // res.download(result);
            // result.pipe(res)
            console.log(result)
        },
        err => {
            console.log(err);
        },
    )
})

router.post('/csv-transformer', upload.array('file'), function(req, res) {
    csvTransformer.csvTransform(req, res).then(
        result => {
            res.send(result);
            // console.log(result)
        },
        err => {
            console.log(err);
        },
    );
});

// router.post('/exit', function(req, res) {
//     csvTransformer.onExit(req, res).then(
//         result => {
//             res.send(result);
//             console.log(result);
//         },
//         err => {
//             console.log(err);
//         },
//     );
// });

module.exports = router;
