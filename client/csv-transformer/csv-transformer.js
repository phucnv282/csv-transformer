var app = angular.module('app', ['ngFileUpload']);

app.component('csvTransformer', {
    template: require('./csv-transformer.html'),
    controller: Controller,
    controllerAs: 'self',
});

Controller.$inject = [
    '$scope',
    '$timeout',
    '$element',
    '$window',
    '$http',
    'Upload',
];

function Controller($scope, $timeout, $element, $window, $http, Upload) {
    var self = this;

    this.$onInit = function() {
        self.allFileOnServer = [];
        self.files = [];
    };

    this.id = function(index) {
        return 'file' + index.toString();
    };

    this.showSettingModal = function($index) {
        $('.modal-dialog').draggable({
            handle: '.modal-header',
        });
    };

    this.removeFileFromList = function(index) {
        self.files.splice(index, 1);
    };

    this.onConvertButtonClicked = function() {
        for (let i = 0; i < self.files.length; i++) {
            if (
                self.files[i].canDownload == 'false' &&
                self.files[i].numOfHeaderLines > 0
            ) {
                let file = self.files[i];
                let headerLine = file.tableContent[0];
                let wellIndex = -1;
                let datasetIndex = -1;
                for (let i = 0; i < headerLine.length; i++) {
                    if (
                        file.wellCol.toUpperCase() ==
                        headerLine[i].toUpperCase()
                    ) {
                        wellIndex = i;
                    }
                    if (
                        file.datasetCol.toUpperCase() ==
                        headerLine[i].toUpperCase()
                    ) {
                        datasetIndex = i;
                    }
                }

                self.files[i].canDownload = 'pending';

                Upload.upload({
                    url: '/csv/csv-transformer',
                    arrayKey: '',
                    data: {
                        file: file.file,
                        numOfHeaderLines: file.numOfHeaderLines,
                        // headerLineIndex: file.headerLineIndex - 1,
                        // dataLineIndex: file.dataLineIndex - 1,
                        format: file.format,
                        separator: file.separator,
                        wellIndex: wellIndex,
                        datasetIndex: datasetIndex,
                    },
                }).then(
                    function(res) {
                        console.log('===>Success');
                        console.log(res.data);
                        res.data.forEach(function(file) {
                            self.allFileOnServer.push(file);
                        });
                        self.files[i].canDownload = 'true';
                        self.files[i].fileOnServer = res.data;
                    },
                    function(res) {
                        console.log('Error status: ' + res.status);
                    },
                );
            }
        }
    };

    this.changeSettingOption = function(lineName, index) {
        let thisFile = self.files[index];
        thisFile.choosingLine = lineName;
    };

    this.chooseLineIndex = function(file, indexLine) {
        let indexFile = self.files.indexOf(file);
        let thisFile = self.files[indexFile];
        if (thisFile.choosingLine == 'header') {
            thisFile.headerLineIndex = indexLine;
        } else if (thisFile.choosingLine == 'unit') {
            thisFile.unitLineIndex = indexLine;
        } else {
            thisFile.dataLineIndex = indexLine;
            thisFile.numOfHeaderLines = indexLine - 1;
        }
        self.checkDuplicateLine(thisFile.choosingLine, indexFile);
    };

    this.checkDuplicateLine = function(lineName, indexFile) {
        let thisFile = self.files[indexFile];
        if (lineName == 'header') {
            if (thisFile.headerLineIndex == thisFile.unitLineIndex) {
                thisFile.unitLineIndex = 0;
            } else if (thisFile.headerLineIndex == thisFile.dataLineIndex) {
                thisFile.dataLineIndex = 0;
            }
        } else if (lineName == 'unit') {
            if (thisFile.unitLineIndex == thisFile.headerLineIndex) {
                thisFile.headerLineIndex = 0;
            } else if (thisFile.unitLineIndex == thisFile.dataLineIndex) {
                thisFile.dataLineIndex = 0;
            }
        } else {
            if (thisFile.dataLineIndex == thisFile.headerLineIndex) {
                thisFile.headerLineIndex = 0;
            } else if (thisFile.dataLineIndex == thisFile.unitLineIndex) {
                thisFile.unitLineIndex = 0;
            }
        }
    };

    this.nextToSetting = function(index) {
        self.files[index].chooseHeaders = false;
        let thisFile = self.files[index];
        let allContent = self.files[index].allContent;
        let lines = [];
        let header = thisFile.allContent[thisFile.headerLineIndex - 1].split(
            thisFile.separator != '' ? thisFile.separator : /[ \t\,\;]/,
        );
        let unit = thisFile.allContent[thisFile.unitLineIndex - 1].split(
            thisFile.separator != '' ? thisFile.separator : /[ \t\,\;]/,
        );
        lines.push(header);
        lines.push(unit);
        for (let i = 0; i < thisFile.linesToShow; i++) {
            let line = allContent[thisFile.dataLineIndex - 1 + i].split(
                thisFile.separator != '' ? thisFile.separator : /[ \t\,\;]/,
            );
            let tarr = [];
            for (let j = 0; j < line.length; j++) {
                tarr.push(line[j]);
            }
            lines.push(tarr);
        }
        thisFile.tableContent = lines;
    };

    this.changeLinesToShow = function(index) {
        let thisFile = self.files[index];
        if (thisFile.viewContent.length > thisFile.linesToShow) {
            thisFile.viewContent.splice(
                thisFile.linesToShow,
                thisFile.viewContent.length - thisFile.linesToShow,
            );
        } else if (thisFile.viewContent.length < thisFile.linesToShow) {
            for (
                let i = thisFile.viewContent.length;
                i < thisFile.linesToShow;
                i++
            ) {
                if (i == thisFile.allContent.length) {
                    break;
                } else {
                    thisFile.viewContent.push(thisFile.allContent[i]);
                }
            }
        }
    };

    // this.setFormat = function(index, format) {
    //     // $element.find('.dropdown a')[4 * index].innerHTML =
    //     //     format + '<span class="caret"></span>';
    //     self.files[index].format = format;
    //     if (format == 'W-R-V') {
    //         self.files[index].chooseColumn = 'well';
    //     } else if (format == 'D-R-V') {
    //         self.files[index].chooseColumn = 'dataset';
    //     }
    // };

    this.formatFileSize = function(bytes, decimalPoint) {
        if (bytes == 0) return '0 Bytes';
        var k = 1000,
            dm = decimalPoint || 2,
            sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
            i = Math.floor(Math.log(bytes) / Math.log(k));
        return (
            parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
        );
    };

    this.settingForAllFile = function(index) {
        let thisFile = self.files[index];
        for (let i = 0; i < self.files.length; i++) {
            if (i != index && self.files[i].canDownload == 'false') {
                // $scope.$apply(function() {
                self.files[i].numOfHeaderLines = thisFile.numOfHeaderLines;
                self.files[i].headerLineIndex = thisFile.headerLineIndex;
                self.files[i].dataLineIndex = thisFile.dataLineIndex;
                self.files[i].format = thisFile.format;
                self.files[i].separator = thisFile.separator;
                self.files[i].wellCol = thisFile.wellCol;
                self.files[i].datasetCol = thisFile.datasetCol;
                // });
            }
        }
    };

    this.separatorChange = function(index) {
        let viewContent = self.files[index].viewContent;
        let lines = [];
        for (let i = 0; i < viewContent.length; i++) {
            let line = viewContent[i].split(
                self.files[index].separator != ''
                    ? self.files[index].separator
                    : /[ \t\,\;]/,
            );
            let tarr = [];
            for (let j = 0; j < line.length; j++) {
                tarr.push(line[j]);
            }
            lines.push(tarr);
        }
        self.files[index].tableContent = lines;
    };

    this.changeCol = function(file) {
        let indexFile = self.files.indexOf(file);
        let thisFile = self.files[indexFile];
        for (let i = 0; i < thisFile.tableContent[0].length; i++) {
            if (thisFile.chooseColumn == 'well') {
                if (thisFile.wellCol == '') {
                    thisFile.wellColIndex = -1;
                    break;
                }
                if (
                    thisFile.tableContent[0][i].toUpperCase() ==
                    thisFile.wellCol.toUpperCase()
                ) {
                    thisFile.wellColIndex = i;
                    if (thisFile.wellColIndex == thisFile.datasetColIndex) {
                        thisFile.datasetColIndex = -1;
                        thisFile.datasetCol = '';
                    }
                    break;
                } else {
                    thisFile.wellColIndex = -1;
                }
            } else {
                if (thisFile.datasetCol == '') {
                    thisFile.datasetColIndex = -1;
                    break;
                }
                if (
                    thisFile.tableContent[0][i].toUpperCase() ==
                    thisFile.datasetCol.toUpperCase()
                ) {
                    thisFile.datasetColIndex = i;
                    if (thisFile.wellColIndex == thisFile.datasetColIndex) {
                        thisFile.wellColIndex = -1;
                        thisFile.wellCol = '';
                    }
                    break;
                } else {
                    thisFile.datasetColIndex = -1;
                }
            }
        }
    };

    this.settingColumnIndex = function(file, indexCol) {
        let indexFile = self.files.indexOf(file);
        let thisFile = self.files[indexFile];
        if (thisFile.chooseColumn == 'well') {
            thisFile.wellColIndex = indexCol;
            thisFile.wellCol = thisFile.tableContent[0][indexCol];
        } else {
            thisFile.datasetColIndex = indexCol;
            thisFile.datasetCol = thisFile.tableContent[0][indexCol];
        }
        if (thisFile.wellCol == thisFile.datasetCol) {
            if (thisFile.chooseColumn == 'well') {
                thisFile.datasetCol = '';
                thisFile.datasetColIndex = -1;
            } else {
                thisFile.wellCol = '';
                thisFile.wellColIndex = -1;
            }
        }
    };

    this.wellColFocus = function(index) {
        self.files[index].chooseColumn = 'well';
    };

    this.datasetColFocus = function(index) {
        self.files[index].chooseColumn = 'dataset';
    };

    this.submitSetting = function(index) {
        let file = self.files[index];
        if (file.wellColIndex >= 0 && file.datasetColIndex >= 0) {
            self.files[index].format = 'W-D-R-V';
        } else if (file.wellColIndex >= 0 && file.datasetColIndex < 0) {
            self.files[index].format = 'W-R-V';
        } else if (file.wellColIndex < 0 && file.datasetColIndex >= 0) {
            self.files[index].format = 'D-R-V';
        }
    };

    // window.addEventListener('unload', function() {
    //     if (self.allFileOnServer.length > 0) {
    //         var request = new XMLHttpRequest();
    //         request.open('POST', '/csv/exit', false);
    //         request.setRequestHeader(
    //             'content-type',
    //             'application/x-www-form-urlencoded',
    //         );
    //         request.send('allFileOnServer=' + self.allFileOnServer);
    //     }
    // });

    this.formatShow = function(formatShort) {
        switch (formatShort) {
            case 'W-D-R-V':
                return 'Well-Dataset-Reference-Value';
                break;
            case 'W-R-V':
                return 'Well-Reference-Value';
                break;
            case 'D-R-V':
                return 'Dataset-Reference-Value';
                break;
            default:
                return '';
        }
    };

    $scope.$watch('files', function() {
        if ($scope.files) {
            $scope.files.forEach(file => {
                let myFile = {
                    file: file,
                    allContent: [],
                    viewContent: [],
                    tableContent: [],
                    linesToShow: 100,
                    canDownload: 'false',
                    fileOnServer: [],
                    size: self.formatFileSize(file.size, 1),
                    numOfHeaderLines: 0,
                    headerLineIndex: 0,
                    unitLineIndex: 0,
                    dataLineIndex: 0,
                    choosingLine: 'header',
                    format: '',
                    separator: '',
                    wellCol: '',
                    wellColIndex: -1,
                    datasetCol: '',
                    datasetColIndex: -1,
                    chooseHeaders: true,
                    chooseColumn: 'well',
                };

                var readFile = new FileReader();
                readFile.readAsText(file);
                readFile.onload = function(e) {
                    var contents = e.target.result;
                    var line = [];

                    var allTextLines = contents.split(/\r\n|\n/);
                    for (var i = 0; i < allTextLines.length; i++) {
                        allTextLines[i] = allTextLines[i].trim();
                        myFile.allContent.push(allTextLines[i]);
                        if (i < myFile.linesToShow) {
                            myFile.viewContent.push(allTextLines[i]);
                        }
                    }
                };
                readFile.onloadend = function() {
                    $scope.$apply(function() {
                        self.files.push(myFile);
                    });
                };
            });
        }
    });
}
