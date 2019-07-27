import angular from 'angular';

import uibModal from 'angular-ui-bootstrap/src/modal/index';

import mtEditionModal from './indicator-edition';
import mtIndicatorUnit from '../../../filters/indicator';

const module = angular.module(
	'monitool.components.shared.indicator.display',
	[
		uibModal, // for $uibModal
		mtEditionModal,
		mtIndicatorUnit
	]
);


module.component('indicator', {
	bindings: {
		project: '<',
		indicator: '<',

		onUpdated: '&',
		onDeleted: '&'
	},

	template: require('./display.html'),

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
						this.onUpdated({newIndicator: newIndicator, previousValue: this.indicator});
					else
						this.onDeleted({indicator: this.indicator});
				});
		}

		onDeleteClicked() {
			this.onDeleted({indicator: this.indicator});
		}
	}
});


export default module.name;
