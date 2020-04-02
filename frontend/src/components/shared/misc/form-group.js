import angular from 'angular';

const module = angular.module(__moduleName, []);

module.component('formGroup', {
	bindings: {
		inputId: '@',
		label: '@',

		help: '@',
		helpValues: '<',
	},

	transclude: true,

	template: require(__templatePath)
});


export default module.name;
