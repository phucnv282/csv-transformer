const fs = require('fs');
const readline = require('line-by-line');

function csvTransform(req, res) {
    return new Promise(function(resolve, reject) {
        try {
            // console.log(req.body);
            // console.log(req.files[0]);
            let inputUrl = req.files[0].path;
            let inputName = req.files[0].filename;
            let outputUrl = '';
            // let outputUrl = inputUrl.replace(inputUrl.slice(inputUrl.lastIndexOf('.') + 1), 'output.csv');
            // fs.writeFileSync(outputUrl, '');
            let rl = new readline(inputUrl);
            let buffer = '';
            let header = '';
            let numOfHeaderLines = parseInt(req.body.numOfHeaderLines);
            let format = req.body.format;
            let wellIndex = parseInt(req.body.wellIndex);
            let datasetIndex = parseInt(req.body.datasetIndex);
            let count = 0;
            let bufferCount = 0;
            let currentWell = '';
            let outputFiles = [];

            rl.on('line', function(line) {
                line = line.trim();
                //            line = line.replace(/\t|\s/g, ',');
                let arrayOfLine = line.split(
                    req.body.separator != '' ? req.body.separator : /\t|\s/g,
                );
                let lineWellName = '';
                if (count >= numOfHeaderLines - 2) {
                    if (format == 'W-R-V' || format == 'D-R-V') {
                        if (format == 'W-R-V') {
                            lineWellName = arrayOfLine[wellIndex];
                            arrayOfLine.splice(wellIndex, 1);
                        } else {
                            lineWellName = arrayOfLine[datasetIndex];
                            arrayOfLine.splice(datasetIndex, 1);
                        }
                        line = arrayOfLine.join(',');
                    } else {
                        lineWellName =
                            arrayOfLine[wellIndex] +
                            '.' +
                            arrayOfLine[datasetIndex];
                        arrayOfLine.splice(wellIndex, 1);
                        arrayOfLine.splice(datasetIndex - 1, 1);
                        line = arrayOfLine.join(',');
                    }
                }

                if (count < numOfHeaderLines) {
                    header += line + '\n';
                } else if (count == numOfHeaderLines) {
                    currentWell = lineWellName;
                    let fileName =
                        inputName.slice(0, inputName.indexOf('-') + 1) +
                        currentWell +
                        '.csv';
                    outputUrl = 'uploads/' + fileName;
                    fs.writeFileSync(outputUrl, header + line + '\n');
                    outputFiles.push(fileName);
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
                            let fileName =
                                inputName.slice(0, inputName.indexOf('-') + 1) +
                                currentWell +
                                '.csv';
                            outputUrl = 'uploads/' + fileName;
                            fs.writeFileSync(outputUrl, header + line + '\n');
                            outputFiles.push(fileName);
                        }
                    }
                }
                count++;
            });

            rl.on('end', function() {
                if (buffer.length != 0) {
                    fs.appendFileSync(outputUrl, buffer);
                }
                fs.unlinkSync(inputUrl);
                console.log('===>WriteFileSuccessfully');
                resolve(outputFiles);
            });
        } catch (err) {
            console.log(err);
            reject(err);
        }
    });
}

function downloadConvertedCSV(req, res) {
    return new Promise(function(resolve, reject) {
        let fileName = req.query.fileName;
        // let fileToDownload = fileName.replace(
        //     fileName.slice(fileName.lastIndexOf('.')),
        //     '.output.csv',
        // );
        if (fs.existsSync('uploads/' + fileName)) {
            resolve('uploads/' + fileName);
        } else {
            reject('===>SomethingWentWrong');
        }
    });
}

module.exports = {
    csvTransform: csvTransform,
    downloadConvertedCSV: downloadConvertedCSV,
};
