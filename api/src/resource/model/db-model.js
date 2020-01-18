const Model = require('./model');
const database = require('../database');
const uuidv4 = require('uuid/v4');

class DbModel extends Model {

	get _db() {
		return database;
	}

	/**
	 * Delete the model from the database.
	 * No checks are performed to ensure that database integrity is not lost!
	 */
	async destroy() {
		return this._db.destroy(this._id, this._rev);
	}

	/**
	 * Validate that all foreign keys in this model are valid in current database.
	 * Child classes must override this method when relevant.
	 */
	async validateForeignKeys() {
	}

	/**
	 * Save model in database after checking that foreign keys are valid.
	 */
	async save(skipChecks) {
		if (!skipChecks)
			await this.validateForeignKeys();

		if (!this._id)
			this._id = this.storeInstance.type + ':' + uuidv4();

		return this._db.insert(this);
	}

}

module.exports = DbModel;