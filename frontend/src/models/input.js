import angular from 'angular';
import axios from 'axios';

export default class Input {
    static async fetchFormShortStatus(project, dataSourceId, siteIds = null) {
        const dataSource = project.forms.find(ds => ds.id == dataSourceId);
        const dsResult = Object.values(
            await this.fetchFormStatus(project, dataSource.id, siteIds)
        ).reduce((m, e) => [...m, ...Object.values(e)], []);

        return {
            missing: dsResult.length ? dsResult.filter(v => v === 0).length / dsResult.length : 0,
            incomplete: dsResult.length
                ? dsResult.filter(v => v !== 0 && v < 1).length / dsResult.length
                : 0,
            complete: dsResult.length ? dsResult.filter(v => v === 1).length / dsResult.length : 1,
            total: dsResult.length,
        };
    }

    /** fixme The computed percentage is no precise enough: it is by variable, we need by cell */
    static async fetchFormStatus(project, dataSourceId, siteIds = null) {
        const dataSource = project.forms.find(ds => ds.id === dataSourceId);
        const variables = dataSource.elements.filter(variable => variable.active);

        const sum = variables.map((v, i) => `not isNaN(variable_${i})`).join('+');
        const formula = `(${sum})/${variables.length}`;
        const query = {
            renderer: 'json',
            formula: formula,
            parameters: {},
            dice: [
                {
                    id: 'time',
                    attribute: 'day',
                    range: [null, new Date().toISOString().substring(0, 10)],
                },
                {
                    id: 'location',
                    attribute: 'entity',
                    items: project.entities
                        .filter(s => s.active && (siteIds === null || siteIds.includes(s.id)))
                        .map(s => s.id),
                },
            ],
            aggregate: [
                { id: 'time', attribute: dataSource.periodicity },
                { id: 'location', attribute: 'entity' },
            ],
        };

        variables.forEach((variable, index) => {
            query.parameters['variable_' + index] = {
                variableId: variable.id,
                dice: variable.partitions.map(partition => ({
                    id: partition.id,
                    attribute: 'element',
                    items: partition.elements.filter(e => e.active).map(e => e.id),
                })),
            };
        });

        const b64Query = btoa(JSON.stringify(query))
            .replace('+', '-')
            .replace('/', '_')
            .replace(/=+$/g, '');
        const response = await axios.get(`/project/${project._id}/report/${b64Query}`);
        const result = response.data;

        const sortedResult = {};
        Object.keys(result)
            .sort()
            .reverse()
            .forEach(p => (sortedResult[p] = result[p]));

        return sortedResult;
    }

    /** Fetch specific data entry by calling the reporting service. */
    static async fetchInput(project, siteId, dataSourceId, period) {
        const dataSource = project.forms.find(ds => ds.id === dataSourceId);
        const variables = dataSource.elements.filter(variable => variable.active);

        return new Input({
            projectId: project._id,
            content: await Promise.all(
                variables.map(async variable => {
                    const activePartitions = variable.partitions.filter(p => p.active);
                    const dimensions = [
                        {
                            id: 'time',
                            attribute: dataSource.periodicity,
                            items: [period],
                        },
                        {
                            id: 'location',
                            attribute: 'entity',
                            items: [siteId],
                        },
                        ...activePartitions.map(p => ({
                            id: p.id,
                            attribute: 'element',
                            items: p.elements.filter(pe => pe.active).map(pe => pe.id),
                        })),
                    ];

                    // Query server
                    const query = {
                        renderer: 'json',
                        rendererOpts: 'flatArray',
                        formula: 'cst',
                        parameters: {
                            cst: { variableId: variable.id, dice: [] },
                        },
                        dice: dimensions,
                        aggregate: activePartitions.map(p => ({
                            id: p.id,
                            attribute: 'element',
                        })),
                    };
                    const b64Query = btoa(JSON.stringify(query))
                        .replace('+', '-')
                        .replace('/', '_')
                        .replace(/=+$/g, '');
                    const response = await axios.get(`/project/${project._id}/report/${b64Query}`);

                    // Check that query result have the expected format.
                    // If not, it means that we're making a query outside of the bounds of the project,
                    // in that case, we can just return empty data, it should happen only when filling the first
                    // data entry (because we're trying to load the previous one as well for "fill with previous data" action).
                    const expectedLength = dimensions.reduce((m, dim) => m * dim.items.length, 1);
                    const data = response.data;
                    if (data.length !== expectedLength) {
                        data.length = expectedLength;
                        result.fill(null);
                    }

                    return {
                        variableId: variable.id,
                        data: data,
                        dimensions: dimensions,
                    };
                })
            ),
        });
    }

    constructor(data = null) {
        Object.assign(this, data);
    }

    async save() {
        const data = JSON.parse(angular.toJson(this));
        delete data.projectId;

        let response;
        if (this._id) {
            response = await axios.put(`/project/${this.projectId}/input/${this._id}`, data);
        } else {
            response = await axios.post(`/project/${this.projectId}/input`, data);
        }

        Object.assign(this, response.data);
    }
}
