import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import mtProjectQuery from './project-query';
import mtTable from './table';
import mtGraph from '../../shared/reporting/graph';

const module = angular.module(__moduleName, [uiRouter, mtProjectQuery, mtTable, mtGraph]);

module.config($stateProvider => {

	$stateProvider.state('main.project.reporting.general', {
		acceptedUsers: ['loggedIn'],
		url: '/general',
		component: 'generalReporting',
	});
});


module.component('generalReporting', {
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

