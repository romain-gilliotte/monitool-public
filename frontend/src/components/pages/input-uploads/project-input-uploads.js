import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import axios from 'axios';
import dropzone from './dropzone';
require(__scssPath);

const module = angular.module(__moduleName, [uiRouter, dropzone]);

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
            this.$scope = $scope;
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
                const upload = this.uploads[index];
                for (let key in action.update) {
                    upload[key] = action.update[key];
                }

                // Remove if done
                if (upload.status === 'done') {
                    this.uploads.splice(index, 1);
                }
            }

            this.$scope.$apply();
        }
    },
});

export default module.name;
