const TimeSlot = require('timeslot-dag');
const validator = require('is-my-json-valid');
const Variable = require('./variable');
const Model = require('./model');
const schema = require('../schema/data-source.json');

const validate = validator(schema);

const strings = Object.freeze({
	fr: Object.freeze({
		collection_site: "Lieu de collecte",
		covered_period: "Période couverte",
		collected_by: "Saisie par"
	}),
	en: Object.freeze({
		collection_site: "Collection site",
		covered_period: "Covered period",
		collected_by: "Collected by"
	}),
	es: Object.freeze({
		collection_site: "Lugar de colecta",
		covered_period: "Periodo",
		collected_by: "Rellenado por"
	})
});

class DataSource extends Model {

	constructor(data, project) {
		super(data, validate);

		let entityIds = project.entities.map(e => e.id);

		data.entities.forEach(function (entityId) {
			if (entityIds.indexOf(entityId) === -1)
				throw new Error('invalid_data');
		});

		this.elements = this.elements.map(el => new Variable(el));
	}

	get structure() {
		let s = {};
		this.elements.forEach(element => s[element.id] = element.structure);
		return s;
	}

	isValidSlot(slot) {
		const timeSlot = new TimeSlot(slot);

		if (this.periodicity === 'free' && timeSlot.periodicity !== 'day')
			return false;

		if (this.periodicity !== 'free' && timeSlot.periodicity !== this.periodicity)
			return false;

		return true;
	}

	/**
	 * Retrieve a variable by id
	 */
	getVariableById(id) {
		return this.elements.find(el => el.id === id);
	}

	getPdfDocDefinition(pageOrientation, language = 'en') {
		var doc = {};
		doc.pageSize = "A4";
		doc.pageOrientation = pageOrientation;

		doc.content = [
			{ text: this.name, style: 'header' },
			{
				columns: [
					[
						{ style: "variableName", text: strings[language].collection_site },
						{
							table: { headerRows: 0, widths: ['*'], body: [[{ style: "normal", text: ' ' }]] },
							margin: [0, 0, 10, 0]
						}
					],
					[
						{ style: "variableName", text: strings[language].covered_period },
						{
							table: { headerRows: 0, widths: ['*'], body: [[{ style: "normal", text: ' ' }]] },
							margin: [0, 0, 10, 0]
						},
					],
					[
						{ style: "variableName", text: strings[language].collected_by },
						{
							table: { headerRows: 0, widths: ['*'], body: [[{ style: "normal", text: ' ' }]] },
							margin: [0, 0, 0, 0]
						}
					]
				]
			}
		].concat(this.elements.map(el => el.getPdfDocDefinition()));

		return doc;
	}

}

module.exports = DataSource;