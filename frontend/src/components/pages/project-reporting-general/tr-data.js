import angular from 'angular';
import axios from 'axios';
import mtReportingField from '../../shared/reporting/td-reporting-field';
import mtIndicatorUnit from '../../../filters/indicator';

const module = angular.module(
	'monitool.components.pages.project.reporting.tr-data',
	[
		mtReportingField,
		mtIndicatorUnit
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
					...dim.attributes
						.filter(attribute => dim.getItems(attribute).length > 1)
						.map(attr => ({
							id: dim.id,
							attribute: attr,
							label: this._getDisagregationLabel(dim.id, attr)
						}))
				], []);

				this.row = this.trData

				this._fetchData()
			}

			_getDisagregationLabel(dimensionId, attribute) {
				if (dimensionId === 'time')
					return `project.dimensions.${attribute}`;
				else if (dimensionId === 'location') {
					if (attribute === 'entity')
						return 'project.dimensions.entity';
					else
						return this.project.groups.find(g => g.id === attribute).name;
				}
				else {
					return this.project.forms
						.reduce((m, f) => [
							...m,
							f.elements.reduce((m, v) => [...m, ...v.partitions], [])
						], [])
						.find(p => disagregateBy.id === p.id)
						.name;
				}
			}

			async _fetchData() {
				try {
					delete this.values;
					this.errorMessage = 'shared.loading';
					const response = await axios.post(
						`/resources/project/${this.project._id}/reporting`,
						{ output: 'report', ...this.trData.query }
					);

					this.values = [
						...this.columns.map(col => response.data.detail[col.id]),
						response.data.total
					];
				}
				catch (e) {
					this.errorMessage = e.message;
				}

				this.$scope.$apply();
			}
		}
	};
});

export default module.name;
