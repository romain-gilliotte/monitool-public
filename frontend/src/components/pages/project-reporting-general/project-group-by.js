
import angular from 'angular';
import TimeSlot from 'timeslot-dag';


const module = angular.module(
	'monitool.components.pages.project.reporting.general-group-by',
	[
	]
);

module.component('projectGroupBy', {

	bindings: {
		project: '<',
		onUpdate: '&'
	},
	template: require('./project-group-by.html'),

	controller: class GeneralGroupBy {

		$onChanges(changes) {
			this.periodicities = this._computeCompatiblePeriodicities();
			this.groupBy = this._chooseDefaultGroupBy();
			this.onValueChange();
		}

		onValueChange() {
			this.onUpdate({ groupBy: this.groupBy });
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
			let startDate = new Date(this.project.start + 'T00:00:00Z');
			let endDate = new Date(this.project.end + 'T00:00:00Z');
			// let now = new Date();
			// if (now < end)
			// 	end = now;

			let chosen = this.periodicities[this.periodicities.length - 1];

			for (var i = 0; i < this.periodicities.length; ++i) {
				const startSlot = TimeSlot.fromDate(startDate, this.periodicities[i]);
				const endSlot = TimeSlot.fromDate(endDate, this.periodicities[i]);

				let length = 0, slot = startSlot;
				do {
					length++;
					slot = slot.next();
				}
				while (slot.value !== endSlot.value && length < 15);

				if (length < 15) {
					break;
				}
			}

			return chosen;
		}

	}
});

export default module.name;