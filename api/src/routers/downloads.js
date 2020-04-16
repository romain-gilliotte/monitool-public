const Router = require('@koa/router');
const hash = require('object-hash');
const { getProject } = require('../storage/queries');
const { getGeneratedFile } = require('../storage/gridfs');

const router = new Router();

/**
 * Render a PDF file containing a sample paper form (for a datasource).
 */
router.get('/resources/project/:prjId/logical-frame/:lfId.:format', async ctx => {
	const { prjId, lfId } = ctx.params;
	const { language, orientation, format } = validateDownloadParams(ctx);

	try {
		const project = await getProject(ctx.state.profile.email, prjId, { _id: 0, logicalFrames: 1, forms: 1 });
		const logicalFramework = project.logicalFrames.find(lf => lf.id == lfId);
		if (!logicalFramework)
			throw new Error('not found');

		const result = await getGeneratedFile(
			`lf:${prjId}:${lfId}:${language}:${orientation}`,
			hash({ lf: logicalFramework, ds: project.forms, language, orientation }),
			'generate-logframe-pdf',
			{ prjId, lfId, language, orientation },
			format === 'png'
		);

		ctx.response.type = result.file.mimeType;
		ctx.response.length = result.file.length;
		ctx.response.attachment(result.file.filename, { type: 'inline' });
		ctx.response.body = result.stream;
	}
	catch (e) {
		if (e.message === 'not found' || /must be .* 24 hex characters/.test(e.message))
			ctx.response.status = 404;
		else
			throw e;
	}
});

/**
 * Render a PDF file containing a sample paper form (for a datasource).
 */
router.get('/resources/project/:prjId/data-source/:dsId.:format', async ctx => {
	const { prjId, dsId } = ctx.params;
	const { language, orientation, format } = validateDownloadParams(ctx);

	try {
		const project = await getProject(ctx.state.profile.email, prjId, { forms: true });
		const dataSource = project.forms.find(ds => ds.id === dsId);
		if (!dataSource)
			throw new Error('not found');

		const result = await getGeneratedFile(
			`ds:${prjId}:${dsId}:${language}:${orientation}`,
			hash({ dataSource, language, orientation }),
			'generate-datasource-pdf',
			{ prjId, dsId, language, orientation },
			format === 'png'
		);

		ctx.response.type = result.file.mimeType;
		ctx.response.length = result.file.length;
		ctx.response.attachment(result.file.filename, { type: 'inline' });
		ctx.response.body = result.stream;
	}
	catch (e) {
		if (e.message === 'not found' || /must be .* 24 hex characters/.test(e.message))
			ctx.response.status = 404;
		else
			throw e;
	}
});

function validateDownloadParams(ctx) {
	let { format } = ctx.params;
	let { language, orientation } = ctx.request.query;

	if (!['pdf', 'png'].includes(format))
		format = 'pdf';

	if (!['en', 'es', 'fr'].includes(language))
		language = 'en';

	if (!['portrait', 'landscape'].includes(orientation))
		orientation = 'portrait';

	return { format, language, orientation };
}

module.exports = router;
