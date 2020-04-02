import angular from 'angular';
import uiModal from 'angular-ui-bootstrap/src/modal/index';
import mtNumberOptional from '../ng-models/number-optional';
import mtIndicatorComputation from './indicator-computation';

const module = angular.module(__moduleName, [uiModal, mtNumberOptional, mtIndicatorComputation]);

const defaultPlanning = {
	display: '',
	colorize: true,
	baseline: null,
	target: null,
	computation: null
};


module.component('indicatorEditionModal', {
	bindings: {
		resolve: '<',
		close: '&',
		dismiss: '&'
	},

	template: require(__templatePath),

	controller: class IndicatorEditionModal {

		$onChanges(changes) {
			this.dataSources = this.resolve.dataSources;
			this.indicator = this.resolve.indicator;
			this.planning = angular.copy(this.resolve.planning || defaultPlanning);

			// cross cutting indicators have no display field.
			if (this.indicator)
				delete this.planning.display;

			this.masterPlanning = angular.copy(this.planning);
			this.isNew = !this.resolve.planning;
		}

		isUnchanged() {
			return angular.equals(this.planning, this.masterPlanning);
		}

		reset() {
			angular.copy(this.masterPlanning, this.planning);
		}

		save() {
			this.close({ '$value': this.planning });
		}
	}
});


export default module.name;
