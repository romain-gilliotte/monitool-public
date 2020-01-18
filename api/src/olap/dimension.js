const TimeSlot = require('timeslot-dag');

class Dimension {

	static createTime(project, form, element) {
		const periodicity = form.periodicity === 'free' ? 'day' : form.periodicity;

		// max(project.start, form.start)
		const start = [project.start, form.start].filter(a => a).sort().pop();
		// min(project.end, form.end, new Date())
		const end = [project.end, form.end, new Date().toISOString().substring(0, 10)].sort().shift();

		const periods = Array
			.from(
				timeSlotRange(
					TimeSlot.fromDate(new Date(start + 'T00:00:00Z'), periodicity),
					TimeSlot.fromDate(new Date(end + 'T00:00:00Z'), periodicity)
				)
			)
			.map(ts => ts.value)

		return new Dimension(periodicity, periods, element.timeAgg);
	}

	static createTimeFast(project, form, element, inputs) {
		const periodicity = form.periodicity === 'free' ? 'day' : form.periodicity;
		const periods = [...(new Set(inputs.map(i => i.period)))];
		periods.sort();

		return new Dimension(periodicity, periods, element.timeAgg);
	}

	static createLocation(project, form, element) {
		return new Dimension('entity', form.entities, element.geoAgg);
	}

	static createPartition(partition) {
		return new Dimension(
			partition.id,
			partition.elements.map(function (e) { return e.id; }),
			partition.aggregation
		);
	};

	get indexes() {
		if (!this._indexes) {
			const numItems = this.items.length;

			this._indexes = {};
			for (let i = 0; i < numItems; ++i)
				this._indexes[this.items[i]] = i;
		}

		return this._indexes;
	}

	/**
	 * id = "month"
	 * items = ["2010-01", "2010-02", ...]
	 * aggregation = "sum"
	 */
	constructor(id, items, aggregation) {
		this.id = id;
		this.items = items;
		this.aggregation = aggregation;
	}
}

module.exports = Dimension;