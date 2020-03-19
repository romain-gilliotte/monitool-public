import angular from 'angular';


const module = angular.module(
	'monitool.filters.indicator',
	[
	]
);

module.filter('indicatorUnit', function () {
	return function (formula) {
		if (formula) {
			if (/1000/.test(formula))
				return '‰';
			else if (/100/.test(formula))
				return '%';
		}
	}
});

export default module.name;
