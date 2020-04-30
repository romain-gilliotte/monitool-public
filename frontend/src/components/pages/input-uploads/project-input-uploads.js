import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import axios from 'axios';

const module = angular.module(__moduleName, [uiRouter]);

module.config($stateProvider => {
    $stateProvider.state('project.usage.uploads', {
        url: '/input-uploads',
        component: __componentName,
        resolve: {
            uploads: $stateParams =>
                axios.get(`/project/${$stateParams.projectId}/scanned-forms`).then(r => r.data),
        },
    });
});

module.component(__componentName, {
    bindings: {
        uploads: '<',
    },
    template: require(__templatePath),
    controller: class {
        //
    },
});

export default module.name;
