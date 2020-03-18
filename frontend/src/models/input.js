import angular from 'angular';
import axios from 'axios';
import TimeSlot from 'timeslot-dag';

export default class Input {

	static async fetchDataSourceShortStatus(project) {
		const result = await Promise.all(project.forms.map(async dataSource => {
			const dsResult = Object
				.values(await this.fetchFormStatus(project, dataSource.id))
				.reduce((m, e) => [...m, ...Object.values(e)], []);

			return {
				missing: dsResult.length ? dsResult.filter(v => v === 0).length / dsResult.length : 0,
				incomplete: dsResult.length ? dsResult.filter(v => v !== 0 && v < 1).length / dsResult.length : 0,
				complete: dsResult.length ? dsResult.filter(v => v === 1).length / dsResult.length : 1,
				total: dsResult.length
			};
		}));

		return project.forms
			.map((ds, i) => i)
			.reduce((m, i) => { m[project.forms[i].id] = result[i]; return m; }, {})
	}

	static async fetchFormStatus(project, dataSourceId) {
		const dataSource = project.forms.find(ds => ds.id === dataSourceId);

		const query = {
			formula: dataSource.elements.map((v, i, a) => '!isNaN(variable_' + i + ')/' + a.length).join('+'),
			parameters: {},
			dice: [],
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

		const response = await axios.post(`/resources/project/${project._id}/reporting`, query);
		const result = response.data;

		const sortedResult = {};
		Object.keys(result).sort().reverse().forEach(p => sortedResult[p] = result[p]);

		return sortedResult;
	}

	static async fetchLasts(project, siteId, dataSourceId, period) {
		const dataSource = project.forms.find(ds => ds.id === dataSourceId);
		const previousPeriod = new TimeSlot(period).previous().value;
		const data = await Promise.all(dataSource.elements.map(async (v) => {
			const response = await axios.post(`/resources/project/${project._id}/reporting`, {
				formula: 'cst',
				parameters: {
					cst: {
						variableId: v.id,
						dice: v.partitions.map(p => ({
							id: p.id,
							attribute: 'element',
							items: p.elements.map(pe => pe.id),
						}))
					}
				},
				dice: [
					{ id: 'time', attribute: dataSource.periodicity, range: [previousPeriod, period], },
					{ id: 'location', attribute: 'entity', items: [siteId], },
				],
				aggregate: [
					{ id: 'time', attribute: dataSource.periodicity },
					...v.partitions.map(p => ({ id: p.id, attribute: 'element' }))
				],
				output: 'flatArray'
			});

			return response.data;
		}));


		const previous = new Input({
			projectId: project._id,
			content: dataSource.elements.map((v, i) => ({
				variableId: v.id,
				data: data[i].slice(0, data[i].length / 2),
				dimensions: [
					{ id: 'time', attribute: dataSource.periodicity, items: [period] },
					{ id: 'location', attribute: 'entity', items: [siteId] },
					...v.partitions.map(p => ({
						id: p.id,
						attribute: 'element',
						items: p.elements.map(pe => pe.id)
					}))
				]
			}))
		});

		const current = new Input({
			projectId: project._id,
			content: dataSource.elements.map((v, i) => ({
				variableId: v.id,
				data: data[i].slice(data[i].length / 2),
				dimensions: [
					{ id: 'time', attribute: dataSource.periodicity, items: [period] },
					{ id: 'location', attribute: 'entity', items: [siteId] },
					...v.partitions.map(p => ({
						id: p.id,
						attribute: 'element',
						items: p.elements.map(pe => pe.id)
					}))
				]
			}))
		});

		return { previous, current };
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

