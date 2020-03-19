
import angular from 'angular';
import { TimeDimension } from 'olap-in-memory';
import TimeSlot from 'timeslot-dag';


const module = angular.module(
	'monitool.components.pages.project.reporting.query-aggregate',
	[
	]
);

module.component('queryAggregate', {

	bindings: {
		project: '<',
		onUpdate: '&'
	},
	template: require('./query-aggregate.html'),

	controller: class GeneralGroupBy {

		$onChanges(changes) {
			this.periodicities = this._computeCompatiblePeriodicities();
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

		_computeCompatiblePeriodicities() {
			const timePeriodicities = [
				'day', 'month_week_sat', 'month_week_sun', 'month_week_mon', 'week_sat', 'week_sun',
				'week_mon', 'month', 'quarter', 'semester', 'year'
			];

			return timePeriodicities.filter(periodicity => {
				for (var i = 0; i < this.project.forms.length; ++i) {
					var dataSource = this.project.forms[i];

					if (dataSource.periodicity === periodicity)
						return true;

					try {
						let t = TimeSlot.fromDate(new Date(), dataSource.periodicity);
						t.toUpperSlot(periodicity);
						return true;
					}
					catch (e) {
					}
				}
			});
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