import { TimeDimension, GenericDimension } from 'olap-in-memory';

/**
 * Take an indicator definition and build a reporting server query
 */
export function buildQueryFromIndicator(
    indicator,
    logicalFramework = null,
    project = null,
    baseAggregate = [],
    baseDice = []
) {
    if (!indicator.computation) {
        return null;
    }

    // Compute parameters from indicator definition
    const parameters = {};
    for (let key in indicator.computation.parameters) {
        const parameter = indicator.computation.parameters[key];

        parameters[key] = { variableId: parameter.elementId, dice: [] };

        for (let partitionId in parameter.filter) {
            parameters[key].dice.push({
                id: partitionId,
                attribute: 'element',
                items: parameter.filter[partitionId],
            });
        }
    }

    // Add extra dices provided by the logical framework.
    const dice = baseDice.slice();

    if (logicalFramework) {
        dice.push({
            id: 'location',
            attribute: 'entity',
            items: logicalFramework.entities,
        });

        if (logicalFramework.start || logicalFramework.end)
            dice.push({
                id: 'time',
                attribute: 'day',
                range: [logicalFramework.start, logicalFramework.end],
            });
    }

    return {
        formula: indicator.computation.formula,
        parameters: parameters,
        aggregate: baseAggregate,
        dice,
    };
}

/**
 * Take a variable definition and build a reporting server query.
 */
export function buildQueryFromVariable(
    variable,
    dataSource = null,
    project = null,
    baseAggregate = [],
    baseDice = []
) {
    const dice = [];

    if (dataSource)
        dice.push({
            id: 'location',
            attribute: 'entity',
            items: dataSource.entities,
        });

    return {
        formula: 'variable',
        parameters: { variable: { variableId: variable.id, dice: [] } },
        aggregate: baseAggregate,
        dice: [...baseDice, ...dice],
    };
}

/**
 * For a given query, tell us the dimensions which can be used.
 *
 * This helps to format the response, but also know in advance which subQueries can be
 * built (either by adding things in the .aggregate or .dice fields).
 */
export function getQueryDimensions(project, query, strictTime = true, keepAggregate = true) {
    const varDimsGroups = Object.values(query.parameters).map(param => {
        const variableId = param.variableId;
        const dices = [...query.dice, ...param.dice];

        return (
            getVariableDimensions(project, variableId, dices, strictTime)
                // If filtered in the formula, we don't want to manipulate it.
                .filter(dim => !param.dice.find(dice => dice.id == dim.id))
                // Do not allow manipulating the dimension used in the aggregate.
                .filter(dim => keepAggregate || !query.aggregate.find(agg => agg.id === dim.id))
        );
    });

    if (varDimsGroups.length == 0) return [];
    else if (varDimsGroups.length == 1) return varDimsGroups[0];
    else
        return varDimsGroups.reduce((dimensions1, dimensions2) => {
            return dimensions1.reduce((m, dim1) => {
                const dim2 = dimensions2.find(dim2 => dim2.id == dim1.id);
                return dim2 ? [...m, dim1.union(dim2)] : m;
            }, []);
        });
}

/**
 * For a given variable, tell us the expected dimensions that the reporting server will return.
 */
function getVariableDimensions(project, variableId, dices = [], strictTime = true) {
    const dataSource = project.forms.find(f => f.elements.find(v => v.id === variableId));
    const variable = dataSource.elements.find(v => v.id === variableId);

    return [
        getTimeDimension(dataSource, project, strictTime, dices),
        getLocationDimension(dataSource, project, dices),
        ...variable.partitions.map(partition => getPartitionDimension(partition, dices)),
    ];
}

function getTimeDimension(dataSource, project, strict = true, dices = []) {
    const periodicity = strict ? dataSource.periodicity : 'day';
    const dimension = new TimeDimension(
        'time',
        periodicity,
        project.start,
        project.end,
        `project.dimensions.time`
    );

    return diceDimension(dimension, dices);
}

function getLocationDimension(dataSource, project, dices = []) {
    const dimension = new GenericDimension(
        'location',
        'entity',
        project.entities.filter(site => dataSource.entities.includes(site.id)).map(site => site.id),
        `project.dimensions.entity`,
        siteId => project.entities.find(s => s.id == siteId).name
    );

    project.groups.forEach(group => {
        dimension.addAttribute(
            'entity',
            group.id,
            siteId => (group.members.includes(siteId) ? 'in' : 'out'),
            item => `${item == 'in' ? '∈' : '∉'} ${group.name}`
        );
    });

    return diceDimension(dimension, dices);
}

function getPartitionDimension(partition, dices = []) {
    const dimension = new GenericDimension(
        partition.id,
        'element',
        partition.elements.map(e => e.id),
        partition.name,
        elementId => partition.elements.find(el => el.id == elementId).name
    );

    partition.groups.forEach(group => {
        dimension.addAttribute(
            'element',
            group.id,
            elementId => (group.members.includes(elementId) ? 'in' : 'out'),
            item => `${item == 'in' ? '∈' : '∉'} ${group.name}`
        );
    });

    return diceDimension(dimension, dices);
}

function diceDimension(dimension, dices = []) {
    let dicedDimension = dimension;

    dices.forEach(dice => {
        if (dice.id === dimension.id) {
            if (dice.range)
                dicedDimension = dicedDimension.diceRange(
                    dice.attribute,
                    dice.range[0],
                    dice.range[1]
                );
            else if (dice.items) dicedDimension = dicedDimension.dice(dice.attribute, dice.items);
            else throw new Error('unexpected dice');
        }
    });

    return dicedDimension;
}
