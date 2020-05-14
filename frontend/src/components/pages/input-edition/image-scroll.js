import angular from 'angular';
require(__scssPath);

const module = angular.module(__moduleName, []);

module.component(__componentName, {
    bindings: {
        upload: '<',
        region: '@',
    },

    template: `
        <div ng-mouseenter="$ctrl.onMouseEnter()" ng-mouseleave="$ctrl.onMouseLeave()" ng-click="$ctrl.onClick()">
        </div>
    `,

    controller: class {
        constructor($element) {
            this.$outer = $element;
            this.$inner = $element.children();
        }

        $onChanges(changes) {
            const src = `/api/project/${this.upload.projectId}/upload/${this.upload._id}/reprojected`;

            const img = new Image();
            img.onload = () => {
                this.w = img.naturalWidth;
                this.h = img.naturalHeight;

                // if no region is enabled, display square with top of the page.
                this.coords = this.upload.reprojected.regions[this.region] || {
                    x: 0,
                    y: 0,
                    w: Math.min(this.w, this.h),
                    h: Math.min(this.w, this.h),
                };

                // Set initial values
                this.onMouseLeave();

                // Set image and transition properties in timeout, to avoid having the
                // cells scrolling from zero on page load.
                setTimeout(() => {
                    this.$inner.css({
                        'background-image': `url('${src}')`,
                        'transition-property': `padding-top, background-size, background-position`,
                    });
                }, 5);
            };
            img.src = src;
        }

        onClick() {
            this.offset += 20;
            this.onMouseEnter();
        }

        onMouseEnter() {
            const x = Math.max(0, this.coords.x - this.offset);
            const y = Math.max(0, this.coords.y - this.offset);
            const w = Math.min(this.w - x, this.coords.w + 2 * this.offset);
            const h = Math.min(this.h - y, this.coords.h + 2 * this.offset);
            this.setPosition({ x, y, w, h });
        }

        onMouseLeave() {
            this.offset = 10;
            this.setPosition(this.coords);
        }

        /**
         * Spent hours writing this, and finally
         */
        setPosition(coords) {
            const ratio = coords.h / coords.w;
            const size_x = this.w / coords.w;
            const size_y = this.h / coords.h;
            const pos_x = coords.x / (this.w - coords.w);
            const pos_y = coords.y / (this.h - coords.h);

            this.$inner.css({
                'padding-top': `${100 * ratio}%`,
                'background-position': `${100 * pos_x}% ${100 * pos_y}%`,
                'background-size': `${100 * size_x}% ${100 * size_y}%`,
            });
        }
    },
});

export default module.name;
