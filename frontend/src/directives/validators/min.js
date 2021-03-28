import angular from 'angular';

const module = angular.module(__moduleName, []);

function isEmpty(value) {
    return angular.isUndefined(value) || value === '' || value === null || value !== value;
}

module.directive('ngMin', () => ({
    restrict: 'A',
    require: 'ngModel',
    link: function ($scope, elem, attributes, controller) {
        $scope.$watch(attributes.ngMin, function () {
            controller.$setViewValue(controller.$viewValue);
        });

        var minValidator = function (value) {
            var min = $scope.$eval(attributes.ngMin) || 0;
            if (!isEmpty(value) && value < min) {
                controller.$setValidity('ngMin', false);
                return undefined;
            } else {
                controller.$setValidity('ngMin', true);
                return value;
            }
        };

        controller.$parsers.push(minValidator);
        controller.$formatters.push(minValidator);
    },
}));

export default module.name;
