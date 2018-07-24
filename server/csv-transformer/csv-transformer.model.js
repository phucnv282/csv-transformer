const fs = require('fs');
const readline = require('line-by-line');

function csvTransform(req, res) {
    return new Promise(function (resolve, reject) {
        // console.log(req.body);
        let inputUrl = req.files[0].path;
        let outputUrl = '';
        // let outputUrl = inputUrl.replace(inputUrl.slice(inputUrl.lastIndexOf('.') + 1), 'output.csv');
        // fs.writeFileSync(outputUrl, '');
        let rl = new readline(inputUrl);
        let buffer = '';
        let header = '';
        let numOfHeaderLines = parseInt(req.body.numOfHeaderLines);
        let format = req.body.format;
        let count = 0;
        let bufferCount = 0;
        let currentWell = '';

        rl.on('line', function (line) {
            line = line.trim();
            line = line.replace(/\t|\s/g, ",");
            let arrayOfLine = line.split(',');
            let lineWellName = '';
            if (count >= numOfHeaderLines - 2) {
                if (format == 'W-R-V' || format == 'D-R-V') {
                    line = arrayOfLine.slice(1).join(',');
                    if (count >= numOfHeaderLines) {
                        lineWellName = arrayOfLine[0];
                    }
                } else {
                    line = arrayOfLine.slice(2).join(',');
                    if (count >= numOfHeaderLines) {
                        lineWellName = arrayOfLine[0] + '.' + arrayOfLine[1];
                    }
                }
            }

            if (count < numOfHeaderLines) {
                header += line + '\n';
            } else if (count == numOfHeaderLines) {
                currentWell = lineWellName;
                outputUrl = 'uploads/' + currentWell + '.csv';
                fs.writeFileSync(outputUrl, header + line);
            } else {
                if (currentWell == lineWellName) {
                    buffer += line + '\n';
                    bufferCount++;
                    if (bufferCount == 1000) {
                        // console.log(outputUrl);
                        fs.appendFileSync(outputUrl, buffer);
                        buffer = '';
                        bufferCount = 0;
                    }
                } else {
                    if (lineWellName) {
                        if (buffer) {
                            fs.appendFileSync(outputUrl, buffer);
                            buffer = '';
                            bufferCount = 0;
                        }
                        currentWell = lineWellName;
                        outputUrl = 'uploads/' + currentWell + '.csv';
                        fs.writeFileSync(outputUrl, header + line);
                    }
                }
            }
            count++;
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
