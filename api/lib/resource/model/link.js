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

import validator from 'is-my-json-valid';
import DbModel from './db-model';
import LinkStore from '../store/link';
import schema from '../schema/link.json';

var validate = validator(schema),
	storeInstance = new LinkStore();

export default class Link extends DbModel {

	static get storeInstance() {
		return storeInstance;
	}

	constructor(data) {
		super(data, validate);
	}

}
