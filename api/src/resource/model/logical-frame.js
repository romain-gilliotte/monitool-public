
const validator = require('is-my-json-valid');
const Model = require('./model');
const schema = require('../schema/logical-frame.json');

var validate = validator(schema);

const strings = Object.freeze({
	fr: Object.freeze({
		intervention_logic: "Logique d'intervention",
		indicators: "Indicateurs",
		verification_sources: "Sources de verification",
		assumptions: "Hypothèses",
		goal: "Objectif général",
		purpose: "Objectif spécifique",
		output: "Résultat",
		activity: "Activité"
	}),
	en: Object.freeze({
		intervention_logic: "Intervention logic",
		indicators: "Indicators",
		verification_sources: "Sources of verification",
		assumptions: "Assumptions",
		goal: "Goal",
		purpose: "Purpose",
		output: "Output",
		activity: "Activity"
	}),
	es: Object.freeze({
		intervention_logic: "Lógica de intervención",
		indicators: "Indicadores",
		verification_sources: "Fuentes de verificación",
		assumptions: "Hipótesis",
		goal: "Objetivo general",
		purpose: "Objetivo específico",
		output: "Resultado",
		activity: "Actividad"
	})
});


class LogicalFrame extends Model {

	static validate(data) {
		if (!data)
			throw new Error('missing_data');

		validate(data);
		var errors = validate.errors || [];
		if (errors.length) {
			var error = new Error('invalid_data');
			error.detail = errors;
			error.model = data;
			// throw error;
		}
	}

	constructor(data) {
		super(data, validate);
	}

	getPdfDocDefinition(pageOrientation, dataSources, language = 'en') {
		var doc = {};
		doc.pageSize = "A4";
		doc.pageOrientation = pageOrientation;

		doc.content = [
			{ text: this.name, style: 'header3' }
		];

		var table = {
			headersRows: 1,
			width: ['auto', 'auto', 'auto', 'auto'],
			body: [
				[
					{ text: strings[language].intervention_logic, style: "bold" },
					{ text: strings[language].indicators, style: "bold" },
					{ text: strings[language].verification_sources, style: "bold" },
					{ text: strings[language].assumptions, style: "bold" }
				]
			]
		};

		table.body.push([
			[
				{ text: strings[language].goal, style: "bold" },
				{ text: this.goal, style: 'normal' }
			],
			...this._computeIndicatorsSources(this.indicators, dataSources),
			""
		]);

		this.purposes.forEach(function (purpose, purposeIndex) {
			table.body.push([
				[
					{ text: strings[language].purpose + " " + (this.purposes.length > 1 ? " " + (purposeIndex + 1) : ""), style: "bold" },
					{ text: purpose.description, style: 'normal' }
				],
				...this._computeIndicatorsSources(purpose.indicators, dataSources),
				{ text: purpose.assumptions, style: 'normal' }
			]);
		}, this);

		this.purposes.forEach(function (purpose, purposeIndex) {
			purpose.outputs.forEach(function (output, outputIndex) {
				table.body.push([
					[
						{ text: strings[language].output + " " + (this.purposes.length > 1 ? " " + (purposeIndex + 1) + '.' : "") + (outputIndex + 1), style: "bold" },
						{ text: output.description, style: 'normal' }
					],
					...this._computeIndicatorsSources(output.indicators, dataSources),
					{ text: output.assumptions, style: 'normal' }
				]);
			}, this);
		}, this);

		this.purposes.forEach(function (purpose, purposeIndex) {
			purpose.outputs.forEach(function (output, outputIndex) {
				output.activities.forEach(function (activity, activityIndex) {

					table.body.push([
						[
							{ text: strings[language].activity + " " + (this.purposes.length > 1 ? " " + (purposeIndex + 1) + '.' : "") + (outputIndex + 1) + '.' + (activityIndex + 1), style: "bold" },
							{ text: activity.description, style: 'normal' }
						],
						...this._computeIndicatorsSources(activity.indicators, dataSources),
						" "
					]);
				}, this);
			}, this);
		}, this);


		doc.content.push({ table: table });
		return doc;
	}

	_computeIndicatorsSources(indicators, dataSources) {
		let myDataSources = dataSources.map(ds => Object.assign({}, ds));

		let index = 1;
		myDataSources.forEach(ds => {
			ds.elements = ds.elements.filter(variable => {
				return indicators.some(i => {
					return i.computation
						&& Object.values(i.computation.parameters).some(param => param.elementId === variable.id);
				});
			});

			ds.elements.forEach(variable => {
				variable.index = index++;
			});
		});

		myDataSources = myDataSources.filter(ds => ds.elements.length > 0);

		return [
			{
				ul: indicators.map(i => {
					let indexes;
					try {
						indexes = Object.values(i.computation.parameters).map(param => {
							return myDataSources
								.find(ds => ds.elements.some(variable => variable.id == param.elementId))
								.elements.find(variable => variable.id == param.elementId)
								.index;
						});

						indexes = [...new Set(indexes)].sort();

						if (indexes.length == 0)
							indexes = ['F']
					}
					catch (e) {
						indexes = ['?'];
					}

					return i.display + (indexes.length ? ' [' + indexes.join(', ') + ']' : '');
				}),
				style: 'normal'
			},
			{
				ul: myDataSources.map(ds => {
					return [
						ds.name,
						...ds.elements.map(variable => {
							return { text: variable.index + '. ' + variable.name, style: 'italic' }
						})
					]
				}),
				style: 'normal'
			}
		];
	}
}

module.exports = LogicalFrame;
