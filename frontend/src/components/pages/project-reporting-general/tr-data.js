import angular from 'angular';
import axios from 'axios';
import mtReportingField from '../../shared/reporting/td-reporting-field';

const module = angular.module(
	'monitool.components.pages.project.reporting.tr-data',
	[
		mtReportingField
	]
);

module.directive('trData', () => {
	return {
		controllerAs: '$ctrl',
		restrict: 'A',
		scope: {}, // Isolate

		bindToController: {
			project: '<',
			columns: '<',
			trData: '<',
			onDisagregateClicked: '&'
		},

		template: require('./tr-data.html'),

		controller: class TrDataController {

			constructor($scope) {
				this.$scope = $scope;
			}

			$onChanges(changes) {
				this.aggregations = this.trData.dimensions.reduce((m, dim) => [
					...m,
					...dim.attributes.map(attr => ({ id: dim.id, attribute: attr }))
				], []);

				this.row = this.trData

				this.fetchData()
			}

			async fetchData() {
				const response = await axios.post(
					`/resources/project/${this.project._id}/reporting`,
					{ output: 'report', ...this.trData.query }
				);

				this.values = [
					...this.columns.map(col => response.data.detail[col.id]),
					response.data.total
				];

				this.$scope.$apply();
			}
		}
	};
});

export default module.name;
