
module.exports = async (ctx, next) => {
	try {
		await next();
	}
	catch (error) {
		console.log(error);
		throw error;
	}
};
