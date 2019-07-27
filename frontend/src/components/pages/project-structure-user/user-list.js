import angular from 'angular';

import uiRouter from '@uirouter/angularjs';
import 'angular-legacy-sortablejs-maintained';

import User from '../../../models/user';
import mtProjectUserEditModal from './project-user-edition';

const module = angular.module(
	'monitool.components.pages.project.structure.user',
	[
		uiRouter, // for $stateProvider
		'ng-sortable',

		mtProjectUserEditModal
	]
);


module.config($stateProvider => {

	$stateProvider.state('main.project.structure.user_list', {
		acceptedUsers: ['loggedIn'],
		url: '/users',
		component: 'projectUserList'
	});
});


module.component('projectUserList', {
	bindings: {
		// injected from parent component.
		project: '<',
		onProjectUpdate: '&'
	},

	template: require('./user-list.html'),

	controller: class ProjectUserListController {

		constructor($uibModal) {
			this.$uibModal = $uibModal;
		}

		$onInit() {
			this.sortableOptions = {
				handle: '.handle',
				onUpdate: () => this.onProjectUpdate({newProject: this.editableProject, isValid: true})
			}
		}

		$onChanges(changes) {
			if (changes.project)
				this.editableProject = angular.copy(this.project);
		}

		onEditUserClicked(user=null) {
			this.$uibModal
				.open({
					component: 'projectUserModal',
					size: 'lg',
					resolve: {
						projectUser: () => user,
						takenIds: () => this.editableProject.users.map(user => user.id).filter(u => !user || u != user.id),
						entities: () => this.editableProject.entities,
						groups: () => this.editableProject.groups,
						dataSources: () => this.editableProject.forms,
					}
				})
				.result
				.then(newUser => {
					// Edit
					if (user) {
						if (newUser) // Replace
							this.editableProject.users.splice(this.editableProject.users.indexOf(user), 1, newUser);
						else // Delete
							this.editableProject.users.splice(this.editableProject.users.indexOf(user), 1);
					}
					// Create
					else
						this.editableProject.users.push(newUser);

					this.onProjectUpdate({newProject: this.editableProject, isValid: true})
				})
				.catch(error => {});
		}

		onDeleteClicked(user) {
			this.editableProject.users.splice(
				this.editableProject.users.indexOf(user),
				1
			);

			this.onProjectUpdate({newProject: this.editableProject, isValid: true});
		}
	}
});


export default module.name;

