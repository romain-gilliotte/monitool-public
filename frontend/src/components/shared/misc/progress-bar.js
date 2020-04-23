import angular from 'angular';

const module = angular.module(__moduleName, []);

module.component(__componentName, {
    bindings: {
        done: '<',
        incomplete: '<',
    },
    template: require(__templatePath),
    controller: class {
        $onChanges(changes) {
            this.done = Math.round(100 * (this.done || 0));
            this.incomplete = Math.round(100 * (this.incomplete || 0));
            this.failed = 100 - this.done - this.incomplete;
        }
    },
});

export default module.name;
