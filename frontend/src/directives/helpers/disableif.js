import angular from 'angular';
require(__scssPath);

const module = angular.module(__moduleName, []);

function inhibitHandler(event) {
    event.stopImmediatePropagation();
    event.preventDefault();
    return false;
}

module.directive('disableIf', () => ({
    retrict: 'A',
    priority: 100,
    scope: {
        disableIf: '=',
    },
    link: function ($scope, element) {
        $scope.$watch('disableIf', function (disable) {
            if (disable) {
                element.addClass('disabled');
                element.on('click', inhibitHandler);

                if (element.hasClass('clickable')) {
                    element.removeClass('clickable');
                    element.addClass('nonclickable');
                }
            } else {
                element.removeClass('disabled');
                element.off('click', inhibitHandler);

                if (element.hasClass('nonclickable')) {
                    element.addClass('clickable');
                    element.removeClass('nonclickable');
                }
            }
        });
    },
}));

export default module.name;
