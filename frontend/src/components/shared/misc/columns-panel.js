import angular from 'angular';
require(__scssPath);

const module = angular.module(__moduleName, []);

module.component(__componentName, {
    bindings: {
        sortable: '<',
        variant: '<',
        title: '<',
        handleClass: '@',
    },
    transclude: {
        title: '?paneTitle',
        body: 'paneBody',
        'bottom-line': '?paneBottomLine',
    },
    template: require(__templatePath),

    controller: class {
        $onChanges(changes) {
            if (changes.variant) {
                const variant = this.variant || 'default';
                this.panelClass = 'panel-' + variant;
            }
        }
    },
});

export default module.name;
