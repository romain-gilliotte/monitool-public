import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import uiModal from 'angular-ui-bootstrap/src/modal';
import 'angular-legacy-sortablejs-maintained';
import mtIndicator from '../../shared/indicator/indicator';

const module = angular.module(__moduleName, [uiRouter, uiModal, 'ng-sortable', mtIndicator]);

module.config($stateProvider => {

	$stateProvider.state('main.project.structure.extra', {
		url: '/extra',
		component: __componentName,
	});

});

module.component(__componentName, {

	bindings: {
		// injected from parent component.
		project: '<',
		onProjectUpdate: '&'
	},

	template: require(__templatePath),

	controller: class ProjectExtraIndicators {

		constructor($uibModal) {
			this.$uibModal = $uibModal;
		}

		$onInit() {
			this.sortableOptions = {
				handle: '.indicator-handle',
				onUpdate: () => this.onProjectUpdate({ newProject: this.editableProject, isValid: true })
			};
		}

		$onChanges(changes) {
			// Project is a single way data bindings: we must not change it.
			if (changes.project)
				this.editableProject = angular.copy(this.project);
		}

		onIndicatorUpdated(newIndicator, formerIndicator) {
			const index = this.editableProject.extraIndicators.indexOf(formerIndicator);
			this.editableProject.extraIndicators.splice(index, 1, newIndicator);

			this.onProjectUpdate({ newProject: this.editableProject, isValid: true });
		}

		onIndicatorDeleted(indicator) {
			const index = this.editableProject.extraIndicators.indexOf(indicator);
			this.editableProject.extraIndicators.splice(index, 1);

			this.onProjectUpdate({ newProject: this.editableProject, isValid: true });
		}

		onAddIndicatorClick() {
			this.$uibModal
				.open({
					component: 'indicatorEditionModal',
					size: 'lg',
					resolve: {
						planning: () => null,
						indicator: () => null,
						dataSources: () => this.editableProject.forms
					}
				})
				.result
				.then(newIndicator => {
					if (newIndicator) {
						this.editableProject.extraIndicators.push(newIndicator);
						this.onProjectUpdate({ newProject: this.editableProject, isValid: true });
					}
				});
		}
	}
})


export default module.name;

