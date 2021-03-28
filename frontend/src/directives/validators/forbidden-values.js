import angular from 'angular';

const module = angular.module(__moduleName, []);

module.directive('forbiddenValues', () => ({
    restrict: 'A',
    require: 'ngModel',
    link: function ($scope, element, attributes, ngModelController) {
        ngModelController.$validators.forbiddenValues = function (modelValue, viewValue) {
            var values = $scope.$eval(attributes.forbiddenValues);
            return !values.includes(viewValue);
        };
    },
}));

export default module.name;
