import uiRouter from '@uirouter/angularjs';
import angular from 'angular';
require(__scssPath);

const module = angular.module(__moduleName, [uiRouter]);

module.config($stateProvider => {
    $stateProvider.state('project.usage.downloads', {
        url: '/downloads',
        component: __componentName,
    });
});

module.component(__componentName, {
    bindings: {
        project: '<',
    },

    template: require(__templatePath),

    controller: class {
        constructor($rootScope, $element) {
            'ngInject';

            this.$rootScope = $rootScope;
            this.$element = $element[0];
        }

        $onChanges() {
            const projectId = this.project._id;
            const language = this.$rootScope.language;
            const serviceUrl = this.$rootScope.serviceUrl;

            this.files = [
                ...this.project.logicalFrames.map(lf => {
                    const url = `${serviceUrl}/project/${projectId}/logical-frame/${lf.id}`;

                    return {
                        id: lf.id,
                        category: 'project.logical_frame',
                        name: lf.name,
                        thumbnail: `${url}.pdf.png?language=${language}`,
                        main: {
                            icon: 'fa-file-pdf-o',
                            key: 'project.download_portrait',
                            url: `${url}.pdf?language=${language}&orientation=portrait`,
                        },
                        dropdown: [
                            {
                                icon: 'fa-file-pdf-o',
                                key: 'project.download_landscape',
                                url: `${url}.pdf?language=${language}&orientation=landscape`,
                            },
                        ],
                    };
                }),
                ...this.project.forms.map(ds => {
                    const url = `${serviceUrl}/project/${projectId}/data-source/${ds.id}`;

                    return {
                        id: ds.id,
                        category: 'project.collection_form2',
                        name: ds.name,
                        thumbnail: `${url}.pdf.png?language=${language}`,
                        main: {
                            key: 'project.download_portrait',
                            icon: 'fa-file-pdf-o',
                            url: `${url}.pdf?language=${language}&orientation=portrait`,
                        },
                        dropdown: [
                            {
                                icon: 'fa-file-pdf-o',
                                key: 'project.download_landscape',
                                url: `${url}.pdf?language=${language}&orientation=landscape`,
                            },
                        ],
                    };
                }),
                ...this.project.forms.map(ds => {
                    const url = `${serviceUrl}/project/${projectId}/data-source/${ds.id}`;

                    return {
                        id: ds.id + 'xls',
                        category: 'project.collection_form2',
                        name: ds.name,
                        thumbnail: `${url}.xlsx.png?language=${language}`,
                        main: {
                            key: 'project.download_excel',
                            icon: 'fa-file-excel-o',
                            url: `${url}.xlsx?language=${language}`,
                        },
                    };
                }),
            ];
        }
    },
});

export default module.name;
