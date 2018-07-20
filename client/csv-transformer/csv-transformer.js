var app = angular.module('app', ['ngFileUpload']);

app.component('csvTransformer', {
    templateUrl: 'csv-transformer/csv-transformer.html',
    controller: ['$scope', '$timeout', 'Upload', function ($scope, $timeout, Upload) {
        var self = this;
        this.$onInit = function () {
            self.files = [];
        };

        this.removeFileFromList = function (index) {
            self.files.splice(index, 1);
        }

        this.onConvertButtonClicked = function () {
            for (let i = 0; i < self.files.length; i++) {
                if (self.files[i].uploaded == false) {
                    Upload.upload({
                        url: '/csv-transformer',
                        arrayKey: '',
                        data: {
                            file: self.files[i].file,
                        }
                    }).then(function (res) {
                        console.log('===>Success');
                        self.files[i].canDownload = true;
                        self.files[i].uploaded = true;
                        self.files[i].nameOnServer = res.data;
                    });
                }
            }
        }

        this.formatFileSize = function (bytes, decimalPoint) {
            if (bytes == 0) return '0 Bytes';
            var k = 1000,
                dm = decimalPoint || 2,
                sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
                i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
        }

        $scope.$watch('files', function () {
            if ($scope.files) {
                $scope.files.forEach(file => {
                    let myfile = {
                        file: file,
                        canDownload: false,
                        nameOnServer: '',
                        uploaded: false,
                        size: self.formatFileSize(file.size, 3)
                    }
                    self.files.push(myfile);
                });
            }
        });
    }],
    controllerAs: 'self'
})