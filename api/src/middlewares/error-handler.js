const config = require('../config/config');

const statusCodes = Object.freeze({
	wrong_type: 400,	// id collision
	forbidden: 403,		// trying to get forbidden item

	// list
	invalid_mode: 400,	// unknown mode: ex project?mode=withoutname
	missing_parameter: 400,	// required parameter is missing for given mode.

	// fetch
	missing: 404,		// trying to get non existing item

	// put
	id_mismatch: 400,	// id in URL and model do not match
	invalid_data: 400,	// saving entity that did not pass validation
	missing_data: 400,  // ???
	invalid_reference: 400, // foreign key fail.
	'Document update conflict.': 400, // trying to update an out of date document.
});


module.exports = async (ctx, next) => {
	try {
		await next();
	}
	catch (error) {
		ctx.response.status = statusCodes[error.message] || 500;

		if (config.debug)
			ctx.response.body = error;
		else
			ctx.response.body = { message: error.message };
	}
};
