const fs = require('fs');
let readline = require('line-by-line');

function csvTransform(req, res) {
    return new Promise(function (resolve, reject) {
        let inputUrl = req.files[0].path;
        let outputUrl = inputUrl.replace(inputUrl.slice(inputUrl.lastIndexOf('.') + 1), 'output.csv');
        fs.writeFileSync(outputUrl, '');
        let rl = new readline(inputUrl);
        let buffer = '';
        let count = 0;

        rl.on('line', function (line) {
            line = line.trim();
            line = line.replace(/\t|\s/g, ",");
            buffer += line + '\n';
            count++;
            if (count == 1000) {
                fs.appendFileSync(outputUrl, buffer);
                buffer = '';
                count = 0;
            }
        });

        rl.on('end', function () {
            if (buffer.length != 0) {
                fs.appendFileSync(outputUrl, buffer);
            }
            fs.unlinkSync(inputUrl);
            console.log('===>WriteFileSuccessfully');
        });

        resolve(req.files[0].filename);
    });
}

function downloadConvertedCSV(req, res) {
    return new Promise(function (resolve, reject) {
        let fileName = req.query.fileName;
        let fileToDownload = fileName.replace(fileName.slice(fileName.lastIndexOf('.')), '.output.csv');
        if (fs.existsSync('uploads/' + fileToDownload)) {
            resolve('uploads/' + fileToDownload);
        } else {
            reject('===>SomethingWentWrong');
        }
    })
}

module.exports = {
    csvTransform: csvTransform,
    downloadConvertedCSV: downloadConvertedCSV
}