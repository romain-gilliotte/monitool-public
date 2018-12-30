
import database from '../database';
import JSONStream from 'JSONStream';
import {Transform, Writable, pipeline} from 'stream';
import {promisify} from 'util';

const pipelineP = promisify(pipeline);



async function migrateDesignDoc() {
	// Update design document.
	const ddoc = await database.get('_design/monitool');

	delete ddoc.views.partners;
	delete ddoc.views.projects_public;
	delete ddoc.views.projects_private;
	delete ddoc.views.projects_short;
	delete ddoc.views.cross_cutting;
	delete ddoc.views.indicator_by_theme;
	delete ddoc.views.project_by_theme;

	ddoc.views.project_by_user = {
		map: function(doc) {
			if (doc._id.indexOf('project:') == 0)
				doc.users.forEach(function(user) { emit(user.id); });
		}.toString().replace(/\s+/, ' ')
	};

	await database.insert(ddoc);
}

async function migrateOrganisation() {
	// Query
	let [indicators, themes] = await Promise.all([
		database.bucket.list({startkey: 'indicator:!', endkey: 'indicator:~', include_docs: true}),
		database.bucket.list({startkey: 'theme:!', endkey: 'theme:~', include_docs: true})
	]);

	// Get docs from results
	indicators = indicators.rows.map(r => r.doc);
	themes = themes.rows.map(r => r.doc);

	// Delete indicators and themes.
	indicators = indicators.map(doc => { return {_id: doc._id, _rev: doc._rev, _deleted: true}})
	themes = themes.map(doc => { return {_id: doc._id, _rev: doc._rev, _deleted: true}})

	// Commit to database.
	await database.bucket.bulk({docs: [...indicators, ...themes]})
}


async function migrateProjects() {
	await pipelineP([
		database.bucket.listAsStream({
			startkey: 'project:!',
			endkey: 'project:~',
			include_docs: true
		}),
		JSONStream.parse(['rows', true, 'doc']),
		new Transform({
			objectMode: true,
			transform(doc, _, callback) {
				// Transform project.
				doc.users = doc.users.filter(user => user.type === 'internal');
				doc.users.forEach(user => {
					user.id = user.id + '@medecinsdumonde.net';
					delete user.type;
				});

				delete doc.visibility;
				delete doc.crossCutting;
				delete doc.themes;

				this.push(doc);
				callback();
			}
		}),
		new Writable({
			objectMode: true,
			write(doc, _, callback) {
				database.bucket.insert(doc, {}, () => callback);
				callback();
			}
		})
	]);
}

async function migrateUsers() {
	const users = await database.bucket.list({startkey: 'user:!', endkey: 'user:~'});

	await database.bucket.bulk({
		docs: users.rows.map(row => {
			return {_id: row.id, _rev: row.value.rev, _deleted: true};
		})
	})
}



// Add new view to access inputs by variable
export default async () => {
	await migrateDesignDoc();
	await migrateOrganisation();
	await migrateProjects();
	await migrateUsers();
};

