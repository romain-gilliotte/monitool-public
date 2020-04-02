import angular from 'angular';

const module = angular.module(__moduleName, []);

module.component('faOk', {
	bindings: {
		value: '<'
	},
	template: require(__templatePath)
});


export default module.name;

