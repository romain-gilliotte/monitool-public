import angular from "angular";

const module = angular.module(__moduleName, []);

module.component(__componentName, {
    bindings: {
        project: '<',
        onUpdate: '&'
    },

    template: require(__templatePath),

    controller: class ProjectFilterController {

        $onInit() {
            this.panelOpen = false;
        }

        $onChanges(changes) {
            const now = new Date().toISOString().substring(0, 10)
            this.startDate = this.project.start;
            this.endDate = this.project.end < now ? this.project.end : now;

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
