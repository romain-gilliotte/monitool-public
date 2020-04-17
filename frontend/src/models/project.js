import axios from 'axios';
import { getParser } from 'olap-in-memory';

export default class Project {

	static async fetchAll() {
		const response = await axios.get(`/project`);
		return response.data;
	}

	static async get(id) {
		const response = await axios.get('/project/' + id);
		return new Project(response.data);
	}

	/**
	 * Does it makes sense to display links for input and reporting?
	 */
	get isReadyForReporting() {
		return this.forms.some(f => f.elements.length && f.entities.length);
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

	/**
	 * Scan all internal references to entities, variables, partitions, and partitions elements
	 * inside the project to ensure that there are no broken links and repair them if needed.
	 */
	sanitize() {
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

		// make sure that logical frame dates do not go out of the project.
		// This can happend when editing the project dates.
		this.logicalFrames.forEach(lf => {
			if (lf.start < this.start) lf.start = this.start;
			if (lf.end > this.end) lf.end = this.end;
		});

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
			symbols = getParser().parse(indicator.computation.formula).variables();
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

		// Sanitize distribution
		form.elements.forEach(element => {
			const numActivePartitions = element.partitions.filter(p => p.active).length;
			if (element.distribution < 0 || element.distribution > numActivePartitions)
				element.distribution = Math.floor(numActivePartitions / 2);
		});
	}

	async save() {
		const payload = JSON.parse(angular.toJson(this));
		delete payload._id;

		let response;
		if (this._id)
			response = await axios.put('/project/' + this._id, payload);
		else
			response = await axios.post('/project', payload);

		Object.assign(this, response.data);
	}

	async delete() {
		return axios.delete('/project/' + this._id);
	}

}
