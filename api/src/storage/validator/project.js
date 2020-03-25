const Ajv = require('ajv');

const schema = require('../schema/project.json');
schema.properties.forms.items = require('../schema/data-source.json');
schema.properties.logicalFrames.items = require('../schema/logical-framework.json');
schema.definitions = require('../schema/shared.json');

const schemaValidate = new Ajv().compile(schema);

function isUnique(arr) {
	return arr.every((v, i, a) => a.indexOf(v) === i);
}

function hasUniqueId(arr) {
	return isUnique(arr.map(e => e.id));
}

function validate(project) {
	// If schema validation does not pass, do not go futher
	if (!schemaValidate(project)) {
		return schemaValidate.errors.map(error => {
			let path = error.dataPath;
			if (error.keyword === 'additionalProperties')
				path = error.params.additionalProperty;

			return { path: path, code: error.keyword, message: error.message };
		});
	}

	const errors = [];

	const variables = project.forms.reduce((m, f) => [...m, ...f.elements], []);
	const partitions = variables.reduce((m, v) => [...m, ...v.partitions], []);
	const pElements = partitions.reduce((m, p) => [...m, ...p.elements], []);
	const isValid =
		// Validate uniqueness
		hasUniqueId(project.entities)
		&& hasUniqueId(project.groups)
		&& hasUniqueId(project.forms)
		&& hasUniqueId(project.logicalFrames)
		&& hasUniqueId(variables)
		&& hasUniqueId(partitions)
		&& hasUniqueId(pElements)

		// Validate against dead references: sites
		&& project.groups.every(g => g.members.every(siteId => project.entities.find(s => s.id === siteId)))
		&& project.forms.every(f => f.entities.every(siteId => project.entities.find(s => s.id === siteId)))
		&& project.users.every(u => !u.entities || u.entities.every(siteId => project.entities.find(s => s.id === siteId)))

		// Validate against dead references: data sources
		&& project.users.every(u => !u.forms || u.forms.every(formId => project.forms.find(f => f.id === formId)));

	if (!isValid)
		errors.push({ code: 'references', message: 'no dead references' });

	// Check indicators
	const indicators = [
		...project.extraIndicators,
		...project.logicalFrames.reduce((m, lf) => [
			...m,
			...lf.indicators,
			...lf.purposes.reduce((m, p) => [
				...m,
				...p.indicators,
				...p.outputs.reduce((m, o) => [
					...m,
					...o.indicators,
					...o.activities.reduce((m, a) => [...m, a.indicators])
				], [])
			], [])
		], [])
	];

	indicators.forEach(indicator => {
		if (indicator.computation) {
			for (let paramName in indicator.computation.parameters) {
				// Check param usage
				if (!indicator.computation.formula.includes(paramName))
					errors.push({ code: 'unused param', message: 'all parameters must be used' });

				// Check param is computable
				const parameter = indicator.computation.parameters[paramName];
				const variable = variables.find(v => v.id === parameter.elementId);
				if (variable) {
					for (let partitionId in parameter.filters) {
						const filter = parameter.filters[partitionId];
						const partition = variable.partitons.find(p => p.id === partitionId);
						if (partition) {
							if (!filter.every(peId => partition.elements.find(pe => pe.id == peId)))
								errors.push({ code: 'references', message: 'dead reference from indicator to pelement' });
						}
						else
							errors.push({ code: 'references', message: 'dead reference from indicator to partition' });
					}
				}
				else
					errors.push({ code: 'references', message: 'dead reference from indicator to variable' });
			}
		}
	});

	return errors;
}

module.exports = validate;