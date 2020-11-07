import uiRouter from '@uirouter/angularjs';
import angular from 'angular';
import axios from 'axios';
import TimeSlot from 'timeslot-dag';
import { executeQuery } from '../../../helpers/query-builder';
import mtPreviewTable from './preview-table';
require(__scssPath);

const module = angular.module(__moduleName, [uiRouter, mtPreviewTable]);

module.config($stateProvider => {
    $stateProvider.state('project.usage.preview', {
        url: '/preview/:inputId',
        component: __componentName,
        resolve: {
            input: $stateParams => fetchInputDiff($stateParams.projectId, $stateParams.inputId),
        },
    });
});

module.component(__componentName, {
    bindings: {
        project: '<',
        input: '<',
    },

    template: require(__templatePath),

    controller: class {
        constructor($rootScope, $filter) {
            'ngInject';

            this.$rootScope = $rootScope;
            this.dateFormat = $filter('date');
        }

        $onChanges() {
            this.date = this.dateFormat(new Date(), 'medium');
            this.period = new TimeSlot(this.input.content[0].dimensions[0].items[0]).humanizeValue(
                this.$rootScope.language
            );

            this.dataSourceName = this.project.forms.find(ds =>
                ds.elements.some(v => v.id == this.input.content[0].variableId)
            ).name;
            this.siteName = this.project.entities.find(
                site => site.id == this.input.content[0].dimensions[1].items[0]
            ).name;
        }

        getLabel(id) {
            const variables = this.project.forms.reduce((m, ds) => [...m, ...ds.elements], []);
            const partitionsEls = variables
                .reduce((m, v) => [...m, ...v.partitions], [])
                .reduce((m, p) => [...m, ...p.elements], []);

            const item = [...variables, ...partitionsEls].find(item => item.id === id);
            return item?.name || '[Deleted]';
        }
    },
});

export default module.name;

/**
 * Helper function to load an input, and which changes it caused.
 *
 * @param {string} projectId Id of the related project
 * @param {string} inputId Id of the related input
 */
async function fetchInputDiff(projectId, inputId) {
    // Fetch input
    const response = await axios.get(`/project/${projectId}/input/${inputId}`);
    const input = response.data;

    // Fetch data before this input was made
    await Promise.all(
        input.content.map(async c => {
            const query = {
                formula: 'variable',
                parameters: { variable: { variableId: c.variableId, dice: [] } },
                aggregate: c.dimensions.map(d => ({ id: d.id, attribute: d.attribute })),
                dice: c.dimensions,
                upto: input._id.substring(0, 8),
            };

            const dataBefore = await executeQuery(projectId, query, 'json', 'flatArray');
            for (let i = 0; i < c.data.length; ++i) {
                c.data[i] = { before: dataBefore[i], after: c.data[i] };
            }
        })
    );

    return input;
}
