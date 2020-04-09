import angular from 'angular';
import uiRouter from '@uirouter/angularjs';

const module = angular.module(__moduleName, [uiRouter]);

module.config($stateProvider => {

    $stateProvider.state('project.usage.downloads', {
        url: '/downloads',
        component: __componentName,
    });

});


module.component(__componentName, {

    bindings: {
        project: '<'
    },

    template: require(__templatePath),

    controller: class {

        constructor($rootScope, $element) {
            this.$rootScope = $rootScope;
            this.$element = $element[0];
        }

        $onChanges() {
            const serviceUrl = this.$rootScope.serviceUrl;
            const projectId = this.project._id;
            const token = this.$rootScope.accessToken;

            this.files = [
                ...this.project.logicalFrames.map(lf => {
                    const url = `${serviceUrl}/resources/project/${projectId}/logical-frame/${lf.id}`;

                    return {
                        id: lf.id,
                        category: 'project.logical_frame',
                        name: lf.name,
                        portrait: `${url}.pdf?token=${token}&orientation=portrait`,
                        landscape: `${url}.pdf?token=${token}&orientation=landscape`,
                        thumbnail: `${url}.png?token=${token}`
                    };
                }),
                ...this.project.forms.map(ds => {
                    const url = `${serviceUrl}/resources/project/${projectId}/data-source/${ds.id}`;

                    return {
                        id: ds.id,
                        category: 'project.collection_form2',
                        name: ds.name,
                        portrait: `${url}.pdf?token=${token}&orientation=portrait`,
                        landscape: `${url}.pdf?token=${token}&orientation=landscape`,
                        thumbnail: `${url}.png?token=${token}`,
                    };
                })
            ];
        }
    }
});


export default module.name;

