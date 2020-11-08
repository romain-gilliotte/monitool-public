import angular from 'angular';
import mtHelpPanel from '../misc/help-panel';
require(__scssPath);

const module = angular.module(__moduleName, [mtHelpPanel]);

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
