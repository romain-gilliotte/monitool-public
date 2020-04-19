const Router = require('@koa/router');
const hash = require('object-hash');
const { getProject } = require('../storage/queries');
const { getGeneratedFile } = require('../storage/gridfs');

const router = new Router();

/** Logical framework */
router.get('/project/:prjId/logical-frame/:lfId.:format(png|pdf)', async ctx => {
	const { prjId, lfId } = ctx.params;
	const { language, orientation, format, thumbnail } = validateDownloadParams(ctx, 'pdf');

	try {
		const project = await getProject(ctx.state.profile.email, prjId, { _id: 0, logicalFrames: 1, forms: 1 });
		const logicalFramework = project.logicalFrames.find(lf => lf.id == lfId);
		if (!logicalFramework)
			throw new Error('not found');

		const result = await getGeneratedFile(
			`lf:${prjId}:${lfId}:${language}:${orientation}:${format}`,
			hash({ lf: logicalFramework, ds: project.forms, language, orientation }),
			`generate-logframe-${format}`,
			{ prjId, lfId, language, orientation },
			thumbnail
		);

		ctx.response.type = result.file.mimeType;
		ctx.response.length = result.file.length;
		ctx.response.body = result.stream;
		if (result.file.mimeType !== 'image/png')
			ctx.response.attachment(result.file.filename);
	}
	catch (e) {
		if (e.message === 'not found' || /must be .* 24 hex characters/.test(e.message))
			ctx.response.status = 404;
		else
			throw e;
	}
});

/** Form */
router.get('/project/:prjId/data-source/:dsId.:format(png|xlsx|pdf)', async ctx => {
	const { prjId, dsId } = ctx.params;
	const { language, orientation, format, thumbnail } = validateDownloadParams(ctx, 'pdf');

	try {
		const project = await getProject(ctx.state.profile.email, prjId, { forms: true });
		const dataSource = project.forms.find(ds => ds.id === dsId);
		if (!dataSource)
			throw new Error('not found');

		const result = await getGeneratedFile(
			`ds:${prjId}:${dsId}:${language}:${orientation}:${format}`,
			hash({ dataSource, language, orientation }),
			`generate-datasource-${format}`,
			{ prjId, dsId, language, orientation },
			thumbnail
		);

		ctx.response.type = result.file.mimeType;
		ctx.response.length = result.file.length;
		ctx.response.body = result.stream;
		if (result.file.mimeType !== 'image/png')
			ctx.response.attachment(result.file.filename);
	}
	catch (e) {
		if (e.message === 'not found' || /must be .* 24 hex characters/.test(e.message))
			ctx.response.status = 404;
		else
			throw e;
	}
});

/** Render file containing all data entry up to a given date */
router.get('/project/:prjId/export/:periodicity.:format(png|xlsx)', async ctx => {
	const { prjId } = ctx.params;
	const { language, format, thumbnail, periodicity } = validateDownloadParams(ctx, 'xlsx');

	if (await ctx.state.profile.canViewProject(prjId)) {
		// No need to compute a hash here: the cache will be deleted when inputs are posted.
		const result = await getGeneratedFile(
			`reporting:${prjId}:${periodicity}`,
			'fixed',
			`generate-reporting-${format}`,
			{ prjId, periodicity, language },
			thumbnail
		);

		ctx.response.type = result.file.mimeType;
		ctx.response.length = result.file.length;
		ctx.response.body = result.stream;
		if (result.file.mimeType !== 'image/png')
			ctx.response.attachment(result.file.filename);
	}
});

function validateDownloadParams(ctx, thumbnailFormat) {
	let { format, periodicity } = ctx.params;
	let { language, orientation } = ctx.request.query;

	const thumbnail = format === 'png';

	if (!['xlsx', 'pdf'].includes(format))
		format = thumbnailFormat;

	if (!['en', 'es', 'fr'].includes(language))
		language = 'en';

	if (!['portrait', 'landscape'].includes(orientation))
		orientation = 'portrait';

	const periodicities = [
		'day', 'month_week_sat', 'month_week_sun', 'month_week_mon',
		'week_sat', 'week_sun', 'week_mon',
		'month', 'quarter', 'semester', 'year'
	];

	if (!periodicities.includes(periodicity))
		periodicity = 'month';

	return { format, language, orientation, periodicity, thumbnail };
}

module.exports = router;
