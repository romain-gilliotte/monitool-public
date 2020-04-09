import angular from 'angular';
import axios from 'axios';

export default class Input {

	static async fetchFormShortStatus(project, dataSourceId) {
		const dataSource = project.forms.find(ds => ds.id == dataSourceId)
		const dsResult = Object
			.values(await this.fetchFormStatus(project, dataSource.id))
			.reduce((m, e) => [...m, ...Object.values(e)], []);

		return {
			missing: dsResult.length ? dsResult.filter(v => v === 0).length / dsResult.length : 0,
			incomplete: dsResult.length ? dsResult.filter(v => v !== 0 && v < 1).length / dsResult.length : 0,
			complete: dsResult.length ? dsResult.filter(v => v === 1).length / dsResult.length : 1,
			total: dsResult.length
		};
	}

	/** fixme The computed percentage is no precise enough: it is by variable, we need by cell */
	static async fetchFormStatus(project, dataSourceId) {
		const dataSource = project.forms.find(ds => ds.id === dataSourceId);

		const sum = dataSource.elements.map((v, i) => `!isNaN(variable_${i})`).join('+');
		const formula = `(${sum})/${dataSource.elements.length}`;
		const query = {
			projectId: project._id,
			formula: formula,
			parameters: {},
			dice: [
				{
					id: 'time',
					attribute: 'day',
					range: [null, new Date().toISOString().substring(0, 10)]
				}
			],
			aggregate: [
				{ id: 'time', attribute: dataSource.periodicity },
				{ id: 'location', attribute: 'entity' }
			]
		}

		dataSource.elements.forEach((v, i) => {
			query.parameters['variable_' + i] = {
				variableId: v.id,
				dice: []
			}
		})

		const response = await axios.post(`/rpc/build-report`, query);
		const result = response.data;

		const sortedResult = {};
		Object.keys(result).sort().reverse().forEach(p => sortedResult[p] = result[p]);

		return sortedResult;
	}

	/** Fetch specific data entry by calling the reporting service. */
	static async fetchInput(project, siteId, dataSourceId, period) {
		const dataSource = project.forms.find(ds => ds.id === dataSourceId);

		return new Input({
			projectId: project._id,
			content: await Promise.all(dataSource.elements.map(async variable => {
				// Query server
				const response = await axios.post(`/rpc/build-report`, {
					output: 'flatArray',
					projectId: project._id,
					formula: 'cst',
					parameters: { cst: { variableId: variable.id, dice: [] } },
					dice: [
						{ id: 'time', attribute: dataSource.periodicity, items: [period], },
						{ id: 'location', attribute: 'entity', items: [siteId], },
						...variable.partitions.map(p => ({ id: p.id, attribute: 'element', items: p.elements.map(pe => pe.id) }))
					],
					aggregate: variable.partitions.map(p => ({ id: p.id, attribute: 'element' })),
				});

				// Check that query result have the expected format.
				// If not, it means that we're making a query outside of the bounds of the project,
				// in that case, we can just return empty data, it should happen only when filling the first
				// data entry (because we're trying to load the previous one as well for "fill with previous data" action).
				const expectedLength = variable.partitions.reduce((m, p) => m * p.elements.length, 1);
				const data = response.data;
				if (data.length !== expectedLength) {
					data.length = expectedLength;
					result.fill(null);
				}

				return {
					variableId: variable.id,
					data: data,
					dimensions: [
						{ id: 'time', attribute: dataSource.periodicity, items: [period] },
						{ id: 'location', attribute: 'entity', items: [siteId] },
						...variable.partitions.map(p => ({ id: p.id, attribute: 'element', items: p.elements.map(pe => pe.id) }))
					]
				}
			}))
		});
	}

	constructor(data = null) {
		Object.assign(this, data);
	}

	async save() {
		const data = JSON.parse(angular.toJson(this));

		let response;
		if (this._id) {
			response = await axios.put('/resources/input/' + this._id, data);
		} else {
			response = await axios.post('/resources/input', data);
		}

		Object.assign(this, response.data);
	}
}
