import angular from 'angular';
import axios from 'axios';
require(__scssPath);

const module = angular.module(__moduleName, []);

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
        constructor() {
            this.types = [
                'application/pdf',
                'image/jpeg',
                'image/png',
                'image/tiff',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/zip',
            ];

            this.inputTypes = this.types.join(', ');
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
            const options = { headers: { 'Content-Type': 'multipart/form-data' } };

            for (var i = 0; i < files.length; ++i) {
                if (this.types.includes(files[i].type)) {
                    const formData = new FormData();
                    formData.append('file', files[i]);
                    axios.post(url, formData, options);
                }
            }
        }
    },
});

export default module.name;
