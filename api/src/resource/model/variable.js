const validator = require('is-my-json-valid');
const Model = require('./model');
const schema = require('../schema/variable.json');

const validate = validator(schema);

class Variable extends Model {

	static validate(data) {
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

	/**
	 * Number of fields this variable's storage.
	 */
	get numValues() {
		return this.partitions.reduce((m, p) => m * p.elements.length, 1);
	}


	get structure() {
		return this.partitions.map(partition => {
			return {
				id: partition.id,
				items: partition.elements.map(pe => pe.id),
				aggregation: partition.aggregation
			};
		});
	}

	getPdfDocDefinition() {
		var body, widths;

		var colPartitions = this.partitions.slice(this.distribution),
			rowPartitions = this.partitions.slice(0, this.distribution);

		var topRows = this._makeTopRows(colPartitions),
			bodyRows = this._makeLeftCols(rowPartitions);

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

		widths = [];
		for (var i = 0; i < rowPartitions.length; ++i)
			widths.push('auto');
		for (var j = 0; j < dataColsPerRow; ++j)
			widths.push('*');

		// Create stack with label and table.
		var result = {
			stack: [
				{ style: "variableName", text: this.name },
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

	_makeTopRows(partitions) {
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

	_makeLeftCols(partitions) {
		let rows = this._makeTopRows(partitions);

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

}

module.exports = Variable;