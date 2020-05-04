import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import axios from 'axios';
require(__scssPath);

const module = angular.module(__moduleName, [uiRouter]);

module.config($stateProvider => {
    $stateProvider.state('project.usage.uploads', {
        url: '/input-uploads',
        component: __componentName,
        resolve: {
            uploads: $stateParams =>
                axios.get(`/project/${$stateParams.projectId}/upload`).then(r => r.data),
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
        //
    },
});

module.directive('dropzone', function () {
    return {
        restrict: 'A',
        scope: false,
        link: function (scope, element) {
            element.bind('dragover', e => {
                e.preventDefault();
                e.stopPropagation();
            });

            element.bind('drop', e => {
                e.stopPropagation();
                e.preventDefault();

                var files = e.dataTransfer.files;
                for (var i = 0; i < files.length; ++i) {
                    const formData = new FormData();
                    formData.append('file', files[i]);

                    axios.post(`/project/${scope.$ctrl.project._id}/upload`, formData, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                    });

                    // const file = files[i];
                    // const reader = new FileReader();
                    // reader.readAsArrayBuffer(file);
                    // reader.onload = progressEvent => {

                    //     axios.post(`/project/${scope.$ctrl.project._id}/uploads`, )
                    //     console.log(file);
                    //     console.log(reader);
                    // };
                }
            });
        },
    };
});

export default module.name;
