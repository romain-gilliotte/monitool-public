import angular from 'angular';
import uibModal from 'angular-ui-bootstrap/src/modal/index';
import mtEditionModal from './indicator-edition-modal';
import mtIndicatorUnit from '../../../filters/indicator';
require(__cssPath);

const module = angular.module(__moduleName, [uibModal, mtEditionModal, mtIndicatorUnit]);

module.component(__componentName, {
	bindings: {
		project: '<',
		indicator: '<',

		onUpdated: '&',
		onDeleted: '&'
	},

	template: require(__templatePath),

	controller: class IndicatorController {

		constructor($uibModal) {
			this.$uibModal = $uibModal;
		}

		onEditClicked() {
			this.$uibModal
				.open({
					component: 'indicatorEditionModal',
					size: 'lg',
					resolve: {
						planning: () => this.indicator,
						indicator: () => null,
						dataSources: () => this.project.forms
					}
				})
				.result
				.then(newIndicator => {
					if (newIndicator)
						this.onUpdated({ newIndicator: newIndicator, previousValue: this.indicator });
					else
						this.onDeleted({ indicator: this.indicator });
				});
		}

		onDeleteClicked() {
			this.onDeleted({ indicator: this.indicator });
		}
	}
});


export default module.name;
