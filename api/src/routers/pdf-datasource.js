const Router = require('koa-router');
const PdfPrinter = require('pdfmake');
const { ObjectId } = require('mongodb');

const router = new Router();

/**
 * More boilerplate needed to start-up pdfmake
 */
const styles = {
	header: { fontSize: 16, bold: true, alignment: 'center', margin: [100, 0, 100, 0] },
	variableName: { fontSize: 10, bold: true, margin: [0, 10, 0, 5] },
	normal: { fontSize: 9 },
};

/**
 * Create preconfigured printer
 */
const printer = new PdfPrinter({
	Roboto: {
		normal: 'node_modules/roboto-fontface/fonts/roboto/Roboto-Regular.woff',
		bold: 'node_modules/roboto-fontface/fonts/roboto/Roboto-Medium.woff'
	}
});


const strings = Object.freeze({
	fr: Object.freeze({
		collection_site: "Lieu de collecte",
		covered_period: "Période couverte",
		collected_by: "Saisie par"
	}),
	en: Object.freeze({
		collection_site: "Collection site",
		covered_period: "Covered period",
		collected_by: "Collected by"
	}),
	es: Object.freeze({
		collection_site: "Lugar de colecta",
		covered_period: "Periodo",
		collected_by: "Rellenado por"
	})
});


/**
 * Render a PDF file containing a sample paper form (for a datasource).
 */
router.get('/resources/project/:id/data-source/:dataSourceId.pdf', async ctx => {
	const project = await database.collection('project').findOne(
		{
			_id: new ObjectId(ctx.params.id),
			$or: [{ owner: ctx.state.profile.email }, { 'users.email': ctx.state.profile.email }],
		},
		{
			projection: { 'forms': { $elemMatch: { id: ctx.params.dataSourceId } } }
		}
	);

	if (project && project.forms.length) {
		const dataSource = project.forms[0];;

		// Create document definition.
		const title = dataSource.name || 'data-source';
		const docDef = createDataSourceDocDef(dataSource, ctx.request.query.orientation, ctx.request.query.language);
		docDef.styles = styles;

		// Send to user.
		ctx.response.type = 'application/pdf';
		ctx.response.body = printer.createPdfKitDocument(docDef);
		ctx.response.attachment(title + '.pdf');
		ctx.response.body.end();
	}
	else {
		ctx.response.status = 404;
	}
});


function createDataSourceDocDef(dataSource, pageOrientation, language = 'en') {
	return {
		pageSize: "A4",
		pageOrientation: pageOrientation,
		content: [
			{ text: dataSource.name, style: 'header' },
			{
				columns: [
					[
						{ style: "variableName", text: strings[language].collection_site },
						{
							table: { headerRows: 0, widths: ['*'], body: [[{ style: "normal", text: ' ' }]] },
							margin: [0, 0, 10, 0]
						}
					],
					[
						{ style: "variableName", text: strings[language].covered_period },
						{
							table: { headerRows: 0, widths: ['*'], body: [[{ style: "normal", text: ' ' }]] },
							margin: [0, 0, 10, 0]
						},
					],
					[
						{ style: "variableName", text: strings[language].collected_by },
						{
							table: { headerRows: 0, widths: ['*'], body: [[{ style: "normal", text: ' ' }]] },
							margin: [0, 0, 0, 0]
						}
					]
				]
			},

			...dataSource.elements.map(createVariableDocDef)
		]
	};
}


function createVariableDocDef(variable) {
	var body, widths;

	var colPartitions = variable.partitions.slice(variable.distribution),
		rowPartitions = variable.partitions.slice(0, variable.distribution);

	var topRows = makeTopRows(colPartitions),
		bodyRows = makeLeftCols(rowPartitions);

	if (!bodyRows.length)
		bodyRows.push([])

	var dataColsPerRow = topRows.length ? topRows[0].length : 1;

	// Add empty data fields to bodyRows
	bodyRows.forEach(function (bodyRow) {
		for (var i = 0; i < dataColsPerRow; ++i)
			bodyRow.push(' ');
	});

	// Add empty field in the top-left corner for topRows
	topRows.forEach(function (topRow, index) {
		for (var i = 0; i < rowPartitions.length; ++i)
			topRow.unshift({
				text: ' ',
				colSpan: i == rowPartitions.length - 1 ? rowPartitions.length : 1,
				rowSpan: index == 0 ? topRows.length : 1
			});
	});

	body = topRows.concat(bodyRows);

	widths = [];
	for (var i = 0; i < rowPartitions.length; ++i)
		widths.push('auto');
	for (var j = 0; j < dataColsPerRow; ++j)
		widths.push('*');

	// Create stack with label and table.
	var result = {
		stack: [
			{ style: "variableName", text: variable.name },
			{
				table: {
					headerRows: colPartitions.length,
					dontBreakRows: true,
					widths: widths,
					body: [...topRows, ...bodyRows]
				}
			}
		]
	};

	// FIXME This is not ideal at all, but the best that can be done with current pdfmake API.
	// if table is not very long, make sure it is not cut in the middle.
	if (body.length < 20)
		result = {
			layout: 'noBorders',
			table: {
				dontBreakRows: true,
				widths: ['*'],
				body: [[result]]
			}
		}

	return result;
}

function makeTopRows(partitions) {
	var totalCols = partitions.reduce(function (memo, tp) { return memo * tp.elements.length; }, 1),
		currentColSpan = totalCols;

	var body = [];

	// Create header rows for top partitions
	partitions.forEach(function (tp) {
		// Update currentColSpan
		currentColSpan /= tp.elements.length;

		// Create header row
		var row = [];

		// Add one field for each element in tp, with current colspan
		for (var colIndex = 0; colIndex < totalCols; ++colIndex) {
			// Add field
			var tpe = tp.elements[(colIndex / currentColSpan) % tp.elements.length];
			row.push({ colSpan: currentColSpan, style: "normal", text: tpe.name });

			// Add as many fillers as the colSpan value - 1
			var colLimit = colIndex + currentColSpan - 1;
			for (; colIndex < colLimit; ++colIndex)
				row.push("");
		}

		// push to body
		body.push(row);
	});

	return body;
}

function makeLeftCols(partitions) {
	let rows = makeTopRows(partitions);

	if (rows.length === 0)
		return [];

	var result = new Array(rows[0].length);

	for (var x = 0; x < rows[0].length; ++x) {
		result[x] = new Array(rows.length);

		for (var y = 0; y < rows.length; ++y) {
			result[x][y] = JSON.parse(JSON.stringify(rows[y][x]));

			if (result[x][y].colSpan) {
				result[x][y].rowSpan = result[x][y].colSpan;
				delete result[x][y].colSpan;
			}
			else if (result[x][y].rowSpan) {
				result[x][y].colSpan = result[x][y].rowSpan;
				delete result[x][y].rowSpan;
			}
		}
	}

	return result;
}



module.exports = router;
