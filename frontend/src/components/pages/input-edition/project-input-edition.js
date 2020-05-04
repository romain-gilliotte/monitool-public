import uiRouter from '@uirouter/angularjs';
import angular from 'angular';
import axios from 'axios';
import TimeSlot from 'timeslot-dag';
import mtTimeSlot from '../../../filters/time-slot';
import Input from '../../../models/input';
import mtHelpPanel from '../../shared/misc/help-panel';
import mtSaveBlock from '../../shared/project/save-block';
import mtImageScroll from './image-scroll';
import mtInputGrid from './input-grid';
import { TimeDimension } from 'olap-in-memory';
require(__scssPath);

const module = angular.module(__moduleName, [
    uiRouter,
    mtTimeSlot,
    mtInputGrid,
    mtSaveBlock,
    mtHelpPanel,
    mtImageScroll,
]);

module.config($stateProvider => {
    $stateProvider.state('project.usage.edit', {
        url: '/input/manual/:dataSourceId/:period/:siteId',
        component: __componentName,
        resolve: {
            mode: () => 'manual',
            metadata: ($stateParams, project) => ({
                dataSourceId: $stateParams.dataSourceId,
                period: $stateParams.period,
                siteId: $stateParams.siteId,
                variableIds: project.forms
                    .find(f => f.id === $stateParams.dataSourceId)
                    .elements.map(v => v.id),
            }),
        },
    });

    $stateProvider.state('project.usage.data_entry', {
        url: '/input/upload/:uploadId',
        component: __componentName,
        resolve: {
            mode: () => 'upload',
            upload: $stateParams =>
                axios
                    .get(`/project/${$stateParams.projectId}/upload/${$stateParams.uploadId}`)
                    .then(response => response.data),

            metadata: upload => ({
                period: null,
                siteId: null,
                variableIds: Object.keys(upload.reprojected.regions).filter(id =>
                    /^[-0-9a-f]+$/.test(id)
                ),
            }),
        },
    });
});

module.component(__componentName, {
    bindings: {
        project: '<',
        invitations: '<',

        mode: '<',
        metadata: '<',
        upload: '<',
    },

    template: require(__templatePath),

    controller: class {
        get isUnchanged() {
            return angular.equals(this.master, this.input);
        }

        constructor($rootScope, $scope, $state, $transitions, $filter) {
            'ngInject';

            this.$scope = $scope;
            this.userEmail = $rootScope.userEmail;
            this.$state = $state;
            this.$transitions = $transitions;
            this.translate = $filter('translate');
        }

        $onInit() {
            this._pageChangeWatch = this.$transitions.onStart({}, transition => {
                // if changes were made.
                const hasChanged = !angular.equals(this.master, this.input);
                if (hasChanged) {
                    // then ask the user if he meant to abandon changes
                    const hasConfirmed = window.confirm(this.translate('shared.sure_to_leave'));
                    if (hasConfirmed)
                        // We're leaving because the user does not mind losing changes => stop listening.
                        this._pageChangeWatch();
                    // Stay on the page.
                    else transition.abort();
                }
                // We're leaving because the data entry did not change => stop listening.
                else this._pageChangeWatch();
            });
        }

        $onChanges(changes) {
            // Convenience getters
            this.variables = this.project.forms
                .reduce((vars, ds) => [...vars, ...ds.elements], [])
                .filter(v => v.active && this.metadata.variableIds.includes(v.id));

            // Compute choices.
            this._initChoices();

            // If manual mode, lock choices.
            if (this.mode === 'manual') {
                this.period = this.metadata.period;
                this.siteId = this.metadata.siteId;
                this.metadataEditable = false;
                this.onMetadataSet();
            } else {
                this.period = TimeSlot.fromDate(new Date(), this.dataSource.periodicity).value;
                this.metadataEditable = true;
            }
        }

        async onMetadataSet() {
            if (!this.period || !this.siteId) {
                return;
            }

            this.metadataEditable = false;

            // Load input
            this.input = await Input.fetchInput(
                this.project,
                this.siteId,
                this.period,
                this.variables.map(v => v.id)
            );

            this.master = angular.copy(this.input);
            this._buildContentMapping();
            this.$scope.$apply();
        }

        fillWithZeros() {
            this.input.content.forEach(content => {
                content.data = content.data.map(d => (d ? d : 0));
            });
        }

        copy() {
            // bad naming.
            this.previousInput.content.forEach((content, index) => {
                this.input.content[index].data = content.data;
            });
        }

        async save() {
            if (this.isUnchanged || this.inputForm.$invalid || this.inputSaving) return;

            try {
                this.inputSaving = true;
                await this.input.save();
                angular.copy(this.input, this.master);
                this._buildContentMapping();
            } catch (error) {
                alert(this.translate('project.saving_failed'));
            } finally {
                this.inputSaving = false;
                this.$scope.$apply();
            }
        }

        reset() {
            angular.copy(this.master, this.input);
            this._buildContentMapping();
        }

        _buildContentMapping() {
            this.contentByVariableId = {};
            this.input.content.forEach(content => {
                this.contentByVariableId[content.variableId] = content;
            });
        }

        _initChoices() {
            // Sites depend on invitation.
            const myInvitation = this.invitations.find(i => i.email === this.userEmail);
            const dataSource = this.project.forms.find(ds => ds.id === this.metadata.dataSourceId);

            this.sites = this.project.entities.filter(
                e =>
                    e.active &&
                    this.dataSource.entities.includes(e.id) &&
                    (!myInvitation || myInvitation.dataEntry.siteIds.includes(e.id))
            );

            // Periods only on current date.
            const periodicity = this.dataSource.periodicity;
            let end = TimeSlot.fromDate(new Date(), periodicity).value;
            if (this.project.end < end) {
                end = this.project.end;
            }

            const dimension = new TimeDimension('time', periodicity, this.project.start, end);
            this.periods = dimension.getItems().reverse();
        }
    },
});

export default module.name;
