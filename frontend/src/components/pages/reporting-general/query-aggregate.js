import angular from 'angular';
import { TimeDimension } from 'olap-in-memory';

const module = angular.module(__moduleName, []);

module.component(__componentName, {

	bindings: {
		project: '<',
		onUpdate: '&'
	},
	template: require(__templatePath),

	controller: class GeneralGroupBy {

		$onChanges(changes) {
			this.periodicities = this.project.compatiblePeriodicities;
			this.groupBy = this._chooseDefaultGroupBy();

			this.onValueChange();
		}

		onValueChange() {
			let value;
			if (this.groupBy === 'entity')
				value = { id: 'location', attribute: 'entity' }
			else
				value = { id: 'time', attribute: this.groupBy }

			this.onUpdate({ aggregate: value })
		}

		_chooseDefaultGroupBy() {
			const now = new Date().toISOString().substring(0, 10)
			const start = this.project.start;
			const end = this.project.end < now ? this.project.end : now;

			const dimension = new TimeDimension('time', 'day', start, end);
			return this.periodicities.find(periodicity => {
				return dimension.getItems(periodicity).length < 15;
			}) || this.periodicities[this.periodicities.length - 1];
		}

	}
});

export default module.name;