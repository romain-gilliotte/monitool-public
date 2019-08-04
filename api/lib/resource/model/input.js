
import validator from 'is-my-json-valid';
import TimeSlot from 'timeslot-dag';
import Cube from '../../olap/cube';
import Dimension from '../../olap/dimension';
import schema from '../schema/input.json';
import InputStore from '../store/input';
import DbModel from './db-model';

var validate = validator(schema),
	storeInstance = new InputStore();


export default class Input extends DbModel {

	static get storeInstance() {
		return storeInstance;
	}

	/**
	 * Hydrate a Input object from a POJO.
	 * Raises exception if data is not formatted properly.
	 */
	constructor(data) {
		super(data, validate);

		// check that id decomposition matches what's in the rest of document.
		let isValid = this._id === ['input', this.project, this.form, this.entity, this.period].join(':');
		if (!isValid)
			throw new Error('invalid_id');

		// Check that timeslot is valid
		try { new TimeSlot(this.period); }
		catch (e) { throw new Error('invalid_period'); }
	}

	/**
	 * When a project changes, update the content of this input's values.
	 */
	update(newDsStructure) {
		var newValues = {};

		for (let variableId in newDsStructure) {
			const oldStructure = this.structure[variableId];
			const newStructure = newDsStructure[variableId];

			if (!oldStructure)
				newValues[variableId] = this._createBlankRecord(newStructure);

			else if (JSON.stringify(oldStructure) !== JSON.stringify(newStructure))
				newValues[variableId] = this._migrateRecord(oldStructure, newStructure, this.values[variableId]);

			else
				newValues[variableId] = this.values[variableId];
		}

		this.values = newValues;
	}

	_createBlankRecord(newStructure) {
		const newLength = newStructure.reduce((m, p) => m * p.items.length, 1);
		const newValues = new Array(newLength);
		newValues.fill(0);

		return newValues;
	}

	/**
	 * Compute the new value of an input variable according to the changes that were made
	 * in the partitions of a variable.
	 */
	_migrateRecord(oldStructure, newStructure, oldValues) {
		const newValuesLength = newStructure.reduce((m, p) => m * p.items.length, 1);
		const newValues = new Array(newValuesLength);

		const newStructureLength = newStructure.length;

		//////////////
		// Step 1: Start by adding zero until we have all elements of newStructure in the old one.
		//////////////

		// Search for new partitions.
		for (let i = 0; i < newStructureLength; ++i) {
			let newPartition = newStructure[i];

			// This partition already existed in the past, we can skip it.
			if (!oldStructure.find(p => p.id === newPartition.id)) {
				// Unshift the partition
				oldStructure.unshift(newPartition);

				// Put zeros in oldValues to have to good length.
				const oldLength = oldValues.length;
				oldValues.length = oldLength * newPartition.items.length;
				oldValues.fill(0, oldLength);
			}
		}

		//////////////
		// Step 2: We'll now fill a blank Array from the data in oldValues using a cube.
		//////////////

		// Create an olap cube from the old values.
		let dimensions = oldStructure.map(p => new Dimension(p.id, p.items, p.aggregation)),
			cube = new Cube(null, dimensions, [], oldValues);

		const textFilter = {};
		const intFilter = new Array(newStructureLength);
		for (let i = 0; i < newStructureLength; ++i) {
			intFilter[i] = 0;
			textFilter[newStructure[i].id] = [newStructure[i].items[0]];
		}

		let fieldIndex = 0;
		while (fieldIndex < newValues.length) {
			// Try to retrieve the value from the cube.
			newValues[fieldIndex] = cube.query([], textFilter) || 0;

			// Increment intFilter, textFilter and fieldIndex.
			for (let i = newStructureLength - 1; i >= 0; --i) {
				++intFilter[i];

				if (intFilter[i] == newStructure[i].items.length) {
					intFilter[i] = 0;
					textFilter[newStructure[i].id][0] = newStructure[i].items[0];
				}
				else {
					textFilter[newStructure[i].id][0] = newStructure[i].items[intFilter[i]];
					break;
				}
			}

			++fieldIndex;
		}

		return newValues;
	}

	async save(skipChecks) {
		this.updatedAt = new Date().toISOString();
		return super.save(skipChecks);
	}
}
