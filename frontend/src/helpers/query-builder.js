

export function buildQueryFromIndicator(indicator, logicalFramework = null, project = null, baseAggregate = [], baseDice = []) {
    if (!indicator.computation) {
        return null;
    }

    // Compute parameters from indicator definition
    const parameters = {}
    for (let key in indicator.computation.parameters) {
        const parameter = indicator.computation.parameters[key];

        parameters[key] = { variableId: parameter.elementId, dice: [] };

        for (let partitionId in parameter.filter) {
            parameters[key].dice.push({
                id: partitionId,
                attribute: 'element',
                items: parameter.filter[partitionId]
            });
        }
    }

    // Add extra dices provided by the logical framework.
    const dice = baseDice.slice();

    if (project) {
        dice.push({ id: 'time', attribute: 'day', range: [project.start, project.end] });
    }

    if (logicalFramework) {
        dice.push({ id: 'location', attribute: 'entity', items: logicalFramework.entities });
        if (logicalFramework.start)
            dice.push({ id: 'time', attribute: 'day', range: [logicalFramework.start, null] });
        if (logicalFramework.end)
            dice.push({ id: 'time', attribute: 'day', range: [null, logicalFramework.end] });
    }

    return {
        formula: indicator.computation.formula,
        parameters: parameters,
        aggregate: baseAggregate,
        dice
    }
}

export function buildQueryFromVariable(variable, dataSource = null, project = null, baseAggregate = [], baseDice = []) {
    const dice = baseDice.slice();

    if (project) {
        dice.push({ id: 'time', attribute: 'day', range: [project.start, project.end] });
    }

    if (dataSource) {
        dice.push({ id: 'location', attribute: 'entity', items: dataSource.entities });
    }

    return {
        formula: 'variable',
        parameters: { variable: { variableId: variable.id, dice: [] } },
        aggregate: baseAggregate,
        dice
    };
}
