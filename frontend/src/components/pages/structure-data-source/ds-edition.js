import angular from 'angular';
import { v4 as uuid } from 'uuid';
import uiRouter from '@uirouter/angularjs';
import uiSelect from 'ui-select';
import 'angular-legacy-sortablejs-maintained';
import 'ui-select/dist/select.min.css';
import mtElementFilter from '../../shared/ng-models/element-filter';
import mtPartitionList from './partition-list';
import mtPartitionDistribution from './partition-distribution';
import mtPartitionOrder from './partition-order';
require(__scssPath);

const module = angular.module(__moduleName, [
    uiRouter, // for $stateProvider
    'ng-sortable',

    uiSelect, // for partition group members

    mtElementFilter, // Sites & groups associated with form
    mtPartitionList,
    mtPartitionDistribution,
    mtPartitionOrder,
]);

module.config($stateProvider => {
    $stateProvider.state('project.config.collection_form_edition', {
        url: '/data-source/:dataSourceId',
        component: __componentName,
        resolve: {
            dsId: $stateParams => $stateParams.dataSourceId,
        },
    });
});

/**
 * fixme: splitting this to have a variable component would be great.
 */
module.component(__componentName, {
    bindings: {
        // From ui-router resolve
        dsId: '<',

        // From parent component
        project: '<',
        onProjectUpdate: '&',
    },

    template: require(__templatePath),

    controller: class {
        $onChanges(changes) {
            if (changes.project || changes.dsId) {
                // Are we creating a new data source?
                this.editableDataSource = angular.copy(
                    this.project.forms.find(ds => ds.id == this.dsId)
                );
                if (!this.editableDataSource) {
                    this.editableDataSource = {
                        id: this.dsId,
                        active: true,
                        name: '',
                        periodicity: 'month',
                        entities: this.project.entities.map(s => s.id),
                        elements: [],
                    };
                }
                this.onFieldChange();
            }
        }

        $onInit() {
            this.visibleVariableId = null;

            this.sortableOptions = {
                handle: '.panel-heading',
                onUpdate: this.onFieldChange.bind(this),
                onStart: () => {
                    this.visibleVariableId = null;
                },
            };
        }

        /**
         * Called from ng-change on all inputs:
         * tell parent component that we updated the project.
         */
        onFieldChange() {
            const newProject = angular.copy(this.project);
            const index = newProject.forms.findIndex(ds => ds.id === this.dsId);

            if (index !== -1) newProject.forms[index] = this.editableDataSource;
            else newProject.forms.push(this.editableDataSource);

            this.numActivePartitions = {};
            this.editableDataSource.elements.forEach(variable => {
                this.numActivePartitions[variable.id] = variable.partitions.reduce(
                    (m, p) => m + (p.active ? 1 : 0),
                    0
                );
            });

            this.onProjectUpdate({
                newProject: newProject,
                isValid:
                    // if the form is not loaded yet (calling from $onChanges), we can consider
                    // than the data source is not valid (because we know it's blank).
                    this.editableDataSource.name &&
                    this.editableDataSource.name.length > 0 &&
                    // Don't allow to save data sources with no variables.
                    this.editableDataSource.elements.length > 0 &&
                    // Don't allow disabling all variables
                    this.editableDataSource.elements.some(v => v.active) &&
                    // Check that the variable have a name for validity.
                    this.editableDataSource.elements.every(v => v.name && v.name.length > 0),
            });
        }

        onAddVariableClicked() {
            const newVariable = {
                id: uuid(),
                active: true,
                name: '',
                partitions: [],
                distribution: 0,
                geoAgg: 'sum',
                timeAgg: 'sum',
            };

            this.editableDataSource.elements.push(newVariable);
            this.onToggleVariableClicked(newVariable.id);
            this.onFieldChange();
        }

        onChangeVariableStatus(variable, newStatus) {
            variable.active = newStatus;
            if (this.visibleVariableId === variable.id && !newStatus) this.visibleVariableId = null;
            this.onFieldChange();
        }

        onRemoveVariableClicked(item) {
            const index = this.editableDataSource.elements.findIndex(
                arrItem => item.id === arrItem.id
            );

            this.editableDataSource.elements.splice(index, 1);
            this.onFieldChange();
        }

        onToggleVariableClicked(variableId) {
            const variable = this.editableDataSource.elements.find(v => v.id == variableId);
            if (variable.active) {
                this.visibleVariableId = this.visibleVariableId !== variableId ? variableId : null;
            } else {
                this.visibleVariableId = null;
            }
        }

        onPartitionUpdate(variable, newPartitions) {
            if (variable.partitions.length !== newPartitions.length)
                variable.distribution = Math.ceil(variable.partitions.length / 2);

            variable.partitions = newPartitions;
            this.onFieldChange();
        }
    },
});

export default module.name;
