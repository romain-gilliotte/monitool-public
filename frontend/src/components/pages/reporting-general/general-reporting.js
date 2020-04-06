import uiRouter from '@uirouter/angularjs';
import angular from 'angular';
import mtGraph from '../../shared/reporting/reporting-graph';
import mtTable from './general-table';
import mtProjectQuery from './project-query';
import mtHelpPanel from '../../shared/misc/help-panel';

const module = angular.module(__moduleName, [uiRouter, mtProjectQuery, mtTable, mtGraph, mtHelpPanel]);

module.config($stateProvider => {

	$stateProvider.state('project.usage.general', {
		url: '/general',
		component: __componentName,
	});
});


module.component(__componentName, {
	bindings: {
		project: '<',
	},
	template: require(__templatePath),
	controller: class GeneralReportingController {

		constructor() {
			this.query = null;
		}

		onQueryUpdate(query) {
			this.query = query;
		}

		onPlotChange(plotData) {
			this.plotData = plotData;
		}
	}
});


export default module.name;

