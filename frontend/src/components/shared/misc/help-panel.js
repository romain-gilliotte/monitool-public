import angular from 'angular';
require(__cssPath);

const module = angular.module(__moduleName, []);

module.component(__componentName, {
    transclude: true,
    template: require(__templatePath),
    controller: class {
    }
});

export default module.name;
