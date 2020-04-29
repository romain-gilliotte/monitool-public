import angular from 'angular';
require(__scssPath);

const module = angular.module(__moduleName, []);

module.component(__componentName, {
    bindings: {
        file: '<',
        x: '<',
        y: '<',
        w: '<',
        h: '<',
        fw: '<',
        fh: '<',
    },

    template: '',

    controller: class {
        constructor($element) {
            this.$element = $element;
        }

        $onChanges(changes) {
            this.$element.css('background-image', `url('data:image/png;base64,${this.data}')`);
        }
    },
});

export default module.name;
