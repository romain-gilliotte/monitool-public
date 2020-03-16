
class Model {

	/**
	 * Construct model from POJO
	 * A first validation step will happen here to ensure that the POJO is properly formatted.
	 */
	constructor(data, validate) {
		Object.assign(this, data);
	}

}

module.exports = Model;