import angular from 'angular';
require(__scssPath);

const module = angular.module(__moduleName, []);
const OUTPUT_MARGIN = 30;

module.component(__componentName, {
    bindings: {
        data: '<',
        coords: '<',
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
            const url = `data:image/jpeg;base64,${this.data}`;

            const img = new Image();
            img.onload = () => {
                this.w = img.naturalWidth;
                this.h = img.naturalHeight;
                this.onMouseLeave();

                // Set image and transition properties in timeout, to avoid having the
                // cells scrolling from zero on page load.
                setTimeout(() => {
                    this.$inner.css({
                        'background-image': `url('${url}')`,
                        'transition-property': `padding-top, background-size, background-position`,
                    });
                }, 0);
            };

            img.src = url;
        }

        onMouseEnter() {
            this.setPosition({
                x: this.coords.x - 20,
                y: this.coords.y - 40,
                w: this.coords.w + 40,
                h: this.coords.h + 80,
            });
        }

        onMouseLeave() {
            this.setPosition(this.coords);
        }

        /**
         * Spent hours writing this, and finally
         */
        setPosition(coords) {
            const ratio = coords.h / coords.w;
            const size_x = this.w / coords.w;
            const pos_x = coords.x / (this.w - coords.w);
            const pos_y = coords.y / (this.h - coords.h);

            this.$inner.css({
                'padding-top': `${100 * ratio}%`,
                'background-position': `${100 * pos_x}% ${100 * pos_y}%`,
                'background-size': `${100 * size_x}%`,
            });
        }
    },
});

export default module.name;
