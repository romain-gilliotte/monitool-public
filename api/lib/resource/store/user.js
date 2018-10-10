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

import Store from './store';
import User from '../model/user';

import {Transform} from 'stream';

export default class UserStore extends Store {

	get modelString() {
		return 'user';
	}

	get modelClass() {
		return User;
	}

	async listForOrganisation(organisationId) {
		// Need to return all users that are part of a given organisation.
		// Exclude users that have accepted an invitation, but are no longer invited...

		const that = this;

		return [
			...this.list(),
			new Transform({
				objectMode: true,
				transform(user, _, callback) {
					if (!this._organisation)
						this._organisation = that._db.bucket.get(organisationId);;

					this._organisation.then(organisation => {
						const isInvited = organisation.invitations.some(i => new RegExp(i.pattern).test(user.email))
						if (isInvited)
							this.push(user);

						callback();
					})
				}
			})
		]
	}
}
