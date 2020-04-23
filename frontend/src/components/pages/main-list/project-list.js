import uiRouter from '@uirouter/angularjs';
import angular from 'angular';
import uiDropdown from 'angular-ui-bootstrap/src/dropdown';
import axios from 'axios';
import diacritics from 'diacritics';
import Project from '../../../models/project';
import mtColumnsPanel from '../../shared/misc/columns-panel';

require(__scssPath);

const module = angular.module(__moduleName, [uiDropdown, uiRouter, mtColumnsPanel]);

module.config($stateProvider => {
    $stateProvider.state('main.projects', {
        url: '/projects',
        component: __componentName,
        resolve: {
            lastInputDate: async () => {
                const response = await axios.get('/rpc/get-last-inputs');
                return response.data;
            },
        },
    });
});

module.component(__componentName, {
    bindings: {
        projects: '<',
        lastInputDate: '<',
    },

    template: require(__templatePath),

    controller: class {
        constructor($rootScope, $filter, $scope, $state, $window) {
            'ngInject';

            this.userEmail = $rootScope.profile.email;
            this.$scope = $scope;
            this.$state = $state;
            this.$window = $window;
            this.translate = $filter('translate');

            this.displayOngoing = true;
            this.displayFinished = true;
            this.displayArchived = false;
        }

        $onChanges(changes) {
            this.displayedProjects = this.projects.slice();
            this.numOngoingProjects = this.numFinishedProjects = this.numArchivedProjects = 0;

            this.displayedProjects.forEach(p => {
                p.running = p.end > new Date().toISOString().slice(0, 10);
                p.favorite = !!localStorage['favorites::projects::' + p._id];

                if (!p.active) {
                    p.variant = 'archived';
                    this.numArchivedProjects++;
                } else if (!p.running) {
                    p.variant = 'dashed';
                    this.numFinishedProjects++;
                } else {
                    p.variant = 'default';
                    this.numOngoingProjects++;
                }
            });

            this.displayedProjects = this.displayedProjects.filter(p => {
                const search = diacritics.remove(p.country + '//' + p.name || '').toLowerCase();
                const needle = diacritics.remove(this.filterValue || '').toLowerCase();

                const matchSearch = search.includes(needle);
                const matchOngoing = this.displayOngoing && p.running && p.active;
                const matchFinished = this.displayFinished && !p.running && p.active;
                const matchArchived = this.displayArchived && !p.active;

                return matchSearch && (matchOngoing || matchFinished || matchArchived);
            });

            this.displayedProjects.sort((p1, p2) => {
                const p1f = [p1.favorite, p1.country || 'zzz', p1.name, p1.end];
                const p2f = [p2.favorite, p2.country || 'zzz', p2.name, p2.end];

                for (let i = 0; i < p1f.length; ++i) {
                    if (typeof p1f[i] == 'boolean' && p1f[i] !== p2f[i]) return p1f[i] ? -1 : 1;

                    if (typeof p1f[i] == 'string' && p1f[i] !== p2f[i])
                        return p1f[i].localeCompare(p2f[i]);
                }

                return 0;
            });
        }

        filter() {
            this.$onChanges();
        }

        showAll() {
            this.filterValue = '';
            this.displayOngoing = true;
            this.displayFinished = true;
            this.displayArchived = true;
            this.$onChanges();
        }

        toggleOngoing() {
            this.displayOngoing = !this.displayOngoing;
            this.$onChanges();
        }

        toggleFinished() {
            this.displayFinished = !this.displayFinished;
            this.$onChanges();
        }

        toggleArchived() {
            this.displayArchived = !this.displayArchived;
            this.$onChanges();
        }

        toggleFavorite(p) {
            const lsKey = 'favorites::projects::' + p._id;

            if (localStorage[lsKey]) delete localStorage[lsKey];
            else localStorage[lsKey] = 'yes';

            this.$onChanges();
            this.$window.scrollTo(0, 0);
        }

        createProject() {
            this.$state.go('project.config.home', { projectId: 'new' });
        }

        async unInvite(project) {
            var question = this.translate('project.are_you_sure_to_uninvite');

            if (window.confirm(question)) {
                this.projects.splice(this.projects.indexOf(project), 1);
                this.$onChanges();

                const response = await axios.get(`/project/${project._id}/invitation`);
                const invitationId = response.data[0]._id;
                await axios.delete(`/invitation/${invitationId}`);
            }
        }

        async onCloneClicked(project, withInputs) {
            const response = await axios.post('/rpc/clone-project', {
                projectId: project._id,
                withInputs,
            });
            const newProject = response.data;

            this.projects.push(newProject);
            this.lastInputDate[newProject._id] = withInputs
                ? this.lastInputDate[project._id]
                : null;

            this.$onChanges();
            this.$scope.$apply();
            this.$window.scrollTo(0, 0);
        }

        async onArchiveClicked(shortProject) {
            const project = await Project.get(shortProject._id);
            project.active = false;

            try {
                await project.save();

                this.projects = await Project.fetchAll();
                this.$onChanges();
                this.$scope.$apply();
            } catch (error) {
                // Display message to tell user that it's not possible to save.
                alert(this.translate('project.saving_failed'));
            }
        }

        async onRestoreClicked(shortProject) {
            const project = await Project.get(shortProject._id);
            project.active = true;

            try {
                await project.save();

                this.projects = await Project.fetchAll();
                this.$onChanges();
                this.$scope.$apply();
            } catch (error) {
                // Display message to tell user that it's not possible to save.
                alert(this.translate('project.saving_failed'));
            }
        }
    },
});

export default module.name;
