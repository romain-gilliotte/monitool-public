import angular from 'angular';

const module = angular.module(
	'monitool.directives.validators.forbiddenvalues',
	[
	]
);


module.directive('forbiddenValues', function() {
	return {
		restrict: "A",
		require: 'ngModel',
		link: function($scope, element, attributes, ngModelController) {
			ngModelController.$validators.forbiddenValues = function(modelValue, viewValue) {
				var values = $scope.$eval(attributes.forbiddenValues);
				return !values.includes(viewValue);
			};
		}
	};
});


export default module.name;
