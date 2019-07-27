
import Router from 'koa-router';
import PdfPrinter from 'pdfmake';

import Project from '../resource/model/project';


const router = new Router();

/**
 * More boilerplate needed to start-up pdfmake
 */
const styles = {
	header: {
		fontSize: 16,
		bold: true,
		alignment: 'center',
		margin: [100, 0, 100, 0]
	},
	header3: {
		fontSize: 16,
		bold: true,
		alignment: 'center',
		margin: [0, 0, 0, 10]
	},
	header2: {
		fontSize: 14,
		bold: true,
		margin: [0, 15, 0, 0]
	},
	variableName: {
		fontSize: 10,
		bold: true,
		margin: [0, 10, 0, 5]
	},
	bold: {
		bold: true
	},
	normal: {
		fontSize: 9
	},
	italic: {
		fontSize: 9,
		italics: true,
		margin: [10, 0, 0, 0]
	}
};

/**
 * Create preconfigured printer
 */
const printer = new PdfPrinter({
	Roboto: {
		normal: 'node_modules/roboto-fontface/fonts/Roboto/Roboto-Regular.ttf',
		bold: 'node_modules/roboto-fontface/fonts/Roboto/Roboto-Medium.ttf',
		italics: 'node_modules/roboto-fontface/fonts/Roboto/Roboto-RegularItalic.ttf',
		bolditalics: 'node_modules/roboto-fontface/fonts/Roboto/Roboto-MediumItalic.ttf'
	}
});


/**
 * Render a PDF file containing a sample paper form (for a datasource).
 */
router.get('/resources/project/:id/data-source/:dataSourceId.pdf', async ctx => {
	const project = await Project.storeInstance.get(ctx.params.id);
	const dataSource = project.getDataSourceById(ctx.params.dataSourceId);

	// Create document definition.
	const title = dataSource.name || 'data-source';
	const docDef = dataSource.getPdfDocDefinition(ctx.request.query.orientation, ctx.request.query.language);
	docDef.styles = styles;

	// Send to user.
	ctx.response.type = 'application/pdf';
	ctx.response.body = printer.createPdfKitDocument(docDef);
	ctx.response.attachment(title + '.pdf');
	ctx.response.body.end();
});


/**
 * Render a PDF file describing the given logical frame.
 */
router.get('/resources/project/:id/logical-frame/:logicalFrameId.pdf', async ctx => {
	const project = await Project.storeInstance.get(ctx.params.id);
	const logicalFramework = project.getLogicalFrameById(ctx.params.logicalFrameId)

	// Create document definition.
	const title = logicalFramework.name || 'logical-framework';
	const docDef = logicalFramework.getPdfDocDefinition(ctx.request.query.orientation, project.forms, ctx.request.query.language);
	docDef.styles = styles;

	// Send to user.
	ctx.response.type = 'application/pdf';
	ctx.response.body = printer.createPdfKitDocument(docDef);
	ctx.response.attachment(title + '.pdf');
	ctx.response.body.end();
});


export default router;
