
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

	ddoc.views.project_by_email = {
		map: function(doc) {
			if (doc._id.indexOf('project:') == 0)
				doc.users.forEach(function(user) {
					emit(user.email);
				});
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

	// Create organisation
	const organisation = {
		_id: 'organisation:1d695341-1f63-41b3-88b4-fc88161dce6e',
		name: 'Default org',
		description: 'This organisation was created while migrating from a previous monitool version',
		thematics: themes.map(theme => {
			return {
				id: theme._id.substring(6),
				name: theme.name.en,
				description: 'This thematic was imported from a previous version of monitool',
				indicators: indicators
					.filter(indicator => indicator.themes.includes(theme._id))
					.map(indicator => {
						return {
							id: indicator._id.substring(10),
							name: indicator.name.en,
							description: indicator.description.en
						}
					})
			}
		}),

		"invitations": [
			{"role": "readonly", "pattern": ".*"}
		]
	}

	// Delete indicators and themes.
	indicators = indicators.map(doc => { return {_id: doc._id, _rev: doc._rev, _deleted: true}})
	themes = themes.map(doc => { return {_id: doc._id, _rev: doc._rev, _deleted: true}})

	// Commit to database.
	await database.bucket.bulk({docs: [...indicators, ...themes, organisation]})
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
				// Create project link
				this.push({
					_id: 'link:1d695341-1f63-41b3-88b4-fc88161dce6e:' + doc._id.substring(8),
					thematics: doc.themes.map(t => t.substring(6)),
					indicators: Object
						.keys(doc.crossCutting)
						.map(id => {
							return {
								id: id.substring(10),
								computation: doc.crossCutting[id].computation
							};
						})
						.filter(ind => !!ind.computation)
				});

				// Transform project.
				doc.users = doc.users.filter(user => user.type === 'internal');
				doc.users.forEach(user => {
					user.email = user.id.substring(5) + '@medecinsdumonde.net';

					delete user.type;
					delete user.id;
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

