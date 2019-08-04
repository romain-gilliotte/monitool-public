import Store from './store';
import Project from '../model/project';
import jsonpatch from 'fast-json-patch';
import JSONStream from 'JSONStream';
import { Transform } from 'stream'

var hashFunction = function (obj) {
	if (typeof obj === 'string')
		return obj;
	else
		return obj.id || obj.username || obj.display || obj.name;
};

/**
 * Compare two arrays of objects, and create remove, add and move operations
 * to patch from the first to the second.
 */
var compareArray = function (before, after, changes, prefix) {
	var beforeIds = before.map(hashFunction),
		afterIds = after.map(hashFunction);

	// if the hash function is not working, DO NOT TRY
	// jsonpatch will take over
	if (beforeIds.indexOf(undefined) !== -1 || afterIds.indexOf(undefined) !== -1)
		return;

	// start by removing items
	for (var beforeIndex = 0; beforeIndex < beforeIds.length; ++beforeIndex) {
		var id = beforeIds[beforeIndex], afterIndex = afterIds.indexOf(id);

		if (afterIndex === -1) {
			// element was removed
			beforeIds.splice(beforeIndex, 1);
			before.splice(beforeIndex, 1);
			changes.push({ op: 'remove', path: prefix + beforeIndex });
			beforeIndex--; // we need to recheck the same place in the table.
		}
	}

	// add missing items at the end
	for (var afterIndex = 0; afterIndex < afterIds.length; ++afterIndex) {
		var id = afterIds[afterIndex], beforeIndex = beforeIds.indexOf(id);

		if (beforeIndex === -1) {
			// element was added
			beforeIds.push(id);
			before.push(after[afterIndex]);
			changes.push({ op: 'add', path: prefix + beforeIds.length, value: after[afterIndex] });
		}
	}

	// reorder items
	for (var afterIndex = 0; afterIndex < afterIds.length; ++afterIndex) {
		var id = afterIds[afterIndex], beforeIndex = beforeIds.indexOf(id);

		if (afterIndex !== beforeIndex) {
			// vire l'item de before
			var item = before.splice(beforeIndex, 1)[0];
			beforeIds.splice(beforeIndex, 1);

			// le remet au bon endroit
			before.splice(afterIndex, 0, item);
			beforeIds.splice(afterIndex, 0, id);
			changes.push({ op: 'move', from: prefix + beforeIndex, path: prefix + afterIndex })
		}
	}
};


var compareRec = function (before, after, changes, prefix = '/') {
	if (Array.isArray(before) && Array.isArray(after)) {
		compareArray(before, after, changes, prefix);

		for (var i = 0; i < before.length; ++i)
			compareRec(before[i], after[i], changes, prefix + i + '/')
	}
	else if (typeof before === 'object' && typeof after === 'object') {
		for (var key in before)
			if (after[key])
				compareRec(before[key], after[key], changes, prefix + key + '/');
	}
};

var compare = function (before, after) {
	before = JSON.parse(JSON.stringify(before)); // clone

	let moves = [];
	compareRec(before, after, moves, '/');

	return moves.concat(jsonpatch.compare(before, after));
};


export default class ProjectStore extends Store {

	get modelString() {
		return 'project';
	}

	get modelClass() {
		return Project;
	}

	async listRevisions(projectId, offset, limit) {
		if (typeof projectId !== 'string')
			throw new Error('missing_parameter');

		offset = Number.isNaN(offset * 1) ? 0 : offset * 1;
		limit = Number.isNaN(limit * 1) ? 20 : limit * 1;

		// Get revisions.
		// There is a special case to handle when offset = 0 (we need current project).
		let revisions;
		if (offset === 0) {
			let project;
			[project, revisions] = await Promise.all([
				this.get(projectId),
				this._db.callList({
					include_docs: true,
					startkey: 'rev:' + projectId + ':9999999999999999',
					endkey: 'rev:' + projectId + ':0000000000000000',
					descending: true,
					limit: limit
				})
			]);
			revisions.rows.unshift({ id: project._id, doc: project });
		}
		else
			revisions = await this._db.callList({
				include_docs: true,
				startkey: 'rev:' + projectId + ':9999999999999999',
				endkey: 'rev:' + projectId + ':0000000000000000',
				descending: true,
				skip: offset - 1,
				limit: limit + 1
			});

		// Compute diffs over time.
		let diffs = [];
		for (let i = 0; i < revisions.rows.length; ++i) {
			const doc = revisions.rows[i].doc;
			const time = new Date(parseInt(doc._id.substr(-16)));
			const user = doc.modifiedBy;

			// Clear fields that are different on revisions and projects to avoid messing with the patches.
			delete doc._id;
			delete doc.type;
			delete doc._rev;
			delete doc.modifiedBy;

			if (i > 0)
				diffs.push({
					time: time,
					user: user,
					backwards: compare(revisions.rows[i - 1].doc, doc),
					forwards: compare(doc, revisions.rows[i - 1].doc)
				});
		}

		return diffs;
	}

	// Retrieve the project in witch this user is directly involved.
	async listByEmail(email) {
		return [
			this._db.bucket.viewAsStream(
				'monitool',
				'project_by_email',
				{ startkey: [email], endkey: [email, {}], include_docs: true }
			),
			JSONStream.parse(['rows', true, 'doc']),
			new Transform({
				objectMode: true,
				transform(doc, _, callback) {
					this.push(new Project(doc));
					callback();
				}
			})
		];
	}

	async canView(email, projectId) {
		const result = await this._db.callView('project_by_email', { key: [email, projectId] });
		return result.rows.length === 1;
	}
}
