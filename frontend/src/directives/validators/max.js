import angular from 'angular';

const module = angular.module(__moduleName, []);

const isEmpty = function (value) {
    return angular.isUndefined(value) || value === '' || value === null || value !== value;
};

module.directive('ngMax', function () {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function ($scope, elem, attributes, controller) {
            $scope.$watch(attributes.ngMax, function () {
                controller.$setViewValue(controller.$viewValue);
            });

            var maxValidator = function (value) {
                var max = $scope.$eval(attributes.ngMax) || Infinity;
                if (!isEmpty(value) && value > max) {
                    controller.$setValidity('ngMax', false);
                    return undefined;
                } else {
                    controller.$setValidity('ngMax', true);
                    return value;
                }
            };

            controller.$parsers.push(maxValidator);
            controller.$formatters.push(maxValidator);
        },
    };
});

export default module.name;
