import angular from 'angular';
import mtMselectWithGroups from '../../shared/ng-models/element-filter';
import { getQueryDimensions } from '../../../helpers/query-builder';

const module = angular.module(__moduleName, [mtMselectWithGroups]);

/** 
 * FIXME This whole component feels a bit hacky.
 * Ideally we should be able to do this only from the dimensions instead of
 * using knowledge of how they were built to guess name things, and recreate
 * the groups.
 */
module.component(__componentName, {
	bindings: {
		project: '<',
		query: '<',
		onUpdate: '&'
	},

	template: require(__templatePath),

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

			getQueryDimensions(this.project, this.query, false, false).forEach(dimension => {
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
