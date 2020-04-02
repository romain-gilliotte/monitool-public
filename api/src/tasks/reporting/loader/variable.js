const { ObjectId } = require('mongodb');
const { Cube, TimeDimension, GenericDimension } = require('olap-in-memory');

const PROJECT_PROJECTION = {
    'start': true,
    'end': true,
    'entities.id': true,
    'groups.id': true,
    'groups.members': true,
    'forms.start': true,
    'forms.end': true,
    'forms.entities': true,
    'forms.periodicity': true,
    // FIXME this projection is overfetching, we need only access to a single variable
    'forms.elements.id': true,
    'forms.elements.timeAgg': true,
    'forms.elements.geoAgg': true,
    'forms.elements.partitions.id': true,
    'forms.elements.partitions.aggregation': true,
    'forms.elements.partitions.elements.id': true,
    'forms.elements.partitions.groups.id': true,
    'forms.elements.partitions.groups.members': true,
};

/**
 * Build a variable cube from data entries
 * 
 * @param {string} projectId 
 * @param {string} variableId 
 */
async function getVariableCube(projectId, variableId, aggregate, dice) {
    const project = await database.collection('project').findOne(
        { _id: new ObjectId(projectId) },
        { projection: PROJECT_PROJECTION }
    );

    // Deplacer vers build dimensions.
    const form = project.forms.find(f => f.elements.find(v => v.id === variableId));
    const variable = form.elements.find(v => v.id === variableId);
    const rules = createVariableRules(variable);
    const varDims = createVariableDimensions(project, form, variable, 'day').filter(dimension =>
        // keep only dimension which are NEEDED FOR THE QUERY
        [...aggregate, ...dice].find(e => e.id === dimension.id)
    );

    const cubeDims = varDims.slice();
    dice.forEach(dice => {
        const dimIndex = cubeDims.findIndex(dim => dim.id === dice.id);
        if (dice.range)
            cubeDims[dimIndex] = cubeDims[dimIndex].diceRange(dice.attribute, dice.range[0], dice.range[1]);
        else
            cubeDims[dimIndex] = cubeDims[dimIndex].dice(dice.attribute, dice.items);
    });

    // On fait deux cubes avec les memes dimensions.
    // - cubeDetailed: avec la plus grande finesse possible (day, entity, les elements des partitions...)
    // - cubeOverview: avec la finesse demandée
    let detailedCube = new Cube(cubeDims);
    detailedCube.createStoredMeasure('main', rules);

    let overviewCube = new Cube(cubeDims);
    aggregate.forEach(agg => void (overviewCube = overviewCube.drillUp(agg.id, agg.attribute)));
    overviewCube.createStoredMeasure('main', rules);

    // Load inputs in reverse chronological order.
    await database.collection('input')
        .find(
            { 'projectId': new ObjectId(project._id), 'content.variableId': variable.id },
            { projection: { 'content.$': true }, sort: [['_id', 1]] }
        )
        .forEach(input => void input.content.forEach(content => {
            const inputDimensions = createInputDimensions(content);
            const neededDims = createVariableDimensions(project, form, variable, content.dimensions[0].attribute) // pas beau
                .filter(dimension => {
                    // keep only dimension which are NEEDED FOR THE QUERY
                    return [...aggregate, ...dice].find(e => e.id === dimension.id)
                });

            let inputCube = new Cube(inputDimensions);
            inputCube.createStoredMeasure('main', {}); // fixme: aggregation rules are missing
            inputCube.setData('main', content.data);
            inputCube = inputCube.reshape(neededDims);

            // on doit reshape ce cube en suivant les regles suivantes:
            // - On garde la meme periodicité ce celle qui venait
            // - On rajoute les dimensions manquantes JUSTE AVEC LES DONNÉES du projet.
            // (SANS PRENDRE EN COMPTE ce qu'on a fait sur nos deux cubes, ca sera fait après).

            overviewCube.hydrateFromCube(inputCube);
            detailedCube.hydrateFromCube(inputCube);
        }));

    // Remove dimensions which were only there to allow dicing.
    overviewCube = overviewCube.project(aggregate.map(agg => agg.id));
    detailedCube = detailedCube.project(aggregate.map(agg => agg.id));

    // Now that both cubes are filled, we can drill up cubeDetailed one so that both have the same shape.
    aggregate.forEach(agg => {
        detailedCube = detailedCube.drillUp(agg.id, agg.attribute)
    });

    // Steal the status vector from the overviewCube.
    detailedCube.storedMeasures['main']._status = overviewCube.storedMeasures['main']._status;
    return detailedCube;
}

function createInputDimensions(content) {
    return content.dimensions.map(dim => {
        if (dim.id === 'time')
            return new TimeDimension('time', dim.attribute, dim.items[0], dim.items[dim.items.length - 1]);
        else
            return new GenericDimension(dim.id, dim.attribute, dim.items);
    });
}


/** Create Cube dimensions for a given variable. This is needed to build a cube */
function createVariableDimensions(project, form, variable, periodicity = null) {
    // Time dimension
    const start = [project.start, form.start].filter(a => a).sort().pop();
    const end = [project.end, form.end].sort().shift();
    const time = new TimeDimension('time', periodicity || form.periodicity, start, end);

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
function createVariableRules(variable) {
    const aggregation = {};
    aggregation.location = variable.geoAgg;
    aggregation.time = variable.timeAgg;
    variable.partitions.forEach(partition => {
        aggregation[partition.id] = partition.aggregation;
    });

    return aggregation
}

module.exports = { getVariableCube };
