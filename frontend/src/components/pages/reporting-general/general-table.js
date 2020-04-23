import angular from 'angular';
import { TimeDimension } from 'olap-in-memory';
import mtTrData from './tr-data';
import mtFaOpen from '../../shared/misc/fa-open';
import { buildQueryFromIndicator, buildQueryFromVariable, getQueryDimensions } from '../../../helpers/query-builder';
import { updateArrayInPlace } from '../../../helpers/array';
require(__scssPath);

/**
 * Note for future self: this component is performing too many digest cycles.
 * We should try to optimize this.
 */
const module = angular.module(__moduleName, [mtTrData, mtFaOpen]);

module.component(__componentName, {
	bindings: {
		project: '<',
		query: '<',
		onPlotChange: '&'
	},
	template: require(__templatePath),
	controller: class {

		constructor($element) {
			"ngInject";

			this._element = $element[0]; // Used to spy scroll and translate headers

			this.sectionOpen = {}; // { rowId: <boolean> }
			this.activeDisagregations = {}; // { rowId: { id: <dimId>|'computation' [, attribute: <dimattr>] }}
			this.plots = {}; // { rowId: { active: false, data: [45, 43, 23, 45, 56, ...] }, ... }
			this.rows = [];
		}

		$onChanges(changes) {
			if (changes.query) {
				this.columns = this._makeColumnsFromQuery(changes.query.currentValue);
				this._updateRows();
				this._updatePlots();
			}

			// If the page just loaded, open the first section.
			if (changes.project && changes.project.isFirstChange() && this.rows.length) {
				this.onSectionToggle(this.rows[0].id);
			}
		}

		$onInit() {
			this._scrollHandler = () => this._translateHeaders();
			this._element.addEventListener('scroll', this._scrollHandler);
		}

		$onDestroy() {
			if (this._scrollHandler)
				this._element.removeEventListener('scroll', this._scrollHandler);
		}

		$doCheck() {
			// this is a bit overkill, should we debounce?
			this._translateHeaders();
		}

		_translateHeaders() {
			const target = this._element;
			const topHeader = target.querySelector('thead');
			const leftHeaders = target.querySelectorAll('.section-header-row,.row-graph,.row-title,.row-dimension')

			topHeader.style.transform = `translate(0, ${target.scrollTop}px)`;
			for (let i = 0; i < leftHeaders.length; ++i)
				leftHeaders[i].style.transform = `translate(${target.scrollLeft}px)`;
		}

		onSectionToggle(rowId) {
			// Update state
			this.sectionOpen[rowId] = !this.sectionOpen[rowId];

			// Regen all rows
			this._updateRows();
			this._updatePlots();
			this._translateHeaders();
		}

		/**
		 * Trigered by the child component when a row is disagregated.
		 * This marks the rows as disagregated in our component state (this.activeDisagregations) and
		 * regenerates everything.
		 */
		onRowDisagregate(rowId, dimensionId, attribute) {
			// Update state
			if (dimensionId) {
				this.activeDisagregations[rowId] = {
					id: dimensionId,
					attribute: attribute
				};
			}
			else {
				delete this.activeDisagregations[rowId];
			}

			// Regen all rows
			this._updateRows();
			this._updatePlots();
		}

		onRowPlotClicked(rowId) {
			if (!this.plots[rowId])
				this.plots[rowId] = { active: false, data: null };

			if (this.plots[rowId].data) {
				this.plots[rowId].active = !this.plots[rowId].active;
				this._updatePlots();
			}
		}

		onRowPlotData(rowId, data) {
			if (!this.plots[rowId])
				this.plots[rowId] = { active: false, data: null };

			this.plots[rowId].data = data;
			if (this.plots[rowId].active)
				this._updatePlots();
		}

		_updatePlots() {
			const plotData = {
				x: this.columns.map(col => col.name),
				ys: [],
				presentation: this.query.aggregate[0].id === 'time' ? 'line' : 'bar'
			};

			for (let rowId in this.plots) {
				if (this.plots[rowId].active) {
					const row = this.rows.find(row => row.id === rowId);
					if (row) {
						plotData.ys.push({ label: row.label, data: this.plots[rowId].data })
					}
				}
			}

			this.onPlotChange({ plotData });
		}

		/** Computes the columns that need to be displayed according to a given query. */
		_makeColumnsFromQuery(query) {
			if (query.aggregate.length !== 1)
				throw new Error('Not supported');

			const aggregate = query.aggregate[0];

			let columns;
			if (aggregate.id === 'time') {
				const dice = query.dice.find(d => d.id == 'time');
				const dimension = new TimeDimension('time', dice.attribute, dice.range[0], dice.range[1]);
				const items = dimension.getItems(aggregate.attribute);

				columns = items.map(item => ({ id: item, name: item, title: item }))
			}
			else if (aggregate.id === 'location') {
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

		_updateRows() {
			const newRows = [
				...this.project.logicalFrames.reduce((m, logFrame) => [
					...m,
					...this._makeRowsFromLogicalFramework(logFrame)
				], []),
				...this._makeRowsFromExtraIndicators(this.project.extraIndicators),
				...this.project.forms.reduce((m, dataSource) => [
					...m,
					...this._makeRowsFromDataSource(dataSource)
				], [])
			];

			updateArrayInPlace(this.rows, newRows);
		}

		_makeRowsFromLogicalFramework(logFrame) {
			const rowId = `lf.${logFrame.id}`;

			return [
				{
					id: rowId,
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
						...logFrame.indicators.reduce((m, indicator, i) => [
							...m,
							...this._makeRowsFromIndicator(`${rowId}.i.${i}`, logFrame, indicator)
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
							...purpose.indicators.reduce((m, indicator, i) => [
								...m,
								...this._makeRowsFromIndicator(`${rowId}.p.${pIndex}.i.${i}`, logFrame, indicator, 1)
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
								...output.indicators.reduce((m, indicator, i) => [
									...m,
									...this._makeRowsFromIndicator(`${rowId}.p.${pIndex}.o.${oIndex}.i.${i}`, logFrame, indicator, 2)
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
									...activity.indicators.reduce((m, indicator, i) => [
										...m,
										...this._makeRowsFromIndicator(`${rowId}.p.${pIndex}.o.${oIndex}.a.${aIndex}.i.${i}`, logFrame, indicator, 3)
									], []),
								], [])
							], [])
						], [])
					] : []
				)
			]
		}

		_makeRowsFromExtraIndicators(extraIndicators) {
			if (extraIndicators.length === 0)
				return [];

			const rowId = 'extra';
			return [
				{
					id: rowId,
					type: 'title',
					subtype: 'indicator.extra'
				},
				...(
					this.sectionOpen[rowId] ?
						extraIndicators.reduce((m, indicator, index) => [
							...m,
							...this._makeRowsFromIndicator(`${rowId}.${index}`, null, indicator, 0)
						], []) :
						[]
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
							...this._makeRowsFromVariable(variable, dataSource)
						], []) :
						[]
				)
			];
		}

		_makeRowsFromIndicator(id, logicalFramework, indicator, indent = 0) {
			const query = buildQueryFromIndicator(
				indicator, logicalFramework, this.project,
				this.query.aggregate, this.query.dice
			);

			if (query)
				return this._makeRowsFromQuery(
					id, indicator.display, query, indent,
					indicator.baseline, indicator.target, indicator.colorize
				);
			else
				return [
					{ type: 'data', id, label: indicator.display, query: null, indent }
				];
		}

		_makeRowsFromVariable(variable, dataSource) {
			const query = buildQueryFromVariable(
				variable, dataSource, this.project,
				this.query.aggregate, this.query.dice
			);

			return this._makeRowsFromQuery(variable.id, variable.name, query);
		}

		_makeRowsFromQuery(queryId, label, query, indent = 0, baseline = null, target = null, colorize = false) {
			const id = `${queryId}.${JSON.stringify(query.dice)}`;
			const disagregateBy = this.activeDisagregations[id];

			// Root row.
			const rows = [{ type: 'data', id, label, query, indent, baseline, target, colorize }];
			if (!disagregateBy)
				return rows;

			// Split by computation
			if (disagregateBy.id === 'computation') {
				for (let paramName in query.parameters) {
					const parameter = query.parameters[paramName];
					const subQuery = Object.assign(
						{},
						query,
						{ formula: paramName, parameters: { [paramName]: parameter } }
					);

					const variableName = this.project.forms
						.reduce((m, f) => [...m, ...f.elements], [])
						.find(v => v.id == parameter.variableId)
						.name

					rows.push(...this._makeRowsFromQuery(
						`${queryId}.${paramName}`,
						`${paramName} (${variableName})`,
						subQuery,
						indent + 1
					));
				}

				return rows;
			}

			// Generic split
			const dimension = getQueryDimensions(this.project, query).find(d => d.id == disagregateBy.id);
			if (!dimension) {
				// The requested disagregation is no longer valid because the this.query changed.
				delete this.activeDisagregations[id];
				return rows;
			}

			const attributes = disagregateBy.attribute ? [disagregateBy.attribute] : dimension.attributes;
			attributes.forEach(attribute => {
				dimension.getEntries(attribute).forEach(([item, subLabel]) => {
					if (item !== 'out' && item !== 'all') {
						const subQuery = Object.assign(
							{},
							query,
							{ dice: [...query.dice, { id: disagregateBy.id, attribute, items: [item] }] },
						);

						rows.push(...this._makeRowsFromQuery(queryId, subLabel, subQuery, indent + 1, baseline, target, colorize));
					}
				});
			});

			return rows;
		}
	}
});

export default module.name;
