import angular from 'angular';
import axios from 'axios'
import uiRouter from '@uirouter/angularjs';
import mtQueryComputation from './query-computation';
import mtIndicatorFilter from './indicator-filter';
import mtDimensions from './olap-dimensions';
import mtOlapGrid from './olap-grid';
import mtHelpPanel from '../../shared/misc/help-panel';

const module = angular.module(
	__moduleName,
	[
		uiRouter,
		mtQueryComputation,
		mtIndicatorFilter,
		mtDimensions,
		mtOlapGrid,
		mtHelpPanel
	]
);

module.config($stateProvider => {
	$stateProvider.state('project.usage.olap', {
		url: '/olap',
		component: __componentName
	});

});

module.component(__componentName, {
	bindings: {
		project: '<',
	},

	template: require(__templatePath),

	controller: class OlapReportingController {

		constructor($scope, $rootScope) {
			this.$scope = $scope;
			this.$rootScope = $rootScope

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
					aggregate: [...this.baseQuery.aggregate, ...this.aggregate],
				};

				// Update download url
				this.downloadUrl =
					this.$rootScope.serviceUrl +
					this._makeUrl({ renderer: 'xlsx', rendererOpts: this.distribution, ...this.query }) +
					`?token=${this.$rootScope.accessToken}`;

				// Update olap-grid

				const fetchUrl = this._makeUrl({ renderer: 'json', rendererOpts: 'report', ...this.query });
				const response = await axios.get(fetchUrl);

				this.data = response.data;
				this.errorMessage = null;
				this.$scope.$apply();
			}
		}

		_makeUrl(query) {
			const b64Query = btoa(JSON.stringify(query)).replace('+', '-').replace('/', '_').replace(/=+$/g, '');
			return `/project/${this.project._id}/report/${b64Query}`;
		}
	}
});


export default module.name;
