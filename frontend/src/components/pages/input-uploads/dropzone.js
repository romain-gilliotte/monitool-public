import angular from 'angular';
import axios from 'axios';
require(__scssPath);

const module = angular.module(__moduleName, []);

const types = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/tiff',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/zip',
];

/**
 * The highlight counters works around dragenter/leave behaviour w/ child elements
 *
 * @see https://stackoverflow.com/questions/7110353/html5-dragleave-fired-when-hovering-a-child-element
 */
module.component(__componentName, {
    bindings: {
        project: '<',
    },
    template: require(__templatePath),
    controller: class {
        constructor($scope) {
            this.$scope = $scope;
        }

        $onInit() {
            // Used by the file input
            this.inputTypes = types.join(', ');

            // Used by the progress bar
            this.lastEvtPerFile = {};
            this.loaded = 0;
            this.total = 0;
        }

        onDragOver(e) {
            e.preventDefault();
            e.stopPropagation();

            this.highlight = e.target;
        }

        onDragLeave(e) {
            if (e.target === this.highlight) {
                e.preventDefault();
                e.stopPropagation();

                this.highlight = null;
            }
        }

        onDrop(e) {
            e.preventDefault();
            e.stopPropagation();

            this.highlight = null;
            this._handleFiles(e.dataTransfer.files);
        }

        onInputChange(e) {
            this._handleFiles(e.target.files);
        }

        _handleFiles(files) {
            const url = `/project/${this.project._id}/upload`;

            for (var i = 0; i < files.length; ++i) {
                if (types.includes(files[i].type)) {
                    const formData = new FormData();
                    formData.append('file', files[i]);

                    axios.post(url, formData, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                        onUploadProgress: this._onProgress.bind(this, files[i]),
                    });

                    this._onProgress(files[i], { loaded: 0, total: files[i].size }, false);
                }
            }
        }

        _onProgress(file, evt, apply = true) {
            const key = `${file.name}${file.size}`;
            const lastEvt = this.lastEvtPerFile[key] || { loaded: 0, total: 0 };
            this.lastEvtPerFile[key] = evt;

            this.loaded += evt.loaded - lastEvt.loaded;
            this.total += evt.total - lastEvt.total; // size correction

            const progress = this.loaded / this.total;
            this.uploading = progress < 1;
            this.progressWidth = `${100 * progress}%`;

            if (apply) this.$scope.$apply();
        }
    },
});

export default module.name;
