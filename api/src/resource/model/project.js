const validator = require('is-my-json-valid');
const Model = require('./model');
const LogicalFrame = require('./logical-frame');
const DataSource = require('./data-source');
const schema = require('../schema/project.json');

var validate = validator(schema);

class Project extends Model {

	static validate(data) {
		// Check that entity ids exist in groups, ...
		let entityIds = data.entities.map(e => e.id),
			dataSourceIds = data.forms.map(ds => ds.id);

		data.groups.forEach(group => {
			group.members.forEach(entityId => {
				if (entityIds.indexOf(entityId) === -1)
					throw new Error('invalid_data');
			});
		});

		data.users.forEach(user => {
			if (user.entities)
				user.entities.forEach(entityId => {
					if (entityIds.indexOf(entityId) === -1)
						throw new Error('invalid_data');
				});

			if (user.dataSources)
				user.dataSources.forEach(dataSourceId => {
					if (dataSourceIds.indexOf(dataSourceId) === -1)
						throw new Error('invalid_data');
				});
		});

		data.forms.forEach(form => DataSource.validate(form, data));
		data.logicalFrames.forEach(lf => LogicalFrame.validate(lf, data));
	}


	/**
	 * Deserialize and validate a project that comes from the API/DB.
	 */
	constructor(data) {
		super(data);

		// Create forms & logicalFrames
		this.forms = this.forms.map(f => new DataSource(f));
		this.logicalFrames = this.logicalFrames.map(lf => new LogicalFrame(lf));
	}

	/**
	 * Retrieve a datasource by id.
	 */
	getDataSourceById(id) {
		return this.forms.find(ds => ds.id === id);
	}

	getDataSourceByVariableId(id) {
		return this.forms.find(ds => ds.getVariableById(id));
	}

	/**
	 * Retrieve an entity by id.
	 */
	getEntityById(id) {
		return this.entities.find(e => e.id === id);
	}

	/**
	 * Retrieve a logical framework by id.
	 */
	getLogicalFrameById(id) {
		return this.logicalFrames.find(lf => lf.id === id);
	}

	/**
	 * Retrieve the user permissions on this project.
	 */
	getUserByEmail(email) {
		return this.users.find(u => u.email === email);
	}
}

module.exports = Project;