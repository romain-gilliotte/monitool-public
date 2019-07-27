import angular from 'angular';


const module = angular.module(
	'monitool.directives.validators.required',
	[]
);


module.directive('uiRequired', function() {
	return {
		restrict: "A",
		require: 'ngModel',
		link: function(scope, elm, attrs, ctrl) {
			ctrl.$validators.required = function(modelValue, viewValue) {
				return !((viewValue && viewValue.length === 0 || false) && attrs.uiRequired === 'true');
			};

			attrs.$observe('uiRequired', function() {
				ctrl.$setValidity('required', !(attrs.uiRequired === 'true' && ctrl.$viewValue && ctrl.$viewValue.length === 0));
			});
		}
	};
})

export default module.name;
