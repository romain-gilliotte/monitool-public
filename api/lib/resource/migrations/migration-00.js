
import database from '../database';

const getDesignDoc = function () {
	let ddoc = {
		_id: "_design/monitool",
		views: {
			inputs_variable: {
				map: function (doc) {
					if (doc.type === 'input') {
						for (var variableId in doc.values) {
							emit(
								doc.project + ':' + doc.form + ':' + variableId,
								{ v: doc.values[variableId], s: doc.structure[variableId] }
							);
						}
					}
				}
			},
			inputs_with_progress: {
				map: function (doc) {
					if (doc.type === 'input') {
						var progress = 0;
						var count = 0;
						for (var key in doc.values) {
							count++;
							for (var i = 0; i < doc.values[key].length; ++i)
								if (doc.values[key][i] !== 0) {
									progress++; break;
								}
						}
						emit(doc._id, progress / count);
					}
				}
			},
			inputs_updated_at: {
				map: function (doc) {
					if (doc.type === 'input' && doc.updatedAt)
						emit(doc.project, doc.updatedAt);
				},
				reduce: function (key, values, rereduce) {
					return values.reduce(function (memo, updatedAt) {
						return memo < updatedAt ? updatedAt : memo;
					});
				}
			},
			project_by_email: {
				map: function (doc) {
					if (doc._id.indexOf('project:') == 0)
						doc.users.forEach(function (user) {
							emit([user.email, doc._id]);
						});
				}
			}
		}
	};

	for (var key in ddoc.views) {
		ddoc.views[key].map = ddoc.views[key].map.toString().replace(/[\n\t\s]+/g, ' ');
		if (ddoc.views[key].reduce)
			ddoc.views[key].reduce = ddoc.views[key].reduce.toString().replace(/[\n\t\s]+/g, ' ');
	}

	return ddoc;
}


/**
 * This migration creates the initial design doc.
 */
export default function () {
	return database.insert(getDesignDoc());
};


