
export default class Model {

	/**
	 * Construct model from POJO
	 * A first validation step will happen here to ensure that the POJO is properly formatted.
	 */
	constructor(data, validate) {
		if (validate) {
			if (!data)
				throw new Error('missing_data');

			validate(data);
			var errors = validate.errors || [];
			if (errors.length) {
				var error = new Error('invalid_data');
				error.detail = errors;
				error.model = data;
				throw error;
			}
		}

		Object.assign(this, data);
	}

	/**
	 * Compute API version of this model. This is useful to hide some fields if needed (=> passwords)
	 * Override it on child classes when needed.
	 */
	toAPI() {
		return this.toJSON();
	}

	/**
	 * When serializing a model to JSON, we want all private properties
	 * to be removed (ex: send to database or to api).
	 */
	toJSON() {
		var obj = {};

		Object.assign(obj, this);
		for (let key in obj)
			if (key !== '_id' && key !== '_rev' && key !== '_deleted' && key.substr(0, 1) === '_')
				delete obj[key];

		return obj;
	}

}
