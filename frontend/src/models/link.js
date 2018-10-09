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

export default class Link {

	static async fetchAll() {
		const response = await axios.get('/api/resources/link');
		return response.data.map(i => new Link(i));
	}


	static async fetchForOrganisation(organisationId) {
		const response = await axios.get('/api/resources/link?organisationId=' + organisationId);
		return response.data.map(i => new Link(i));
	}

	static async get(organisationId, projectId) {
		const response = await axios.get(
			'api/resources/link/' +
			'link:' +
			organisationId.slice(13) +
			':' +
			projectId.slice(8)
		);

		return new Link(response.data);
	}

	constructor(data=null) {
		this.thematics = {};

		if (data)
			Object.assign(this, data);
	}

	sanitize(organisation) {
		const thematics = this.thematics;
		this.thematics = {};
		organisation.thematics.forEach(thematic => {

			if (thematics[thematic.id]) {
				let numIndicators = 0;

				this.thematics[thematic.id] = {};

				thematic.indicators.forEach(indicator => {
					if (thematics[thematic.id][indicator.id]) {
						this.thematics[thematic.id][indicator.id] = thematics[thematic.id][indicator.id];
						numIndicators++;
					}
				});

				if (!numIndicators)
					delete this.thematics[thematic.id];
			}
		})
	}

	async save() {
		const payload = JSON.parse(angular.toJson(this));

		let response = await axios.put('/api/resources/link/' + this._id, payload);

		Object.assign(this, response.data);
	}

	async delete() {
		return axios.delete('/api/resources/link/' + this._id);
	}
}

