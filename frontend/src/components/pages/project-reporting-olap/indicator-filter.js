
import mtMselectWithGroups from '../../shared/ng-models/mselect-with-groups';

const module = angular.module(
	'monitool.component.shared.reporting.project-filter',
	[
		mtMselectWithGroups
	]
);


module.component('indicatorFilter', {
	bindings: {
		project: '<',
		query: '<',
		onUpdate: '&'
	},

	template: require('./indicator-filter.html'),

	controller: class IndicatorFilterController {

		$onInit() {
			this.panelOpen = false;
		}

		$onChanges(changes) {
			if (changes.query) {
				this._createChoices();
				this._selectAll();
				this.onFilterChange();
			}
		}

		onFilterChange() {
			const dices = [
				{ id: 'time', attribute: 'day', range: [this.start, this.end] },
				...Object.keys(this.selectedItems).map(dimensionId => {
					let attribute;
					if (dimensionId === 'location')
						attribute = 'entity';
					else
						attribute = 'element';

					return {
						id: dimensionId,
						attribute,
						items: this.selectedItems[dimensionId]
					}
				})
			];

			this.onUpdate({ dices })
		}

		_selectAll() {
			this.selectedItems = {};
			this.dimensions.forEach(dimension => {
				this.selectedItems[dimension.id] = dimension.elements.map(e => e.id);
			});
		}

		_createChoices() {
			this.dimensions = [];
			this.project.getQueryDimensions(this.query, false).forEach(dimension => {
				if (dimension.id === 'time') {
					const items = dimension.getItems();
					this.start = items[0];
					this.end = items[items.length - 1];
				}

				else if (dimension.id === 'location') {
					const groups = this.project.groups.map(group => ({
						...group,
						members: group.members.filter(id => dimension.getItems().includes(id))
					}));

					this.dimensions.push({
						id: 'location',
						label: 'project.dimensions.entity',
						elements: dimension.getEntries().map(([id, label]) => ({ id, name: label })),
						groups: groups
					});
				}

				else {
					const partition = this.project.forms.reduce(
						(m, f) => m ? m : f.elements.reduce(
							(m, v) => m ? m : v.partitions.find(p => p.id === dimension.id),
							null
						),
						null
					);

					const groups = partition.groups.map(group => ({
						...group,
						members: group.members.filter(id => dimension.getItems().includes(id))
					}));

					this.dimensions.push({
						id: dimension.id,
						label: dimension.label,
						elements: dimension.getEntries().map(([id, label]) => ({ id, name: label })),
						groups: groups
					})
				}
			});

		}
	}
});


export default module.name;
