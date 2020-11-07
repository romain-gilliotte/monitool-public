import uiRouter from '@uirouter/angularjs';
import angular from 'angular';
import axios from 'axios';
import infiniteScroll from 'ng-infinite-scroll';
require(__scssPath);

const module = angular.module(__moduleName, [uiRouter, infiniteScroll]);

module.config($stateProvider => {
    $stateProvider.state('project.usage.log', {
        url: '/log',
        component: __componentName,
    });
});

module.component(__componentName, {
    bindings: {
        project: '<',
    },

    template: require(__templatePath),

    controller: class {
        constructor($scope) {
            'ngInject';

            this.$scope = $scope;
        }

        $onInit() {
            this.rows = [];
        }

        async loadMore() {
            console.log('loading');
            const pageSize = 20;
            this.infiniteScrollDisabled = true;

            const cursor = this?.rows[this.rows.length - 1]?._id;
            const response = await axios.get(`/project/${this.project._id}/input`, {
                params: { limit: pageSize, cursor },
                headers: { accept: 'application/json' },
            });

            const newRows = response.data.map(input => {
                const row = {};
                row._id = input._id;
                row.date = new Date(parseInt(input._id.substring(0, 8), 16) * 1000);
                row.author = input.author;
                row.period = input.content[0].dimensions.find(d => d.id === 'time').items[0];

                row.dataSourceName = this.project.forms.find(ds =>
                    ds.elements.some(v => v.id == input.content[0].variableId)
                ).name;
                row.siteName = this.project.entities.find(
                    site => site.id == input.content[0].dimensions[1].items[0]
                ).name;

                return row;
            });

            this.rows.push(...newRows);
            if (newRows.length === pageSize) {
                this.infiniteScrollDisabled = false;
            }

            this.$scope.$apply();
        }
    },
});

export default module.name;
