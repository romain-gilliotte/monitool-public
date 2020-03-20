import angular from 'angular';
import { TimeDimension } from 'olap-in-memory';

import mtTrData from './tr-data';
import mtFaOpen from '../../shared/misc/plus-minus-icon';

const module = angular.module(
	'monitool.components.pages.project.reporting_general.table',
	[
		mtTrData,
		mtFaOpen
	]
);


module.component('generalTable', {
	bindings: {
		project: '<',
		query: '<',
	},
	template: require('./table.html'),
	controller: class GeneralTableController {

		constructor() {
			this.sectionOpen = {};
			this.activeDisagregations = {};
		}

		$onChanges(changes) {
			if (changes.query) {
				this.columns = this._makeColumnsFromQuery(changes.query.currentValue);
				this.rows = this._makeRows();
			}
		}

		onSectionToggle(rowId) {
			// Update state
			this.sectionOpen[rowId] = !this.sectionOpen[rowId];

			// Regen all rows
			this.rows = this._makeRows();
		}

		/**
		 * Trigered by the child component when a row is disagregated.
		 * This marks the rows as disagregated in our component state (this.activeDisagregations) and
		 * regenerates everything.
		 */
		onRowDisagregate(rowId, dimensionId, attribute) {
			// Update state
			if (dimensionId && attribute) {
				this.activeDisagregations[rowId] = {
					id: dimensionId,
					attribute: attribute
				};
			}
			else {
				delete this.activeDisagregations[rowId];
			}

			// Regen all rows
			this.rows = this._makeRows();
		}

		/**
		 * Computes the columns that need to be displayed according to a given query.
		 */
		_makeColumnsFromQuery(query) {
			let columns;

			if (query.aggregate.length === 1 && query.aggregate[0].id === 'time') {
				const dice = query.dice.find(d => d.id == 'time');
				const dimension = new TimeDimension('time', dice.attribute, dice.range[0], dice.range[1]);
				const items = dimension.drillUp(query.aggregate[0].attribute).getItems();

				columns = items.map(item => ({ id: item, name: item, title: item }))
			}
			else if (query.aggregate.length === 1 && query.aggregate[0].id === 'location') {
				const dice = query.dice.find(d => d.id == 'location');

				columns = dice.items.map(item => {
					const site = this.project.entities.find(site => site.id == item);
					return { id: site.id, name: site.name, title: site.name };
				});
			}
			else {
				throw new Error('Not supported');
			}

			return columns;
		}

		_makeRows() {
			return [
				...this.project.logicalFrames.reduce((m, logFrame) => [
					...m,
					...this._makeRowsFromLogicalFramework(logFrame)
				], []),
				...this.project.forms.reduce((m, dataSource) => [
					...m,
					...this._makeRowsFromDataSource(dataSource)
				], [])
			];
		}

		_makeRowsFromLogicalFramework(logFrame) {
			const rowId = `lf.${logFrame.id}`;

			return [
				{
					id: `${rowId}`,
					type: 'title',
					subtype: 'project.logical_frame',
					title: logFrame.name
				},
				...(
					this.sectionOpen[rowId] ? [
						{
							id: `${rowId}.goal`,
							type: 'subtitle',
							subtype: 'project.goal',
							title: logFrame.goal
						},
						...logFrame.indicators.reduce((m, indicator) => [
							...m,
							...this._makeRowsFromIndicator(logFrame, indicator)
						], []),
						...logFrame.purposes.reduce((m, purpose, pIndex) => [
							...m,
							{
								id: `${rowId}.purpose.${pIndex}`,
								type: 'subtitle',
								subtype: 'project.purpose',
								title: purpose.description,
								indent: 1
							},
							...purpose.indicators.reduce((m, indicator) => [
								...m,
								...this._makeRowsFromIndicator(logFrame, indicator, 1)
							], []),
							...purpose.outputs.reduce((m, output, oIndex) => [
								...m,
								{
									id: `${rowId}.purpose.${pIndex}.output.${oIndex}`,
									type: 'subtitle',
									subtype: 'project.output',
									title: output.description,
									indent: 2
								},
								...output.indicators.reduce((m, indicator) => [
									...m,
									...this._makeRowsFromIndicator(logFrame, indicator, 2)
								], []),
								...output.activities.reduce((m, activity, aIndex) => [
									...m,
									{
										id: `${rowId}.purpose.${pIndex}.output.${oIndex}.activity.${aIndex}`,
										type: 'subtitle',
										subtype: 'project.activity',
										title: activity.description,
										indent: 3
									},
									...activity.indicators.reduce((m, indicator) => [
										...m,
										...this._makeRowsFromIndicator(logFrame, indicator, 3)
									], []),
								], [])
							], [])
						], [])
					] : []
				)
			]
		}

		_makeRowsFromDataSource(dataSource) {
			const rowId = `ds.${dataSource.id}`;

			return [
				{
					id: rowId,
					type: 'title',
					subtype: 'project.collection_form',
					title: dataSource.name
				},
				...(
					this.sectionOpen[rowId] ?
						dataSource.elements.reduce((m, variable) => [
							...m,
							...this._makeRowsFromVariable(variable)
						], []) :
						[]
				)
			];
		}

		_makeRowsFromIndicator(logicalFramework, indicator, indent = 0) {
			// Compute parameters from indicator definition
			const parameters = {}
			for (let key in indicator.computation.parameters) {
				const parameter = indicator.computation.parameters[key];

				parameters[key] = {
					variableId: parameter.elementId,
					dice: []
				};

				for (let partitionId in parameter.filter) {
					dice.push({
						id: partitionId,
						attribute: 'element',
						items: parameter.filter[partitionId]
					});
				}
			}

			// Add extra dices provided by the logical framework.
			const dice = this.query.dice.slice();
			dice.push({ id: 'location', attribute: 'entity', items: logicalFramework.entities });
			if (logicalFramework.start)
				dice.push({ id: 'time', attribute: 'day', range: [logicalFramework.start, null] });
			if (logicalFramework.end)
				dice.push({ id: 'time', attribute: 'day', range: [null, logicalFramework.end] });

			const query = {
				formula: indicator.computation.formula,
				parameters: parameters,
				aggregate: this.query.aggregate,
				dice
			}

			return this._makeRowsFromQuery(indicator.id, indicator.display, query, indent, indicator.baseline, indicator.target, indicator.colorize);
		}

		_makeRowsFromVariable(variable) {
			const query = {
				formula: 'variable',
				parameters: { variable: { variableId: variable.id, dice: [] } },
				dice: this.query.dice,
				aggregate: this.query.aggregate
			};

			return this._makeRowsFromQuery(variable.id, variable.name, query);
		}

		_makeRowsFromQuery(queryId, title, query, indent = 0, baseline = null, target = null, colorize = false) {
			const rowId = `${queryId}.${JSON.stringify(query.dice)}`;
			const disagregateBy = this.activeDisagregations[rowId];
			const dimensions = this.project.getQueryDimensions(query);

			const rows = [];
			rows.push({
				id: rowId,
				type: 'data',
				disagregated: !!disagregateBy,
				title, dimensions, query, indent, baseline, target, colorize
			});

			//FIXME c'est tout pétépas beau

			// Recurse if the base row was disagregated.
			if (disagregateBy) {
				// The dimension may not be available if the user disagregated first, and then
				// filtered in the global filter leaving a single item.
				const dimension = dimensions.find(d => d.id == disagregateBy.id);
				if (dimension) {
					dimension.attributes.forEach(attribute => {
						dimension.getItems(attribute).forEach(item => {
							const subQuery = Object.assign(
								{},
								query,
								{ dice: [...query.dice, { id: disagregateBy.id, attribute, items: [item] }] },
							);
							const subTitle = this._getRowTitle({ id: disagregateBy.id, attribute }, item);
							const subRows = this._makeRowsFromQuery(queryId, subTitle, subQuery, indent + 1, baseline, target, colorize);

							rows.push(...subRows);
						});

					})
				}
			}

			return rows;
		}

		_getRowTitle(disagregateBy, item) {
			if (disagregateBy.id === 'time')
				return item;
			else if (disagregateBy.id === 'location' && disagregateBy.attribute === 'entity')
				return this.project.entities.find(site => site.id === item).name;
			else if (disagregateBy.id === 'location') {
				const group = this.project.groups.find(group => group.id === disagregateBy.attribute);
				return `${item == 'in' ? '∈' : '∉'} ${group.name}`
			}
			else {
				const partition = this.project.forms
					.reduce((m, f) => [
						...m,
						f.elements.reduce((m, v) => [...m, ...v.partitions], [])
					], [])
					.find(p => disagregateBy.id === p.id);

				if (disagregateBy.attribute === 'element')
					return partition.elements.find(e => e.id === item).name;
				else {
					const group = partition.groups.find(group => group.id === disagregateBy.attribute);
					return `${item == 'in' ? '∈' : '∉'} ${group.name}`
				}
			}
		}
	}
});

export default module.name;
