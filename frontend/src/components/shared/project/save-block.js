import angular from 'angular';
require(__cssPath);

const module = angular.module(__moduleName, []);

module.component(__componentName, {
    bindings: {
        isValid: "<",
        isChanged: "<",
        isPersisted: '<',
        isSaving: '<',

        onSaveClicked: '&',
        onResetClicked: '&'
    },
    template: require(__templatePath)
});

export default module.name;
