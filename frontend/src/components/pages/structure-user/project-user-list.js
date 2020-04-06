import uiRouter from '@uirouter/angularjs';
import angular from 'angular';
import 'angular-legacy-sortablejs-maintained';
import mtProjectUserEditModal from './project-user-modal';
import mtColumnsPanel from '../../shared/misc/columns-panel';
import mtHelpPanel from '../../shared/misc/help-panel';

const module = angular.module(__moduleName, [uiRouter, 'ng-sortable', mtProjectUserEditModal, mtColumnsPanel, mtHelpPanel]);

module.config($stateProvider => {

	$stateProvider.state('project.config.user_list', {
		url: '/users',
		component: __componentName
	});
});

module.component(__componentName, {
	bindings: {
		// injected from parent component.
		project: '<',
		onProjectUpdate: '&'
	},

	template: require(__templatePath),

	controller: class ProjectUserListController {

		constructor($uibModal) {
			this.$uibModal = $uibModal;
		}

		$onInit() {
			this.sortableOptions = {
				handle: '.handle',
				onUpdate: () => this.onProjectUpdate({ newProject: this.editableProject, isValid: true })
			}
		}

		$onChanges(changes) {
			if (changes.project)
				this.editableProject = angular.copy(this.project);
		}

		onEditUserClicked(user = null) {
			this.$uibModal
				.open({
					component: 'projectUserModal',
					size: 'lg',
					resolve: {
						projectUser: () => user,
						takenEmails: () => this.editableProject.users.map(user => user.email).filter(email => !user || email != user.email),
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

					this.onProjectUpdate({ newProject: this.editableProject, isValid: true })
				})
				.catch(error => { });
		}

		onDeleteClicked(user) {
			this.editableProject.users.splice(
				this.editableProject.users.indexOf(user),
				1
			);

			this.onProjectUpdate({ newProject: this.editableProject, isValid: true });
		}
	}
});


export default module.name;

