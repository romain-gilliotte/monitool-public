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

import axios from 'axios';

export default class Organisation {

	static async fetchAll() {
		const response = await axios.get('api/resources/organisation');
		return response.data.map(i => new Organisation(i));
	}

	static async get(id) {
		const response = await axios.get('api/resources/organisation/' + id);
		return new Organisation(response.data);
	}

	constructor(data=null) {
		this.type = "organisation";
		this.name = "";
		this.description = "";
		this.themes = [];
		this.users = {
			"admins": [],
			"explicitInvites": [],
			"autoInvites": []
		};

		if (data)
			Object.assign(this, data);
	}

	async save() {
		const payload = JSON.parse(angular.toJson(this));

		let response;
		if (this._id && this._rev)
			response = await axios.put('/api/resources/organisation/' + this._id, payload);
		else
			response = await axios.post('/api/resources/organisation', payload);

		Object.assign(this, response.data);
	}

	async delete() {
		return axios.delete('/api/resources/organisation/' + this._id);
	}
}

