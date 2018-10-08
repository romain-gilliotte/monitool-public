/*!
 * This file is part of Monitool.
 *
 * Monitool is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Monitool is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Monitool. If not, see <http://www.gnu.org/licenses/>.
 */

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
