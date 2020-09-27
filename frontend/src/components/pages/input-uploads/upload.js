import angular from 'angular';
require(__scssPath);

const module = angular.module(__moduleName, []);

module.component(__componentName, {
    bindings: {
        upload: '<',
        onDelete: '&',
    },
    template: require(__templatePath),
    controller: class {
        constructor($element) {
            'ngInject';

            this.$element = $element;
        }

        $onInit() {
            this.$element.addClass('thumbnail');
        }

        $onChanges() {
            for (let c of ['pending_processing', 'pending_dataentry', 'failed', 'done'])
                this.$element.removeClass(c);

            this.$element.addClass(this.upload.status);
        }
    },
});

export default module.name;
