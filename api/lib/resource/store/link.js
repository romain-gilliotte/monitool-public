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
import JSONStream from 'JSONStream';

import Store from './store';
import Link from '../model/link';

export default class LinkStore extends Store {

	get modelString() {
		return 'link';
	}

	get modelClass() {
		return Link;
	}

	listForUser(user) {
		throw new Error('Implement me.');
	}

	listForUserOrganisation(user, organisationId) {
		if (!user.organisations.accepted.includes(organisationId)) {
			const emptyStream = new Readable({objectMode: true});
			emptyStream.push(null);
			return [emptyStream];
		}
		else
			return [
				this._db.bucket.listAsStream({
					startkey: 'link:' + organisationId.slice(13) + ':!',
					endkey: 'link:' + organisationId.slice(13) + ':~',
					include_docs: true
				}),
				JSONStream.parse(['rows', true, 'doc'])
			];
	}

	/**
	 * Just scan all links and filter manually.
	 * We can't do that on a view because of the auto invites and we don't expect the number
	 * of link to be large enougth to make this an issue.
	 */
	listForUserProject(user, projectId) {
		const projectUuid = projectId.slice(8);

		return [
			this._db.bucket.listAsStream({
				keys: user.organisations.accepted.map(orgId => 'link:' + orgId.slice(13) + ':' + projectUuid),
				include_docs: true
			}),
			JSONStream.parse('rows', true, 'doc')
		];
	}
}
