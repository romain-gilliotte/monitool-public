import angular from 'angular';
import axios from 'axios'

import uiRouter from '@uirouter/angularjs';
import uiSelect from 'ui-select';

import 'ui-select/dist/select.min.css';

import mtSelectIndicator from './select-indicator';
import mtIndicatorFilter from './indicator-filter';
import mtDimensions from './dimensions';
import mtOlapGrid from './olap-grid';

const module = angular.module(
	'monitool.components.pages.project.reporting.olap',
	[
		uiRouter, // for $stateProvider
		uiSelect,

		mtSelectIndicator,
		mtIndicatorFilter,
		mtDimensions,
		mtOlapGrid
	]
);


module.config($stateProvider => {
	$stateProvider.state('main.project.reporting.olap', {
		acceptedUsers: ['loggedIn'],
		url: '/olap',
		component: 'olapReporting'
	});

});

module.component('olapReporting', {
	bindings: {
		project: '<',
	},

	template: require('./olap.html'),

	controller: class OlapReportingController {

		constructor($scope) {
			this.$scope = $scope;

			// Autoincrementing id, to work around
			// slow fetches breaking interface for long ones.
			this._fetchId = 0;
			this._timeout = null;
		}

		onIndicatorUpdated(indicator, logicalFramework) {
			this.indicator = indicator;
			this.logicalFramework = logicalFramework;
			this._fetchDataSoon();
		}

		onFilterUpdated(filter) {
			this.filter = filter;
			this._fetchDataSoon();
		}

		onDimensionsUpdated(dimensions) {
			this.dimensions = dimensions;
			this._fetchDataSoon();
		}

		_fetchDataSoon() {
			if (this._timeout !== null)
				clearTimeout(this._timeout);

			this._timeout = setTimeout(async () => {
				await this._fetchData();
				this._timeout = null; // FIXME this son't work
			}, 200);
		}

		async _fetchData() {
			const myFetchId = ++this._fetchId;

			// Tell display that we are loading results.
			this.errorMessage = 'shared.loading';
			this.data = null;
			this.$scope.$apply();

			// Query server
			const response = await axios.post('/api/reporting/project/' + this.project._id, {
				dimensionIds: [...this.dimensions.rows, ...this.dimensions.cols],
				filter: this.filter,
				withTotals: true,
				withGroups: true,
				computation: this.indicator.computation
			});

			// Ignore query result if a new query was launched in between.
			if (this._fetchId === myFetchId) {
				this.errorMessage = null;
				this.data = response.data;
				this.$scope.$apply();
			}
		}
	}
});


export default module.name;
