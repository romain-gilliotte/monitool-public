
import mtMselectWithGroups from '../../shared/ng-models/mselect-with-groups';

const module = angular.module(
    'monitool.component.page.project-reporting-general.query-dice-location',
    [
        mtMselectWithGroups
    ]
);

module.component('queryDiceLocation', {
    bindings: {
        project: '<',
        onUpdate: '&'
    },

    template: require('./query-dice-location.html'),

    controller: class ProjectFilterController {

        $onChanges(changes) {
            this.siteIds = this.project.entities.map(e => e.id);

            this.onFilterChange();
        }

        onFilterChange() {
            this.onUpdate({
                dice: {
                    id: 'location', attribute: 'entity', items: this.siteIds
                }
            });
        }
    }
});


export default module.name;
