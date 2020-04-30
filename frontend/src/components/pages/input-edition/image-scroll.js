import angular from 'angular';
require(__scssPath);

const module = angular.module(__moduleName, []);
const OUTPUT_MARGIN = 30;

module.component(__componentName, {
    bindings: {
        data: '<',
    },

    template: `
        <div ng-mouseenter="$ctrl.onMouseEnter()" ng-mouseleave="$ctrl.onMouseLeave()">
        </div>
    `,

    controller: class {
        constructor($element) {
            this.$outer = $element;
            this.$inner = $element.children();
        }

        $onChanges(changes) {
            const img = new Image();
            img.onload = () => {
                this.w = img.naturalWidth;
                this.h = img.naturalHeight;
                this.smw = this.w - 2 * OUTPUT_MARGIN;
                this.smh = this.h - 2 * OUTPUT_MARGIN;
                this.onMouseLeave();
            };

            img.src = `data:image/png;base64,${this.data}`;

            this.$inner.css('background-image', `url('data:image/png;base64,${this.data}')`);
        }

        onMouseEnter() {
            this.$inner.css('background-size', `100%`);
            this.$inner.css('padding-top', `${(100 * this.h) / this.w}%`);
        }

        onMouseLeave() {
            this.$inner.css('background-size', `${(100 * this.w) / this.smw}%`);
            this.$inner.css('padding-top', `${(100 * this.smh) / this.smw}%`);
        }
    },
});

export default module.name;
