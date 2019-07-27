import TimeSlot from 'timeslot-dag';

/**
 * A DimensionGroup allows to query cubes on dimension aggregates.
 * For instance, for a cube containing a "date" dimension, then a "month" dimension group can be created.
 */
export default class DimensionGroup {

	static createTime(parent, dimension) {
		// Create DimensionGroup mapping from Dimension items.
		var mapping = {};

		dimension.items.forEach(childValue => {
			var parentValue = new TimeSlot(childValue).toUpperSlot(parent).value;

			mapping[parentValue] = mapping[parentValue] || [];
			mapping[parentValue].push(childValue);
		});

		return new DimensionGroup(parent, dimension.id, mapping);
	}

	static createLocation(project, form) {
		var groups = {};

		project.groups.forEach(group => {
			groups[group.id] = group.members.filter(id => form.entities.includes(id));

			if (groups[group.id].length === 0)
				delete groups[group.id];
		});

		return new DimensionGroup('group', 'entity', groups);
	}

	static createPartition(partition) {
		var pgroups = {};
		partition.groups.forEach(g => pgroups[g.id] = g.members);
		return new DimensionGroup(partition.id + '_g', partition.id, pgroups);
	}

	get items() {
		return Object.keys(mapping);
	}

	constructor(id, childDimension, mapping) {
		this.id = id;
		this.childDimension = childDimension;
		this.mapping = mapping;
	}
}
