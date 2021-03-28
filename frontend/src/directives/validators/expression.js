import angular from 'angular';
import { getParser } from 'olap-in-memory';

const module = angular.module(__moduleName, []);

module.directive('expression', () => ({
    restrict: 'A',
    require: '?ngModel',
    link: function ($scope, $element, attributes, controller) {
        if (!controller) return;

        controller.$validators.expression = function (value) {
            try {
                getParser().parse(value);
                return true;
            } catch (e) {
                return false;
            }
        };

        controller.$validate();
    },
}));

export default module.name;
