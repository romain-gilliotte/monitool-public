import angular from 'angular';
import { product } from '../../../helpers/array';
import mtTdReportingField from '../../shared/reporting/td-reporting-field';
import { getQueryDimensions } from '../../../helpers/query-builder';
require(__scssPath);

const module = angular.module(__moduleName, [mtTdReportingField]);

module.component(__componentName, {
	bindings: {
		project: '<',
		query: '<',
		distribution: '<',
		showTotals: '<',
		data: '<',
		baseline: '<',
		target: '<',
		colorize: '<'
	},

	template: require(__templatePath),

	controller: class {

		constructor($element, $scope) {
			"ngInject";

			this._element = angular.element($element);
			this.$scope = $scope;
		}

		$onInit() {
			this._binded = this._onScroll.bind(this);
			this._element.bind('scroll', this._binded);
		}

		$onDestroy() {
			this._element.unbind('scroll', this._binded);
		}

		_onScroll() {
			this.headerStyle = {
				transform: 'translate(0, ' + this._element[0].scrollTop + 'px)'
			};

			this.firstColStyle = {
				transform: 'translate(' + this._element[0].scrollLeft + 'px)'
			};

			this.$scope.$apply(); // remove this, way too expensive for a scroll event.
		}

		$onChanges(changes) {
			const queryDimensions = getQueryDimensions(this.project, this.query, false, true);
			const dimensions = this.query.aggregate.map(aggregate => {
				const dim = queryDimensions.find(d => d.id === aggregate.id);
				return dim.getEntries(aggregate.attribute).map(entry => ({
					id: entry[0],
					name: entry[1]
				}));
			});

			const rows = dimensions.slice(0, this.distribution);
			const cols = dimensions.slice(this.distribution);
			this._buildGridGeneric(rows, cols, this.data);
		}

		_buildGridGeneric(rowss, colss, data) {
			if (colss.length === 0) {
				colss = [[{ id: 'all', name: 'total' }]];
				data = this._addFakeDimensionToData(data, rowss.length);
			}
			else if (this.showTotals)
				colss = colss.map(col => [...col, { id: 'all', name: 'total' }]);

			if (rowss.length === 0) {
				rowss = [[{ id: 'all', name: 'total' }]];
				data = this._addFakeDimensionToData(data, 0);
			}
			else if (this.showTotals)
				rowss = rowss.map(row => [...row, { id: 'all', name: 'total' }]);

			// Create empty grid.
			this.grid = {
				header: this._buildHeader(colss),
				body: this._buildDataRows(rowss, colss, data)
			};
		}

		_buildHeader(colss) {
			const header = [];

			// Create header rows.
			var totalCols = colss.reduce((memo, cols) => memo * cols.length, 1),
				colspan = totalCols, // current colspan is total number of columns.
				numCols = 1; // current numCols is 1.

			for (var i = 0; i < colss.length; ++i) {
				// adapt colspan and number of columns
				colspan /= colss[i].length;
				numCols *= colss[i].length;

				// Create header row
				var row = { colspan: colspan, cols: [] };
				for (var k = 0; k < numCols; ++k)
					row.cols.push(colss[i][k % colss[i].length]);

				header.push(row);
			}

			return header;
		}

		_buildDataRows(rowss, colss, data) {
			const body = [];

			// Create data rows.
			const rowspans = [];
			let rowspan = rowss.reduce((memo, rows) => memo * rows.length, 1);
			for (var i = 0; i < rowss.length; ++i) {
				rowspan /= rowss[i].length;
				rowspans[i] = rowspan;
			}

			product(rowss).forEach((headers, rowIndex) => {
				const headerCols = headers
					.map((header, i) => ({ ...header, rowspan: rowspans[i] }))
					.filter(header => rowIndex % header.rowspan == 0);

				const colsPaths = product([...headers.map(a => [a]), ...colss]);
				const dataCols = colsPaths.map(els => {
					var result = data;
					var numEls = els.length;
					for (var i = 0; i < numEls; ++i)
						result = result[els[i].id];

					return result;
				});

				body.push({ headerCols, dataCols });
			});

			return body;
		}

		_addFakeDimensionToData(data, at) {
			if (at == 0)
				return { all: data };
			else {
				const obj = {};
				for (let key in data)
					obj[key] = this._addFakeDimensionToData(data[key], at - 1);
				return obj;
			}
		}
	}
})

export default module.name;
