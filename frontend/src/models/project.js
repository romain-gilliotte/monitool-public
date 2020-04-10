import axios from 'axios';
import exprEval from 'expr-eval';
import { GenericDimension, TimeDimension } from 'olap-in-memory';

export default class Project {

	static async fetchAll() {
		const response = await axios.get(`/resources/project`);
		return response.data;
	}

	static async get(id) {
		const response = await axios.get('/resources/project/' + id);
		return new Project(response.data);
	}

	/**
	 * Does it makes sense to display links for input and reporting?
	 */
	get isReadyForReporting() {
		return this.forms.some(f => f.elements.length && f.entities.length);
	}

	// FIXME this needs to be removed and taken directly from the TimeSlot package.
	get compatiblePeriodicities() {
		return [
			'day', 'month_week_sat', 'month_week_sun', 'month_week_mon', 'week_sat', 'week_sun',
			'week_mon', 'month', 'quarter', 'semester', 'year'
		];
	}

	constructor(data) {
		var now = new Date().toISOString().substring(0, 10);
		var oneYear = new Date();
		oneYear.setFullYear(oneYear.getFullYear() + 1);
		oneYear = oneYear.toISOString().substring(0, 10);

		this.name = "";
		this.active = true;
		this.start = now;
		this.end = oneYear;
		this.extraIndicators = [];
		this.logicalFrames = [];
		this.entities = [];
		this.groups = [];
		this.forms = [];

		if (data)
			Object.assign(this, data);
	}

	/** Get the disagregation dimensions available for any given query */
	getQueryDimensions(query, strictTime = true) {
		const varDimsGroups = [];
		for (let key in query.parameters) {
			const variableId = query.parameters[key].variableId;
			const dices = [...query.dice, ...query.parameters[key].dice]
			const varDims = this
				.getVariableDimensions(variableId, dices, strictTime)
				// If filtered in the formula, we don't want to manipulate it.
				.filter(dim => !query.parameters[key].dice.find(dice => dice.id == dim.id))
				// Do not allow manipulating the dimension used in the columns.
				.filter(dim => !query.aggregate.find(agg => agg.id === dim.id));

			varDimsGroups.push(varDims);
		}

		if (varDimsGroups.length == 0) {
			return [];
		}

		return varDimsGroups.reduce((dimensions1, dimensions2) =>
			dimensions1
				.map(dimension => {
					const otherDimension = dimensions2.find(dim => dim.id == dimension.id);
					return otherDimension ? dimension.intersect(otherDimension) : null
				})
				.filter(dimension => dimension !== null)
		);
	}

	getVariableDimensions(variableId, dices = [], strictTime = true) {
		const form = this.forms.find(f => f.elements.find(v => v.id === variableId));
		const variable = form.elements.find(v => v.id === variableId);

		// Time dimension
		const periodicity = strictTime ? form.periodicity : 'day';
		const time = new TimeDimension('time', periodicity, this.start, this.end, `project.dimensions.time`);

		// location dimension
		const siteIdToName = siteId => this.entities.find(s => s.id == siteId).name;
		const location = new GenericDimension('location', 'entity', form.entities, `project.dimensions.entity`, siteIdToName);
		this.groups.forEach(group => {
			location.addChildAttribute(
				'entity',
				group.id,
				entityId => group.members.includes(entityId) ? 'in' : 'out',
				item => `${item == 'in' ? '∈' : '∉'} ${group.name}`
			);
		});

		// partitions
		const partitions = variable.partitions.map(partition => {
			const elementIdToName = elementId => partition.elements.find(el => el.id == elementId).name;
			const dim = new GenericDimension(partition.id, 'element', partition.elements.map(e => e.id), partition.name, elementIdToName);

			partition.groups.forEach(group => {
				dim.addChildAttribute(
					'element',
					group.id,
					elementId => group.members.includes(elementId) ? 'in' : 'out',
					item => `${item == 'in' ? '∈' : '∉'} ${group.name}`
				);
			})

			return dim;
		});

		const dimensions = [time, location, ...partitions];
		dices.forEach(dice => {
			let dimIndex = dimensions.findIndex(dim => dim.id === dice.id);
			if (dice.range) {
				dimensions[dimIndex] = dimensions[dimIndex].diceRange(dice.attribute, dice.range[0], dice.range[1]);
			}
			else if (dice.items) {
				dimensions[dimIndex] = dimensions[dimIndex].dice(dice.attribute, dice.items);
			}
			else throw new Error('unexpected dice');
		})

		return dimensions;
	}

	/**
	 * Scan all internal references to entities, variables, partitions, and partitions elements
	 * inside the project to ensure that there are no broken links and repair them if needed.
	 */
	sanitize(indicators) {
		//////////////////
		// Sanitize links to input entities
		//////////////////

		var entityIds = this.entities.map(e => e.id);

		// Filter groups members
		this.groups.forEach(group => {
			group.members = group.members.filter(e => entityIds.includes(e))
		});
		this.groups = this.groups.filter(group => group.members.length > 0);

		this.forms.forEach(this._sanitizeForm, this);
		this.forms = this.forms.filter(ds => ds.elements.length);

		/////////////
		// Sanitize links to variables from indicators
		/////////////

		this.logicalFrames.forEach(logicalFrame => {
			logicalFrame.indicators.forEach(this._sanitizeIndicator, this);
			logicalFrame.purposes.forEach(purpose => {
				purpose.indicators.forEach(this._sanitizeIndicator, this);
				purpose.outputs.forEach(output => {
					output.indicators.forEach(this._sanitizeIndicator, this);
					output.activities.forEach(activity => {
						activity.indicators.forEach(this._sanitizeIndicator, this);
					});
				});
			});
		});

		// Sanitize indicators only if the list is provided.
		if (indicators) {
			for (var indicatorId in this.crossCutting) {
				var indicator = indicators.find(i => i._id == indicatorId);
				if (!indicator) {
					delete this.crossCutting[indicatorId];
					continue;
				}

				var commonThemes = indicator.themes.filter(t => this.themes.includes(t));
				if (commonThemes.length === 0)
					delete this.crossCutting[indicatorId];
			}
		}

		for (var indicatorId in this.crossCutting)
			this._sanitizeIndicator(this.crossCutting[indicatorId]);

		this.extraIndicators.forEach(this._sanitizeIndicator, this);
	}

	/**
	 * Scan all references to variables, partitions and partitions elements
	 * inside a given indicator to ensure that there are no broken links
	 * and repair them if needed.
	 */
	_sanitizeIndicator(indicator) {
		if (indicator.computation === null)
			return;

		// try to retrive the symbols from the formula.
		var symbols = null;
		try {
			const parser = new exprEval.Parser();
			parser.consts = {};
			symbols = parser.parse(indicator.computation.formula).variables();
		}
		catch (e) {
			// if we fail to retrieve symbols => computation is invalid.
			indicator.computation = null;
			return;
		}

		for (var key in indicator.computation.parameters) {
			// This key is useless.
			if (!symbols.includes(key)) {
				delete indicator.computation.parameters[key];
				continue;
			}

			var parameter = indicator.computation.parameters[key];
			var element = null;

			this.forms.forEach(f => {
				f.elements.forEach(e => {
					if (e.id === parameter.elementId)
						element = e;
				});
			});

			// Element was not found.
			if (!element) {
				indicator.computation = null;
				return;
			}

			for (var partitionId in parameter.filter) {
				var partition = element.partitions.find(p => p.id === partitionId);
				if (!partition) {
					indicator.computation = null;
					return;
				}

				var elementIds = parameter.filter[partitionId];
				for (var i = 0; i < elementIds.length; ++i) {
					if (!partition.elements.find(e => e.id === elementIds[i])) {
						indicator.computation = null;
						return;
					}
				}
			}
		}
	}

	_sanitizeForm(form) {
		var entityIds = this.entities.map(e => e.id);

		// Remove deleted entities
		form.entities = form.entities.filter(e => entityIds.includes(e));

		// Sanitize order and distribution
		form.elements.forEach(element => {
			if (element.distribution < 0 || element.distribution > element.partitions.length)
				element.distribution = Math.floor(element.partitions.length / 2);
		});
	}

	async save() {
		const payload = JSON.parse(angular.toJson(this));
		delete payload._id;

		let response;
		if (this._id)
			response = await axios.put('/resources/project/' + this._id, payload);
		else
			response = await axios.post('/resources/project', payload);

		Object.assign(this, response.data);
	}

	async delete() {
		return axios.delete('/resources/project/' + this._id);
	}

}
