import JSONStream from 'JSONStream';
import {Transform} from 'stream';
import database from '../database';

/**
 * Represents a collection of models.
 *
 * This is an abstract from which all stores inherit.
 */
export default class Store {

	get _db() {
		return database;
	}

	/**
	 * Get the name of this store.
	 *
	 * @type {Function}
	 */
	get modelClass() {
		throw new Error('modelClass must be overriden');
	}

	/**
	 * Get the name of this store
	 *
	 * @abstract
	 * @type {string}
	 */
	get modelString() {
		throw new Error('modelString must be overriden');
	}

	/**
	 * Retrieve all models of current type.
	 *
	 * @return {Array.<Model>}
	 */
	list() {
		const ModelClass = this.modelClass;

		return [
			this._db.bucket.listAsStream({
				include_docs: true,
				startkey: this.modelString + ":!",
				endkey: this.modelString + ":~"
			}),
			JSONStream.parse(['rows', true, 'doc']),
			new Transform({
				objectMode: true,
				transform(chunk, encoding, callback) {
					try {

					this.push(new ModelClass(chunk));
					}
					catch (e) {
						console.log(e)
					}
					callback();
				}
			})
		];
	}

	/**
	 * Retrieve a given model
	 *
	 * @return {Model}
	 */
	async get(id) {
		return new this.modelClass(await this._db.get(id))
	}
}
