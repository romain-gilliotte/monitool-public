
import database from '../database';

// Add new view to access inputs by variable
export default async () => {
	// Update design document.
	const ddoc = await database.get('_design/monitool');

	delete ddoc.views.partners;
	delete ddoc.views.projects_public;
	delete ddoc.views.projects_private;
	delete ddoc.views.projects_short;

	

	await database.insert(ddoc);
};

