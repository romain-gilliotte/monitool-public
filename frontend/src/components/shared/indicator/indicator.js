import angular from 'angular';
import uibModal from 'angular-ui-bootstrap/src/modal/index';
import mtEditionModal from './indicator-edition-modal';
import mtIndicatorUnit from '../../../filters/indicator';
import mtColumnsPanel from '../misc/columns-panel';

require(__cssPath);

const module = angular.module(__moduleName, [uibModal, mtEditionModal, mtIndicatorUnit, mtColumnsPanel]);

module.component(__componentName, {
	bindings: {
		project: '<',
		indicator: '<',

		onUpdated: '&',
		onDeleted: '&'
	},

	template: require(__templatePath),

	controller: class {

		constructor($uibModal) {
			"ngInject";

			this.$uibModal = $uibModal;
		}

		async onEditClicked() {
			const modalOpts = {
				component: 'indicatorEditionModal',
				size: 'lg',
				resolve: {
					planning: () => this.indicator,
					indicator: () => null,
					dataSources: () => this.project.forms
				}
			}

			const newIndicator = await this.$uibModal.open(modalOpts).result;
			if (newIndicator)
				this.onUpdated({ newIndicator: newIndicator, previousValue: this.indicator });
			else
				this.onDeleted({ indicator: this.indicator });
		}

		onDeleteClicked() {
			this.onDeleted({ indicator: this.indicator });
		}
	}
});


export default module.name;
