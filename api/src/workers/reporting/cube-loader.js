const { Binary, ObjectId } = require('mongodb');
const { Cube, TimeDimension, GenericDimension } = require('olap-in-memory');
const hash = require('object-hash');
const TimeSlot = require('timeslot-dag');
const _ = require('lodash');

class CubeLoader {

    async getIndicatorCube(projectId, formula, parameters) {
        const documentId = `${projectId}:${hash({ formula, parameters })}`;
        const document = await database.collection('cube').findOne({ '_id': documentId });

        let cube;
        if (document) {
            cube = Cube.deserialize(document.cube.buffer);
        }
        else {
            cube = await this._generateIndicatorCube(projectId, formula, parameters);
            await database.collection('cube').insertOne({
                _id: documentId,
                projectId: new ObjectId(projectId),
                cube: new Binary(Buffer.from(cube.serialize()))
            });
        }

        return cube;
    }

    /** Generate an indicator cube from scratch */
    async _generateIndicatorCube(projectId, formula, parameters) {
        const cubes = await Promise.all(_.toPairs(parameters).map(async ([paramName, parameter]) => {
            let cube = await this.getVariableCube(projectId, parameter.variableId);
            cube = cube.renameMeasure('main', paramName)

            parameter.dice.forEach(d => {
                // This happens only for partitions, so we should not have calls to 'diceRange'
                if (d.range)
                    cube = cube.diceRange(d.id, d.attribute, d.range[0], d.range[1]);
                else
                    cube = cube.dice(d.id, d.attribute, d.items);

                // Dimensions which are used to dice in parameters should not be manipulated after that
                // in the global dice / aggregation of the query.
                cube = cube.removeDimension(d.id);
            });

            return cube;
        }));

        const cube = cubes.reduce((m, c) => m.compose(c));
        cube.createComputedMeasure('main', formula);
        return cube;
    }

    /**
     * Load complete cube for a given variable from the database
     * and cache it for next calls.
     */
    async getVariableCube(projectId, variableId) {
        const documentId = `${projectId}:${variableId}`;
        const document = await database.collection('cube').findOne({ '_id': documentId });

        let cube;
        if (document) {
            cube = Cube.deserialize(document.cube.buffer);
        }
        else {
            cube = await this._generateVariableCube(projectId, variableId);

            await database.collection('cube').insertOne({
                _id: documentId,
                projectId: new ObjectId(projectId),
                cube: new Binary(Buffer.from(cube.serialize()))
            });
        }

        return cube;
    }

    /** Generate a variable cube from scratch */
    async _generateVariableCube(projectId, variableId) {
        const project = await this._loadProject(projectId);
        const form = project.forms.find(f => f.elements.find(v => v.id === variableId));
        const variable = form.elements.find(v => v.id === variableId);

        const dimensions = this._createVariableDimensions(project, form, variable);
        const aggregation = this._createVariableAggregation(variable);

        const cube = new Cube(dimensions);
        cube.createStoredMeasure('main', aggregation);

        await database.collection('input')
            .find(
                { 'projectId': new ObjectId(project._id), 'content.variableId': variable.id },
                {
                    projection: { 'content.$': true },
                    sort: [['_id', 1]] // most recent last, so that recent data overwrites old data.
                }
            )
            .forEach(input => {
                input.content.forEach(content => {
                    // FIXME
                    const dimensions = content.dimensions.map(dim => {
                        if (dim.id === 'time') {
                            return new TimeDimension('time', dim.attribute, dim.items[0], dim.items[dim.items.length - 1]);
                        }
                        else {
                            return new GenericDimension(dim.id, dim.attribute, dim.items);
                        }
                    });

                    const inputCube = new Cube(dimensions);
                    inputCube.createStoredMeasure('main');
                    inputCube.setFlatArray('main', content.data);

                    cube.hydrateFromCube(inputCube);
                })
            });

        return cube;
    }

    async _loadProject(projectId) {
        return database.collection('project').findOne(
            { _id: new ObjectId(projectId) },
            {
                projection: {
                    'start': true,
                    'end': true,
                    'entities.id': true,
                    'groups.id': true,
                    'groups.members': true,
                    'forms.start': true,
                    'forms.end': true,
                    'forms.entities': true,
                    'forms.periodicity': true,
                    'forms.elements.id': true,
                    'forms.elements.timeAgg': true,
                    'forms.elements.geoAgg': true,
                    'forms.elements.partitions.id': true,
                    'forms.elements.partitions.aggregation': true,
                    'forms.elements.partitions.elements.id': true,
                    'forms.elements.partitions.groups.id': true,
                    'forms.elements.partitions.groups.members': true,
                }
            }
        );
    }

    /** Create Cube dimensions for a given variable. This is needed to build a cube */
    _createVariableDimensions(project, form, variable) {
        // Time dimension
        const start = [project.start, form.start].filter(a => a).sort().pop();
        const end = [project.end, form.end].sort().shift();
        const time = new TimeDimension(
            'time',
            form.periodicity,
            TimeSlot.fromDate(start, form.periodicity).value,
            TimeSlot.fromDate(end, form.periodicity).value
        );

        // location dimension
        const entity = new GenericDimension('location', 'entity', form.entities);
        project.groups.forEach(group => {
            entity.addChildAttribute(
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

        return [time, entity, ...partitions];
    }

    /** Create aggregation rules for a given variable. This is needed to build a cube */
    _createVariableAggregation(variable) {
        const aggregation = {};
        aggregation.location = variable.geoAgg;
        aggregation.time = variable.timeAgg;
        variable.partitions.forEach(partition => {
            aggregation[partition.id] = partition.aggregation;
        });

        return aggregation
    }
}


module.exports = CubeLoader;