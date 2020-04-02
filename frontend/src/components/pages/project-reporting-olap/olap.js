import angular from 'angular';
import axios from 'axios'
import uiRouter from '@uirouter/angularjs';
import mtQueryComputation from './query-computation';
import mtIndicatorFilter from './indicator-filter';
import mtDimensions from './dimensions';
import mtOlapGrid from './olap-grid';

const module = angular.module(
	__moduleName,
	[
		uiRouter,
		mtQueryComputation,
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

	template: require(__templatePath),

	controller: class OlapReportingController {

		constructor($scope) {
			this.$scope = $scope;

			this.baseQueryUpdated = false;
			this.aggregateUpdated = false;
			this.diceUpdated = false;
		}

		onBaseQueryUpdated(query, baseline, target, colorize) {
			this.baseQueryUpdated = true;
			this.aggregateUpdated = false;
			this.diceUpdated = false;

			this.baseline = baseline;
			this.target = target;
			this.colorize = colorize;
			this.baseQuery = query;

			this._fetchData();
		}

		onAggregateUpdated(aggregate, distribution, showTotals) {
			this.aggregateUpdated = true;

			this.showTotals = showTotals;
			this.distribution = distribution;
			this.aggregate = aggregate;

			this._fetchData();
		}

		onDiceUpdated(dices) {
			this.diceUpdated = true;
			this.extraDices = dices;

			this._fetchData();
		}

		async _fetchData() {
			// Tell display that we are loading results.
			this.errorMessage = 'shared.loading';
			this.data = null;

			if (this.baseQueryUpdated && this.aggregateUpdated && this.diceUpdated) {
				this.query = {
					...this.baseQuery,
					dice: [...this.baseQuery.dice, ...this.extraDices],
					aggregate: [...this.baseQuery.aggregate, ...this.aggregate]
				};

				const response = await axios.post(
					`/resources/project/${this.project._id}/reporting`,
					{ output: 'report', ...this.query }
				);

				// Ignore query result if a new query was launched in between.
				this.errorMessage = null;
				this.data = response.data;
				this.$scope.$apply();
			}
		}
	}
});


export default module.name;
