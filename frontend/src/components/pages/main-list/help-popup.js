import angular from 'angular';

const module = angular.module(__moduleName, []);

module.component(__componentName, {
    bindings: {
        resolve: '<',
        close: '&',
        dismiss: '&',
    },
    template: require(__templatePath),
});

export default module.name;
