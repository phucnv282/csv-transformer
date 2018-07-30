var app = angular.module('app', ['ngFileUpload']);

app.component('csvTransformer', {
    templateUrl: 'csv-transformer.html',
    controller: [
        '$scope',
        '$timeout',
        '$element',
        'Upload',
        function($scope, $timeout, $element, Upload) {
            var self = this;

            this.$onInit = function() {
                self.files = [];
            };

            this.id = function(index) {
                return 'file' + index.toString();
            };

            this.removeFileFromList = function(index) {
                self.files.splice(index, 1);
            };

            this.onConvertButtonClicked = function() {
                for (let i = 0; i < self.files.length; i++) {
                    if (
                        self.files[i].canDownload == false &&
                        self.files[i].numOfHeaderLines >= 0
                    ) {
                        let file = self.files[i];
                        let headerLine = file.viewContent[
                            file.numOfHeaderLines - 2
                        ].split(
                            file.separator != '' ? file.separator : /\s|\t/g,
                        );
                        let wellIndex;
                        let datasetIndex;
                        for (let i = 0; i < headerLine.length; i++) {
                            if (file.wellCol.toUpperCase() == headerLine[i]) {
                                wellIndex = i;
                            }
                            if (
                                file.datasetCol.toUpperCase() ==
                                headerLine[i].toUpperCase()
                            ) {
                                datasetIndex = i;
                            }
                        }

                        Upload.upload({
                            url: '/csv-transformer',
                            arrayKey: '',
                            data: {
                                file: file.file,
                                numOfHeaderLines: file.numOfHeaderLines,
                                format: file.format,
                                separator: file.separator,
                                wellIndex: wellIndex,
                                datasetIndex: datasetIndex,
                            },
                        }).then(function(res) {
                            console.log('===>Success');
                            self.files[i].canDownload = true;
                            console.log(res.data);
                            self.files[i].fileOnServer = res.data;
                            console.log(file);
                        });
                    } else {
                        console.log('===>Please choose header part');
                    }
                }
            };

            this.nextToSetting = function(index) {
                self.files[index].chooseHeaders = false;
                let viewContent = self.files[index].viewContent;
                let lines = [];
                for (let i = 0; i < viewContent.length; i++) {
                    let line = viewContent[i].split(
                        self.files[index].separator,
                    );
                    let tarr = [];
                    for (let j = 0; j < line.length; j++) {
                        tarr.push(line[j]);
                    }
                    lines.push(tarr);
                }
                self.files[index].tableContent = lines;
            };

            this.setFormat = function(file, format) {
                // $element.find('.dropdown a')[4 * index].innerHTML =
                //     format + '<span class="caret"></span>';
                self.files[self.files.indexOf(file)].format = format;
            };

            this.formatFileSize = function(bytes, decimalPoint) {
                if (bytes == 0) return '0 Bytes';
                var k = 1000,
                    dm = decimalPoint || 2,
                    sizes = [
                        'Bytes',
                        'KB',
                        'MB',
                        'GB',
                        'TB',
                        'PB',
                        'EB',
                        'ZB',
                        'YB',
                    ],
                    i = Math.floor(Math.log(bytes) / Math.log(k));
                return (
                    parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) +
                    ' ' +
                    sizes[i]
                );
            };

            this.settingForAllFile = function(index) {
                let thisFile = self.files[index];
                for (let i = 0; i < self.files.length; i++) {
                    if (i != index && !self.files[i].canDownload) {
                        // $scope.$apply(function() {
                        self.files[i].numOfHeaderLines =
                            thisFile.numOfHeaderLines;
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
                            : /\t|\s/g,
                    );
                    let tarr = [];
                    for (let j = 0; j < line.length; j++) {
                        tarr.push(line[j]);
                    }
                    lines.push(tarr);
                }
                self.files[index].tableContent = lines;
            };

            $scope.$watch('files', function() {
                if ($scope.files) {
                    $scope.files.forEach(file => {
                        let myFile = {
                            file: file,
                            viewContent: [],
                            tableContent: [],
                            canDownload: false,
                            fileOnServer: [],
                            size: self.formatFileSize(file.size, 1),
                            numOfHeaderLines: -1,
                            format: 'W-D-R-V',
                            separator: ',',
                            wellCol: 'well',
                            datasetCol: 'dataset',
                            chooseHeaders: true,
                        };

                        var readFile = new FileReader();
                        readFile.readAsText(file);
                        readFile.onload = function(e) {
                            var contents = e.target.result;
                            var line = [];

                            var allTextLines = contents.split(/\r\n|\n/);
                            for (
                                var i = 0;
                                i < allTextLines.length && i < 30;
                                i++
                            ) {
                                allTextLines[i] = allTextLines[i].trim();
                                myFile.viewContent.push(allTextLines[i]);
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
        },
    ],
    controllerAs: 'self',
});
