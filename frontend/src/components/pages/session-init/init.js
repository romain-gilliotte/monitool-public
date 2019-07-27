import angular from 'angular';
import uiRouter from '@uirouter/angularjs';

const module = angular.module(
	'monitool.components.pages.init',
	[
		uiRouter, // for $stateProvider
	]
);

module.config($stateProvider => {

	$stateProvider.state('init', {
		abstract: true,
		component: 'init'
	});
});


module.component('init', {
	bindings: {
	},
	template: require('./init.html'),
	controller: class InitController {

		constructor($sce) {
			this.$sce = $sce;
		}

		$onInit() {
			this.presentation = this.$sce.trustAsHtml([
				'Monitoring made easy for humanitarian organisations',
				'Keep calm and carry on monitoring your projects',
				'Centralize data, track changes and generate your reports',
				'Forever free and open-source monitoring',
				'A real alternative to spreadsheets',
				'Any time is monitoring time',
				'Where indicators meet poetry'
			][Math.floor(Math.random() * 6)])
		}
	}
})


export default module.name;
