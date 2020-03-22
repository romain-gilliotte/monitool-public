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
				this.aggregations = this._getDisagregations(this.trData.dimensions);
				this.row = this.trData
				this._fetchData()
			}

			_getDisagregations(dimensions) {
				const aggregations = [];
				dimensions.forEach(dimension => {
					let agg;
					if (dimension.id === 'time')
						agg = dim.attributes.map(attr => ({
							id: 'time',
							attribute: attr,
							label: `project.dimensions.${attribute}`
						}))

					else if (dimension.id === 'location')
						agg = [{ id: 'location', label: `project.dimensions.entity` }]

					else {
						const partition = this.project.forms
							.reduce((m, f) => [
								...m,
								f.elements.reduce((m, v) => [...m, ...v.partitions], [])
							], [])
							.find(p => disagregateBy.id === p.id);

						agg = [{ id: dimension.id, label: partition.name }]
					}

					aggregations.push(...agg);
				});

				return aggregations;
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
