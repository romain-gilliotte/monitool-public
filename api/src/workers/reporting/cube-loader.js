const ObjectId = require('mongodb').ObjectID;
const { Cube, TimeDimension, GenericDimension } = require('olap-in-memory');
const TimeSlot = require('timeslot-dag');
const _ = require('lodash');

class CubeLoader {

    constructor(project) {
        this._project = project;
    }

    async loadCubeFromComputation(computation, measureId = 'main') {
        const cubes = await Promise.all(
            _.toPairs(computation.parameters)
                .map(async ([key, parameter]) => {
                    let cube = await this.loadCubeFromVariable(parameter.variableId, key);

                    [...computation.dice, ...parameter.dice].forEach(d => {
                        if (d.range) {
                            cube = cube.diceRange(d.id, d.attribute, d.range[0], d.range[1]);
                        }
                        else {
                            cube = cube.dice(d.id, d.attribute, d.items);
                        }
                    });

                    cube = cube.keepDimensions(computation.aggregate.map(d => d.id));
                    computation.aggregate.forEach(agg => {
                        cube = cube.drillUp(agg.id, agg.attribute);
                    })

                    return cube;
                })
        );


        const cube = cubes.reduce((m, c) => m.compose(c));
        cube.createComputedMeasure(measureId, computation.formula);
        return cube;
    }

    async loadCubeFromVariable(variableId, measureId = 'main') {
        const form = this._project.forms.find(f => f.elements.find(v => v.id === variableId));
        const variable = form.elements.find(v => v.id === variableId);

        // Time dimension
        const start = [this._project.start, form.start].filter(a => a).sort().pop();
        const end = [this._project.end, form.end, new Date().toISOString().substring(0, 10)].sort().shift();
        const time = new TimeDimension(
            form.periodicity,
            TimeSlot.fromDate(start, form.periodicity).value,
            TimeSlot.fromDate(end, form.periodicity).value
        );

        // location dimension
        const entity = new GenericDimension('location', 'entity', form.entities);
        this._project.groups.forEach(group => {
            dim.addChildAttribute(
                'entity',
                group.id,
                entityId => group.members.includes(entityId) ? 'in' : 'out'
            );
        });

        // partitions
        const partitions = variable.partitions.map(partition => {
            const dim = new GenericDimension(partition.id, 'element', partition.elements.map(e => e.id));

            partition.groups.forEach(group => {
                dim.addChildAttribute(
                    'element',
                    group.id,
                    elementId => group.members.includes(elementId) ? 'in' : 'out'
                );
            })

            return dim;
        });

        // aggregation rules.
        const aggregation = {};
        aggregation['location'] = variable.geoAgg;
        aggregation['time'] = variable.timeAgg;
        variable.partitions.forEach(partition => {
            aggregation[partition.id] = partition.aggregation;
        })


        const cube = new Cube([time, entity, ...partitions]);

        // Load data
        cube.createStoredMeasure(measureId, aggregation); // aggregation rules are missing.

        await database
            .collection('input')
            .find(
                { 'projectId': new ObjectId(this._project._id), 'content.variableId': variableId },
                {
                    projection: { 'content.$': true },
                    sort: [['_id', 1]] // most recent last, so that recent data overwrites old data.
                }
            )
            .forEach(input => {
                input.content.forEach(content => {
                    const inputCube = this.createCubeFromInputContent(content, measureId);
                    cube.hydrateFromCube(inputCube);
                })
            });

        return cube;
    }

    createCubeFromInputContent(inputContent, measureId = 'main') {
        const dimensions = inputContent.dimensions.map(dim => {
            if (dim.id === 'time') {
                return new TimeDimension(dim.attribute, dim.items[0], dim.items[dim.items.length - 1]);
            }
            else {
                return new GenericDimension(dim.id, dim.attribute, dim.items);
            }
        });

        const cube = new Cube(dimensions);
        cube.createStoredMeasure(measureId);
        cube.setFlatArray(measureId, inputContent.data);

        return cube;
    }
}


module.exports = CubeLoader;