import angular from 'angular';
import mtMselectWithGroups from '../../shared/ng-models/element-filter';

const module = angular.module(__moduleName, [mtMselectWithGroups]);

module.component(__componentName, {
    bindings: {
        project: '<',
        onUpdate: '&',
    },

    template: require(__templatePath),

    controller: class {
        $onChanges(changes) {
            this.siteIds = this.project.entities.map(e => e.id);

            this.onFilterChange();
        }

        onFilterChange() {
            this.onUpdate({
                dice: {
                    id: 'location',
                    attribute: 'entity',
                    items: this.siteIds,
                },
            });
        }
    },
});

export default module.name;
