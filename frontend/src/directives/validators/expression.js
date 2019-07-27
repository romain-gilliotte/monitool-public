import angular from 'angular';
import exprEval from 'expr-eval';

const module = angular.module(
	'directives.validators.expression',
	[
	]
);


module.directive('expression', function() {
	return {
		restrict: 'A',
		require: '?ngModel',
		link: function($scope, $element, attributes, controller) {
			if (!controller)
				return;

			controller.$validators.expression = function(value) {
				try {
					exprEval.Parser.parse(value);
					return true
				}
				catch (e) {
					return false;
				}
			};

			controller.$validate();
		}
	}
});

export default module.name;
