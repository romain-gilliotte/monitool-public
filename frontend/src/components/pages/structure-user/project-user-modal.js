import angular from 'angular';
import uiModal from 'angular-ui-bootstrap/src/modal';
import mtForbidden from '../../../directives/validators/forbidden-values';

const module = angular.module(__moduleName, [uiModal, mtForbidden]);

/**
 * Component used on a modal called from "project.config.invitation_list"
 * Allows to edit a user
 */
module.component(__componentName, {

	bindings: {
		resolve: '<',
		close: '&',
		dismiss: '&'
	},

	template: require(__templatePath),

	controller: class ProjectUserModalController {

		hasChanged() {
			return !angular.equals(this.masterInvitation, this.invitation);
		}

		$onChanges(changes) {
			this.entities = this.resolve.project.entities;
			this.groups = this.resolve.project.groups;
			this.dataSources = this.resolve.project.forms;
			this.takenEmails = this.resolve.takenEmails;

			// isNew will be used by the view to disable inputs that can't be changed (email, etc), and show delete button.
			this.isNew = !this.resolve.invitation;

			// The form updates a copy of the object, so that user can cancel the changes by just dismissing the modal.
			this.invitation = angular.copy(this.resolve.invitation) || {
				projectId: this.resolve.project._id,
				email: "",
				accepted: false,
				dataEntry: {
					dataSourceIds: this.resolve.project.forms.map(f => f.id),
					siteIds: this.resolve.project.entities.map(s => s.id)
				}
			};

			this.masterInvitation = angular.copy(this.invitation);
		}

		reset() {
			angular.copy(this.masterInvitation, this.invitation);
		}

		done() {
			this.close({ $value: this.invitation });
		}
	}
});


export default module.name;
