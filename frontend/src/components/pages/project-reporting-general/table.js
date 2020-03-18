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
				const dimension = new TimeDimension(dice.attribute, dice.range[0], dice.range[1]);
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
				...this.project.logicalFrames.reduce((m, logFrame, i) => [
					...m,
					...this._makeRowsFromLogicalFramework(logFrame, i)
				], []),
				...this.project.forms.reduce((m, dataSource, i) => [
					...m,
					...this._makeRowsFromDataSource(dataSource, i)
				], [])
			];
		}

		_makeRowsFromLogicalFramework(logFrame, lfIndex) {
			const rowId = `lf.${lfIndex}`;

			return [
				{
					id: rowId,
					type: 'title',
					subtype: 'project.logical_frame',
					title: logFrame.name
				},
				{
					id: rowId,
					type: 'title',
					subtype: 'project.goal',
					title: logFrame.goal
				},
				...logFrame.indicators.reduce((m, indicator, index) => [
					...m,
					this._makeRowsFromQuery()
				])

			]



			const tbody = {
				id: logicalFramework.id,
				prefix: 'project.logical_frame',
				name: logicalFramework.name,
				sections: []
			};

			tbody.sections.push({
				id: logicalFramework.id,
				prefix: 'project.goal',
				name: logicalFramework.goal,
				indicators: logicalFramework.indicators.map(i => Object.assign({}, i, { id: uuid() })),
				indent: 0
			});

			logicalFramework.purposes.forEach(purpose => {
				tbody.sections.push({
					id: uuid(),
					prefix: 'project.purpose',
					name: purpose.description,
					indicators: purpose.indicators.map(i => Object.assign({}, i, { id: uuid() })),
					indent: 1
				});

				purpose.outputs.forEach(output => {
					tbody.sections.push({
						id: uuid(),
						prefix: 'project.output',
						name: output.description,
						indicators: output.indicators.map(i => Object.assign({}, i, { id: uuid() })),
						indent: 2
					});

					output.activities.forEach(activity => {
						tbody.sections.push({
							id: uuid(),
							prefix: 'project.activity',
							name: activity.description,
							indicators: activity.indicators.map(i => Object.assign({}, i, { id: uuid() })),
							indent: 3
						});
					});
				});
			});


		}

		_makeRowsFromDataSource(dataSource, dsIndex) {
			const rowId = `ds.${dsIndex}`;

			return [
				{
					id: rowId,
					type: 'title',
					subtype: 'project.collection_form',
					title: dataSource.name
				},
				...(
					this.sectionOpen[rowId] ?
						dataSource.elements.reduce((m, variable, varIndex) => [
							...m,
							...this._makeRowsFromVariable(dsIndex, varIndex)
						], []) :
						[]
				)
			];
		}

		_makeRowsFromVariable(dsIndex, varIndex, extraDice = []) {
			const variable = this.project.forms[dsIndex].elements[varIndex];

			// Create query
			const query = {
				formula: 'toto',
				parameters: { toto: { variableId: variable.id, dice: [] } },
				dice: [...this.query.dice, ...extraDice],
				aggregate: this.query.aggregate
			};

			// List dimensions which are usable.
			const dimensions = this.project
				.getDimensions(variable.id, query.dice)
				.filter(dim => !query.aggregate.find(agg => agg.id === dim.id) && dim.numItems > 1);

			// Create base row.
			const rows = [];
			const rowId = `ds.${dsIndex}.var.${varIndex}.${JSON.stringify(extraDice)}`;
			const disagregateBy = this.activeDisagregations[rowId];

			rows.push({
				id: rowId,
				type: 'data',
				title: extraDice.length ? extraDice[extraDice.length - 1].items[0] : variable.name,
				dimensions: dimensions,
				query: query,
				disagregated: !!disagregateBy
			});

			// Recurse if the base row was disagregated.
			if (disagregateBy) {
				// The dimension may not be available if the user disagregated first, and then
				// filtered in the global filter leaving a single item.
				const dimension = dimensions.find(d => d.id == disagregateBy.id);
				if (dimension) {
					const items = dimension.getItems(disagregateBy.attribute);

					items.forEach(item => {
						const dice = [...extraDice, { ...disagregateBy, items: [item] }];
						const subRows = this._makeRowsFromVariable(dsIndex, varIndex, dice);

						rows.push(...subRows);
					});
				}
			}

			return rows;
		}

		_makeRowsFromQuery(queryId, title, query, extraDice = []) {
			const rowId = `${queryId}.${JSON.stringify(extraDice)}`;
			const disagregateBy = this.activeDisagregations[queryId];
			const dimensions = this.project
				.getQueryDimensions(query)
				.filter(dim => !query.aggregate.find(agg => agg.id === dim.id) && dim.numItems > 1);

			const rows = [];
			rows.push({
				id: rowId,
				type: 'data',
				title: extraDice.length ? extraDice[extraDice.length - 1].items[0] : title,
				dimensions: dimensions,
				query: query,
				disagregated: !!disagregateBy
			});

			// Recurse if the base row was disagregated.
			if (disagregateBy) {
				// The dimension may not be available if the user disagregated first, and then
				// filtered in the global filter leaving a single item.
				const dimension = dimensions.find(d => d.id == disagregateBy.id);
				if (dimension) {
					const items = dimension.getItems(disagregateBy.attribute);

					items.forEach(item => {
						const dice = [...extraDice, { ...disagregateBy, items: [item] }];
						const subRows = this._makeRowsFromQuery(queryId, title, query, dice);

						rows.push(...subRows);
					});
				}
			}

			return rows;
		}

	}
});

export default module.name;
