import uiRouter from '@uirouter/angularjs';
import angular from 'angular';
import axios from 'axios';
import dropzone from './dropzone';
import upload from './upload';
require(__scssPath);

const module = angular.module(__moduleName, [uiRouter, dropzone, upload]);

module.config($stateProvider => {
    $stateProvider.state('project.usage.uploads', {
        url: '/input-uploads',
        component: __componentName,
        resolve: {
            uploads: $stateParams =>
                axios
                    .get(`/project/${$stateParams.projectId}/upload`, {
                        headers: { accept: 'application/json' },
                    })
                    .then(r => r.data),
        },
    });
});

module.component(__componentName, {
    bindings: {
        uploads: '<',
        project: '<',
    },
    template: require(__templatePath),
    controller: class {
        constructor($scope) {
            'ngInject';

            this.$scope = $scope;
        }

        $onInit() {
            this.history = [];
            this.hasMoreHistory = true;
        }

        $onChanges() {
            this.eventSource = new EventSource(`/api/project/${this.project._id}/upload`);
            this.eventSource.onmessage = this.onMessage.bind(this);
        }

        $onDestroy() {
            this.eventSource.close();
        }

        onMessage(message) {
            const action = JSON.parse(message.data);

            if (action.type === 'insert') {
                this.uploads.unshift(action.document);
            } else if (action.type === 'update') {
                // Update document.
                const index = this.uploads.findIndex(u => u._id == action.id);
                this.uploads[index] = Object.assign({}, this.uploads[index], action.update);

                // Remove if done
                if (this.uploads[index].status === 'hidden') {
                    this.uploads.splice(index, 1);
                }
            }

            this.$scope.$apply();
        }

        deleteUpload(upload, list) {
            axios.delete(`/project/${this.project._id}/upload/${upload._id}`);
            list.splice(list.indexOf(upload), 1);
        }

        async loadMore() {
            let url = `/project/${this.project._id}/upload-history`;
            if (this.history.length) {
                url += `?before=${this.history[this.history.length - 1]._id}`;
            }

            const response = await axios.get(url, { headers: { accept: 'application/json' } });
            this.history.push(...response.data);

            if (response.data.length < 20) {
                this.hasMoreHistory = false;
            }

            this.$scope.$apply();
        }
    },
});

export default module.name;
