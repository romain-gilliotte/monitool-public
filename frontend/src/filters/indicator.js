import angular from 'angular';


const module = angular.module(
	'monitool.filters.indicator',
	[
	]
);

module.filter('indicatorUnit', function() {
	return function(indicator) {
		if (indicator && indicator.computation) {
			if (/1000/.test(indicator.computation.formula))
				return '‰';
			else if (/100/.test(indicator.computation.formula))
				return '%';
		}
	}
});

export default module.name;
