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


import {Transform} from 'stream';

import Store from './store';
import Organisation from '../model/organisation';

export default class OrganisationStore extends Store {

	get modelString() {
		return 'organisation';
	}

	get modelClass() {
		return Organisation;
	}

	/**
	 * Just scan all organisations and filter manually.
	 * We can't do that on a view because of the auto invites and we don't expect the number
	 * of organisation to be large enougth to make this an issue.
	 */
	listForUser(user) {
		return [
			...this.list(),
			new Transform({
				objectMode: true,
				transform(organisation, _, callback) {
					const isInvited = organisation.users.admins.includes(user.email)
						|| organisation.users.explicitInvites.includes(user.email)
						|| organisation.users.autoInvites.some(re => new RegExp(re).test(user.email));

					if (isInvited)
						this.push(organisation);

					callback();
				}
			})
		];
	}
}
