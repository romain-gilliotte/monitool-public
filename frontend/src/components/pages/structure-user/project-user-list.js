import axios from 'axios';
import uiRouter from '@uirouter/angularjs';
import angular from 'angular';
import 'angular-legacy-sortablejs-maintained';
import mtProjectUserEditModal from './project-user-modal';
import mtColumnsPanel from '../../shared/misc/columns-panel';
import mtHelpPanel from '../../shared/misc/help-panel';
require(__cssPath);

const module = angular.module(__moduleName, [uiRouter, 'ng-sortable', mtProjectUserEditModal, mtColumnsPanel, mtHelpPanel]);

module.config($stateProvider => {

	$stateProvider.state('project.config.user_list', {
		url: '/users',
		component: __componentName,
	});
});

module.component(__componentName, {
	bindings: {
		project: '<',
		invitations: '<'
	},

	template: require(__templatePath),

	controller: class ProjectUserListController {

		constructor($uibModal, $scope) {
			this.$uibModal = $uibModal;
			this.$scope = $scope;
		}

		async onEditClicked(oldIvt = null) {
			let newIvt = await this.$uibModal.open({
				component: 'projectUserModal',
				size: 'lg',
				resolve: {
					invitation: () => oldIvt,
					project: () => this.project,
					takenEmails: () => [
						this.project.owner,
						...this.invitations.map(i => i.email).filter(email => !oldIvt || email != oldIvt.email)
					]
				}
			}).result;

			// Edit
			if (oldIvt) {
				if (newIvt) {
					// Replace
					const response = await axios.put(`/resources/invitation/${invitation._id}`, newIvt);

					this.invitations.splice(
						this.invitations.indexOf(oldIvt),
						1,
						response.data
					);
				}
				else // Delete
					await this.onDeleteClicked(oldIvt);
			}
			// Create
			else {
				const response = await axios.post(`/resources/invitation`, newIvt);
				this.invitations.push(response.data);
			}

			this.$scope.$apply();
		}

		async onDeleteClicked(invitation) {
			// BAD!! we are modifying an attribute of the component.
			// we should notify our parent that we need them to change it.
			this.invitations.splice(this.invitations.indexOf(invitation), 1);
			await axios.delete(`/resources/invitation/${invitation._id}`);

			// this.onProjectUpdate({ newProject: this.editableProject, isValid: true });
		}
	}
});


export default module.name;

