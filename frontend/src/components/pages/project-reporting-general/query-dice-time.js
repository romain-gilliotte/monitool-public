
const module = angular.module(
    'monitool.component.page.project-reporting-general.query-dice-time',
    [
    ]
);

module.component('queryDiceTime', {
    bindings: {
        project: '<',
        onUpdate: '&'
    },

    template: require('./query-dice-time.html'),

    controller: class ProjectFilterController {

        $onInit() {
            this.panelOpen = false;
        }

        $onChanges(changes) {
            this.startDate = this.project.start;
            this.endDate = this.project.end;

            this.onFilterChange();
        }

        onFilterChange() {
            this.onUpdate({
                dice: { id: 'time', attribute: 'day', range: [this.startDate, this.endDate] }
            })
        }
    }
});


export default module.name;
