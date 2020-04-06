import angular from 'angular';
import uiModal from 'angular-ui-bootstrap/src/modal';

const module = angular.module(__moduleName, [uiModal]);

/**
 * Component used on a modal called from "project.config.user_list"
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

		isUnchanged() {
			return angular.equals(this.masterUser, this.user);
		}

		$onChanges(changes) {
			this.entities = this.resolve.entities;
			this.groups = this.resolve.groups;
			this.dataSources = this.resolve.dataSources;
			this.takenEmails = this.resolve.takenEmails;

			// isNew will be used by the view to disable inputs that can't be changed (email, etc), and show delete button.
			this.isNew = !this.resolve.projectUser;

			// The form updates a copy of the object, so that user can cancel the changes by just dismissing the modal.
			this.user = angular.copy(this.resolve.projectUser) || { email: "", role: "owner", entities: [], dataSources: [] };
			this.user.entities = this.user.entities || [];
			this.user.dataSources = this.user.dataSources || [];

			this.masterUser = angular.copy(this.user);
		}

		reset() {
			angular.copy(this.masterUser, this.user);
		}

		done() {
			if (this.user.role != 'input') {
				delete this.user.entities;
				delete this.user.dataSources;
			}

			this.close({ $value: this.user });
		}

	}
});


export default module.name;
