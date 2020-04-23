import angular from 'angular';
require(__scssPath);

const module = angular.module(__moduleName, []);

module.component(__componentName, {
    bindings: {
        back: '@',
    },
    transclude: {
        menus: 'menus',
        content: 'content',
    },
    template: require(__templatePath),
});

export default module.name;
