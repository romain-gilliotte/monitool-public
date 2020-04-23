import axios from 'axios';
import uiRouter from '@uirouter/angularjs';
import angular from 'angular';
import 'angular-legacy-sortablejs-maintained';
import mtProjectInvitationModal from './project-invitation-modal';
import mtColumnsPanel from '../../shared/misc/columns-panel';
import mtHelpPanel from '../../shared/misc/help-panel';
require(__cssPath);

const module = angular.module(__moduleName, [uiRouter, 'ng-sortable', mtProjectInvitationModal, mtColumnsPanel, mtHelpPanel]);

module.config($stateProvider => {

	$stateProvider.state('project.config.invitation_list', {
		url: '/invitations',
		component: __componentName,
	});
});

module.component(__componentName, {
	bindings: {
		project: '<',
		invitations: '<'
	},

	template: require(__templatePath),

	controller: class {

		constructor($uibModal, $scope) {
			"ngInject";

			this.$uibModal = $uibModal;
			this.$scope = $scope;
		}

		async onEditClicked(oldIvt = null) {
			let newIvt = await this.$uibModal.open({
				component: 'projectInvitationModal',
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
					const { _id, ...body } = newIvt;
					const response = await axios.put(`/invitation/${_id}`, body);

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
				const response = await axios.post(`/invitation`, newIvt);
				this.invitations.push(response.data);
			}

			this.$scope.$apply();
		}

		async onDeleteClicked(invitation) {
			// BAD!! we are modifying an attribute of the component.
			// we should notify our parent that we need them to change it.
			this.invitations.splice(this.invitations.indexOf(invitation), 1);
			await axios.delete(`/invitation/${invitation._id}`);

			// this.onProjectUpdate({ newProject: this.editableProject, isValid: true });
		}
	}
});


export default module.name;

