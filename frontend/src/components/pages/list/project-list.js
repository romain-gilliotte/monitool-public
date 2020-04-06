import uiRouter from '@uirouter/angularjs';
import angular from 'angular';
import axios from 'axios';
import diacritics from 'diacritics';
import Project from '../../../models/project';
import mtHelpPanel from '../../shared/misc/help-panel';
import mtProjectPanel from './project-panel';
require(__cssPath);

const module = angular.module(__moduleName, [uiRouter, mtHelpPanel, mtProjectPanel]);

module.config($stateProvider => {
	$stateProvider.state('projects', {
		url: '/projects',
		component: __componentName,
		resolve: {
			projects: () => Project.fetchAll(),
			lastInputDate: async () => {
				const response = await axios.get('/rpc/get-last-inputs');
				return response.data;
			}
		}
	});
});


module.component(__componentName, {
	bindings: {
		projects: '<',
		lastInputDate: '<'
	},

	template: require(__templatePath),

	controller: class ProjectListController {

		constructor($rootScope, $filter, $scope, $state, $window) {
			this.userEmail = $rootScope.profile.email;
			this.$scope = $scope;
			this.$state = $state;
			this.$window = $window;
			this.translate = $filter('translate');

			this.displayOngoing = true;
			this.displayFinished = false;
			this.displayDeleted = false;
		}

		$onChanges(changes) {
			this.displayedProjects = this.projects.slice();

			this.displayedProjects.forEach(p => {
				p.running = p.end > new Date().toISOString().slice(0, 10);
				p.favorite = !!localStorage['favorites::projects::' + p._id];

				if (!p.active) p.variant = 'deleted';
				else if (!p.running) p.variant = 'dashed';
				else p.variant = 'default';
			});

			this.displayedProjects = this.displayedProjects.filter(p => {
				const search = diacritics.remove(p.country + '//' + p.name || '').toLowerCase();
				const needle = diacritics.remove(this.filterValue || '').toLowerCase();

				const matchSearch = search.includes(needle);
				const matchOngoing = this.displayOngoing && p.running && p.active;
				const matchFinished = this.displayFinished && !p.running && p.active;
				const matchDeleted = this.displayDeleted && !p.active;

				return matchSearch && (matchOngoing || matchFinished || matchDeleted)
			});

			this.displayedProjects.sort((p1, p2) => {
				const p1f = [p1.favorite, p1.country || 'zzz', p1.name, p1.end];
				const p2f = [p2.favorite, p2.country || 'zzz', p2.name, p2.end];

				for (let i = 0; i < p1f.length; ++i) {
					if (typeof p1f[i] == 'boolean' && p1f[i] !== p2f[i])
						return p1f[i] ? -1 : 1;

					if (typeof p1f[i] == 'string' && p1f[i] !== p2f[i])
						return p1f[i].localeCompare(p2f[i])
				}

				return 0;
			});
		}

		filter() {
			this.$onChanges();
		}

		logout() {
			window.auth0.logout({
				returnTo: window.location.origin
			});
		}

		toggleOngoing() {
			this.displayOngoing = !this.displayOngoing;
			this.$onChanges();
		}

		toggleFinished() {
			this.displayFinished = !this.displayFinished;
			this.$onChanges();
		}

		toggleDeleted() {
			this.displayDeleted = !this.displayDeleted;
			this.$onChanges();
		}

		createProject() {
			this.$state.go('project.structure.home', { projectId: 'new' });
		}

		async onCloneClicked(project, withInputs) {
			const response = await axios.post('/rpc/clone-project', { projectId: project._id, withInputs });
			const newProject = response.data;

			this.projects.push(newProject);
			this.lastInputDate[newProject._id] = withInputs ? this.lastInputDate[project._id] : null;

			this.$onChanges();
			this.$scope.$apply();
			this.$window.scrollTo(0, 0);
		}

		async onDeleteClicked(shortProject) {
			var question = this.translate('project.are_you_sure_to_delete');

			if (window.confirm(question)) {
				const project = await Project.get(shortProject._id);
				project.active = false;

				try {
					await project.save();

					this.projects = await Project.fetchAll();
					this.$onChanges();
					this.$scope.$apply();
				}
				catch (error) {
					// Display message to tell user that it's not possible to save.
					alert(this.translate('project.saving_failed'));
				}
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
			}
			catch (error) {
				// Display message to tell user that it's not possible to save.
				alert(this.translate('project.saving_failed'));
			}
		}

	}
});

export default module.name;
