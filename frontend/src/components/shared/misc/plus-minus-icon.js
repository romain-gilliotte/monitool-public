import angular from 'angular';

const module = angular.module(
	'monitool.components.misc.plusminusicon',
	[]
);


module.component('faOpen', {
	bindings: {
		value: '<'
	},
	template: require('./plus-minus-icon.html')
});


export default module.name;

