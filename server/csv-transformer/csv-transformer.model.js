const fs = require('fs');
const rl = require('readline');

function csvTransform(req, res) {
  return new Promise(function(resolve, reject) {
    try {
      // console.log(req.body);
      // console.log(req.files[0]);
      let inputUrl = req.files[0].path;
      let inputName = req.files[0].filename;
      let outputUrl = '';
      let buffer = '';
      let header = '';
      let headerLineIndex = parseInt(req.body.headerLineIndex);
      let unitLineIndex = parseInt(req.body.unitLineIndex);
      let dataLineIndex = parseInt(req.body.dataLineIndex);
      let format = req.body.format;
      let wellIndex = parseInt(req.body.wellIndex);
      let datasetIndex = parseInt(req.body.datasetIndex);
      let separator = req.body.separator;
      let count = 0;
      let bufferCount = 0;
      let currentWell = '';
      let outputFiles = [];

      let readLine = rl.createInterface({
        input: fs.createReadStream(inputUrl),
      });

      readLine.on('line', function(line) {
        line = line.trim();
        let arrayOfLine = line.split(
          req.body.separator != '' ? req.body.separator : /[ \t\,\;]/,
        );

        let lineWellName = '';
        if (
          count == headerLineIndex ||
          count == unitLineIndex ||
          count >= dataLineIndex
        ) {
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

        if (count == headerLineIndex || count == unitLineIndex) {
          header += line + '\n';
        } else if (count == dataLineIndex) {
          currentWell = lineWellName;
          let fileName =
            inputName.slice(0, inputName.indexOf('-')) +
            '0-' +
            currentWell +
            '.csv';
          fileName = fileName.replace('/', '-');
          outputUrl = 'uploads/' + fileName;
          // console.log(outputUrl);
          fs.writeFileSync(outputUrl, header + line + '\n');
          outputFiles.push(fileName);
        } else if (count > dataLineIndex) {
          if (currentWell == lineWellName) {
            buffer += line + '\n';
            bufferCount++;
            if (bufferCount == 1000) {
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
                inputName.slice(0, inputName.indexOf('-')) +
                '0-' +
                currentWell +
                '.csv';
              fileName = fileName.replace('/', '-');
              outputUrl = 'uploads/' + fileName;
              fs.writeFileSync(outputUrl, header + line + '\n');
              outputFiles.push(fileName);
            }
          }
        }
        count++;
      });

      readLine.on('close', function() {
        if (buffer.length != 0) {
          fs.appendFileSync(outputUrl, buffer);
        }
        fs.unlinkSync(inputUrl);
        console.log(inputUrl);
        console.log(outputUrl);
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
    if (fs.existsSync('uploads/' + fileName)) {
      resolve('uploads/' + fileName);
    } else {
      reject('===>SomethingWentWrong');
    }
  });
}

// function onExit(req, res) {
//     return new Promise(function(resolve, reject) {
//         try {
//             let fileArr = req.body.allFileOnServer.split(',');
//             fileArr.forEach(function(file) {
//                 if (fs.existsSync('uploads/' + file)) {
//                     fs.unlinkSync('uploads/' + file);
//                 }
//             });
//             resolve('===>Clean all files completely');
//         } catch (err) {
//             reject(err);
//         }
//     });
// }

module.exports = {
  csvTransform: csvTransform,
  downloadConvertedCSV: downloadConvertedCSV,
  // onExit: onExit,
};
