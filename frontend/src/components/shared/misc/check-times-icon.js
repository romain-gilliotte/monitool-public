import angular from 'angular';

const module = angular.module(
	'monitool.components.misc.check-times-icon',
	[]
);


module.component('faOk', {
	bindings: {
		value: '<'
	},
	template: require('./check-times-icon.html')
});


export default module.name;

