import angular from 'angular';
import { v4 as uuid } from 'uuid';
import uiRouter from '@uirouter/angularjs';
import 'angular-legacy-sortablejs-maintained';
import mtElementGroups from '../../shared/misc/element-groups';
import mtColumnsPanel from '../../shared/misc/columns-panel';
require(__scssPath);

const module = angular.module(__moduleName, [
    uiRouter,
    'ng-sortable',
    mtElementGroups,
    mtColumnsPanel,
]);

module.config($stateProvider => {
    $stateProvider.state('project.config.collection_form_list', {
        url: '/data-source',
        component: __componentName,
    });
});

module.component(__componentName, {
    bindings: {
        // injected from parent component.
        project: '<',
        onProjectUpdate: '&',
    },

    template: require(__templatePath),

    controller: class {
        constructor($state, $filter) {
            'ngInject';

            this.$state = $state;
            this.translate = $filter('translate');
        }

        $onInit() {
            this.dataSourceSortOptions = {
                group: 'datasources',
                handle: '.ds-handle',
                onUpdate: this.onFieldChange.bind(this),
            };

            this.variableSortOptions = {
                group: 'variables',
                onStart: () => document.body.classList.add('dragging'),
                onEnd: () => document.body.classList.remove('dragging'),
                onUpdate: this.onFieldChange.bind(this), // triggered when moving in the same list.
                onAdd: this.onFieldChange.bind(this), // triggered when moving from one list to another.
            };
        }

        $onChanges(changes) {
            // Project is a single way data bindings: we must not change it.
            if (changes.project) {
                this.editableProject = angular.copy(this.project);
                this._computeTimeToFill();
            }
        }

        _computeTimeToFill() {
            this.timeToFill = {};
            this.editableProject.forms.forEach(ds => {
                const cells = ds.elements.reduce((m, v) => {
                    if (!v.active) return 0;
                    else return m + v.partitions.reduce((m, p) => m * p.elements.length, 1);
                }, 0);

                // Assume 10 seconds / cell
                this.timeToFill[ds.id] = Math.max(1, Math.round((cells * 10) / 60));
            });
        }

        /**
         * Called from onUpdate for the list reordering:
         * tell parent component that we updated the project.
         */
        onFieldChange() {
            // Remove empty forms.
            if (this.editableProject.forms.some(ds => !ds.elements.length))
                this.editableProject.forms = this.editableProject.forms.filter(
                    ds => ds.elements.length
                );

            this.onProjectUpdate({
                newProject: this.editableProject,
                isValid: true,
            });
            this._computeTimeToFill();
        }

        onCreateClicked() {
            this.$state.go('project.config.collection_form_edition', {
                dataSourceId: uuid(),
            });
        }

        onChangeStatusClicked(dataSource, newStatus) {
            dataSource.active = newStatus;

            this.onFieldChange();
        }

        onDeleteClicked(dataSource) {
            var question = this.translate('project.confirm_delete_datasource');

            if (window.confirm(question)) {
                this.editableProject.forms.splice(
                    this.editableProject.forms.indexOf(dataSource),
                    1
                );

                this.onFieldChange();
            }
        }
    },
});

export default module.name;
