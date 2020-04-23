import angular from 'angular';
require(__cssPath);

const module = angular.module(__moduleName, []);

const onScreenGrids = [];

let Handsontable;
async function loadHot() {
	await import('handsontable/dist/handsontable.css');

	const HotDep = await import('handsontable/dist/handsontable.js');
	Handsontable = HotDep.default;
}


/**
 * Warning: do not rebind variable after the component has initialized.
 * It is not watching the value.
 * 
 * 
 * Todo: we just need to drop this whole handsontable module.
 * It is way overkill for our need.
 */
module.component(__componentName, {
	bindings: {
		variable: '<'
	},
	require: {
		'ngModelCtrl': 'ngModel'
	},
	template: require(__templatePath),

	controller: class {

		constructor($element, $scope) {
			"ngInject";

			this.$element = $element;
			this.$scope = $scope;

			// bind the event handler so that we can remove it when the component is destroyed
			this._keyDownHandler = e => this._onKeyDown(e);
		}

		async $onInit() {
			// Convert a 1D array with all the data to a 2D table with headers and back.
			this.ngModelCtrl.$formatters.push(this._modelToView.bind(this));
			this.ngModelCtrl.$parsers.push(this._viewToModel.bind(this));

			this.ngModelCtrl.$render = () => this.handsOnTable && this.handsOnTable.loadData(this.ngModelCtrl.$viewValue);

			this.ngModelCtrl.$validators.isNumber = modelValue => modelValue.every(v => typeof v === 'number' || v === null);
		}

		async $onDestroy() {
			await loadHot();

			onScreenGrids.splice(onScreenGrids.indexOf(this), 1);
			document.body.removeEventListener('keydown', this._keyDownHandler);

			if (this.handsOnTable) {
				this.handsOnTable.destroy();
			}
		}

		async $onChanges() {
			// hack: we just remove inactive partitions & partition elements
			// this whole component needs to be rewritten.
			// ideally we should be based on the structure of the input we are updating so that
			// it is possible to review / correct legacy data which was entered with a different structure.
			this.partitions = this.variable.partitions.filter(p => p.active).map(p => ({
				...p,
				elements: p.elements.filter(e => e.active)
			}));

			this.distribution = this.variable.distribution;
		}

		async $postLink() {
			const withSum =
				this.partitions.length > 0
				&& this.partitions.every(p => p.aggregation === 'sum');

			this.withSumX = withSum && this.distribution !== this.partitions.length;
			this.withSumY = withSum && this.distribution !== 0;

			const [colPartitions, rowPartitions] = [
				this.partitions.slice(this.distribution),
				this.partitions.slice(0, this.distribution)
			];

			this._width = colPartitions.reduce((m, p) => m * p.elements.length, 1) + rowPartitions.length + (this.withSumX ? 1 : 0);
			this._height = rowPartitions.reduce((m, p) => m * p.elements.length, 1) + colPartitions.length + (this.withSumY ? 1 : 0);

			await loadHot();
			this.handsOnTable = new Handsontable(this.$element[0].firstElementChild, {
				licenseKey: 'non-commercial-and-evaluation',
				stretchH: "all", // use all of container width
				preventOverflow: true, // to not go over container width
				className: "htLeft", // content in cells is left aligned

				// Lock grid size so that user can't expand it.
				minCols: this._width, maxCols: this._width,
				minRows: this._height, maxRows: this._height,

				// processing to do when the UI table is updated.
				afterChange: this._onHandsOnTableChange.bind(this),
				cells: this._handsOnTableCellRenderer.bind(this)
			});
			this.handsOnTable.loadData(this.ngModelCtrl.$viewValue)
			this.$scope.$apply();

			// Simulate tab index between all fields.
			onScreenGrids.push(this);
			if (onScreenGrids.length === 1)
				this.selectFirstCell();

			document.body.addEventListener('keydown', this._keyDownHandler);
		}


		/**
		 * Focus the first cell of the table.
		 * This will be called by other number-tables when tabbing between various fields.
		 */
		selectFirstCell() {
			this.handsOnTable.selectCells([
				[
					this.partitions.length - this.distribution,
					this.distribution,
					this.partitions.length - this.distribution,
					this.distribution,
				]
			]);
		}

		/**
		 * Focus the first cell of the table.
		 * This will be called by other number-tables when tabbing between various fields.
		 */
		selectLastCell() {
			this.handsOnTable.selectCells([
				[
					this.withSumY ? this._height - 2 : this._height - 1,
					this.withSumX ? this._width - 2 : this._width - 1,
					this.withSumY ? this._height - 2 : this._height - 1,
					this.withSumX ? this._width - 2 : this._width - 1,
				]
			]);
		}

		_onKeyDown(e) {
			if (!this.handsOnTable || e.keyCode !== 9)
				return;

			var selection = this.handsOnTable.getSelected();
			if (selection) {
				e.stopPropagation(); // do not let handsontable get the event.
				e.stopImmediatePropagation() // do no let other instances of number-table to get the event.
				e.preventDefault(); // do not let the browser use this event (ie: to select the address bar or something else).

				const [minX, maxX] = [this.distribution, this.withSumX ? this._width - 1 : this._width];
				const [minY, maxY] = [this.partitions.length - this.distribution, this.withSumY ? this._height - 1 : this._height];

				// Select only one zone in the table
				selection.length = 1;

				if (!e.shiftKey) {
					// Select next cell
					selection[0][1]++;
					if (selection[0][1] >= maxX) {
						selection[0][0]++;
						selection[0][1] = minX;
					}
				}
				else {
					// Select previous cell
					selection[0][1]--;
					if (selection[0][1] < minX) {
						selection[0][0]--;
						selection[0][1] = maxX - 1;
					}
				}

				if (minY <= selection[0][0] && selection[0][0] < maxY) {
					// select only one cell
					selection[0][2] = selection[0][0];
					selection[0][3] = selection[0][1];

					this.handsOnTable.selectCells(selection);
				}
				else if (selection[0][0] < minY) {
					this.handsOnTable.deselectCell();

					const next = onScreenGrids[(onScreenGrids.indexOf(this) + onScreenGrids.length - 1) % onScreenGrids.length];
					next.selectLastCell()
				}
				else {
					this.handsOnTable.deselectCell();

					const next = onScreenGrids[(onScreenGrids.indexOf(this) + 1) % onScreenGrids.length];
					next.selectFirstCell()
				}

			}
		}


		/**
		 * Update the viewvalue when handsontable report changes.
		 */
		_onHandsOnTableChange(changes, action) {
			// changes === undefined when action === "loadData"
			// @see http://docs.handsontable.com/0.15.0-beta3/Hooks.html#event:afterChange
			if (!changes)
				return;

			// if the data that was entered is a formula (eg: 1+2) replace by evaluated value.
			changes.forEach(change => {
				const [y, x, _, val] = change;

				// If user entered something that is not a number, maybe its a sum.
				if (typeof val !== 'number') {
					try {
						const newValue = val.split('+').reduce((m, v) => m + Number(v.trim()), 0);
						if (typeof newValue === 'number' && !Number.isNaN(newValue))
							this.handsOnTable.setDataAtCell(y, x, newValue);
					}
					catch (e) {
					}
				}

				// Update the totals on last columns and last row.
				this._updateSums(y, x)
			});

			// tell this.ngModelCtrl that the data was changed from HandsOnTable.
			this.ngModelCtrl.$setViewValue(this.handsOnTable.getData());
		}

		/**
		 * Render header and content with different styles.
		 */
		_handsOnTableCellRenderer(row, col, prop) {
			const numPartitions = this.partitions.length;

			// header
			if (col < this.distribution || row < numPartitions - this.distribution)
				return {
					readOnly: true,
					renderer: function (instance, td, row, col, prop, value, cellProperties) {
						Handsontable.renderers.TextRenderer.apply(this, arguments);
						td.style.color = 'black';
						td.style.background = '#eee';
					}
				};

			// total
			else if ((this.withSumX && col == this._width - 1) || (this.withSumY && row === this._height - 1))
				return { type: 'numeric', readOnly: true };

			// editable field
			else
				return {
					type: 'numeric',
					validator: function (value, callback) {
						callback(value === null || Number.isFinite(value))
					}
				};
		}

		_updateSums(editedY, editedX) {
			const numPartitions = this.partitions.length;
			let sum;

			const isSumX = this.withSumX && editedX === this._width - 1;
			const isSumY = this.withSumY && editedY === this._height - 1;

			// guard against infinite loop (the total update trigering another update etc...)
			if (this.withSumX && !isSumX) {
				sum = 0;
				for (let x = this.distribution; x < this._width - 1; ++x) {
					const val = this.handsOnTable.getDataAtCell(editedY, x);
					if (typeof val === 'number')
						sum += val;
				}
				this.handsOnTable.setDataAtCell(editedY, this._width - 1, sum);
			}

			if (this.withSumY && !isSumY) {
				sum = 0;
				for (let y = numPartitions - this.distribution; y < this._height - 1; ++y) {
					const val = this.handsOnTable.getDataAtCell(y, editedX);
					if (typeof val === 'number')
						sum += val;
				}
				this.handsOnTable.setDataAtCell(this._height - 1, editedX, sum);
			}

			if (this.withSumX && this.withSumY && !isSumX && isSumY) {
				sum = 0;
				for (let x = this.distribution; x < this._width - 1; ++x) {
					const val = this.handsOnTable.getDataAtCell(this._height - 1, x);
					if (typeof val === 'number')
						sum += val;
				}
				this.handsOnTable.setDataAtCell(this._height - 1, this._width - 1, sum);
			}
		}

		/**
		 * Convert input 1D table to handsontable 2D table with headers.
		 */
		_modelToView(modelValue) {
			// Special case! Having no partition does not cause having zero data fields
			if (this.partitions.length === 0)
				return [modelValue];

			// Clone modelValue to avoid detroying the original model
			modelValue = modelValue.slice();

			var viewValue = [];

			// Start by creating the headers.
			var colPartitions = this.partitions.slice(this.distribution),
				rowPartitions = this.partitions.slice(0, this.distribution);

			var topRows = this._makeHeaderRows(colPartitions);
			// super ugly hack so that _makeHeaderCols add the sum row only if relevant
			[this.withSumX, this.withSumY] = [this.withSumY, this.withSumX];

			var bodyRows = this._makeHeaderCols(rowPartitions);
			[this.withSumX, this.withSumY] = [this.withSumY, this.withSumX]; // restore variable to their proper values.

			// when distribution == 0, rowPartitions = [], and there is nowhere to enter the data.
			if (!bodyRows.length)
				bodyRows.push([])

			var dataColsPerRow = topRows.length ? topRows[0].length : 1;
			if (this.withSumX)
				dataColsPerRow -= 1;

			// Add data fields to bodyRows
			let accumulator;
			if (this.withSumY) {
				accumulator = new Array(dataColsPerRow);
				accumulator.fill(0);
			}

			bodyRows.forEach(bodyRow => {
				if (modelValue.length) {
					const data = modelValue.splice(0, dataColsPerRow)
					if (this.withSumX)
						data.push(data.reduce((m, e) => m + e, 0));

					bodyRow.push(...data);

					if (this.withSumY)
						for (var i = 0; i < dataColsPerRow; ++i)
							accumulator[i] += data[i];
				}
				else {
					if (!this.withSumY)
						throw new Error('should not happen');

					bodyRow.push(...accumulator)
					if (this.withSumX)
						bodyRow.push(accumulator.reduce((m, e) => m + e, 0))
				}
			});

			// Add empty field in the top-left corner for topRows
			topRows.forEach((topRow, index) => {
				for (var i = 0; i < rowPartitions.length; ++i)
					topRow.unshift('');
			});

			return [...topRows, ...bodyRows];
		}

		/**
		 * Convert 2D handsontable table with headers to 1D table that can be stored in input.
		 */
		_viewToModel(viewValue) {
			// Special case! Having no partition does not cause having zero data fields
			if (this.partitions.length === 0)
				return viewValue[0];

			const [minX, minY, maxX, maxY] = [
				this.distribution,
				this.partitions.length - this.distribution,
				viewValue[0].length - (this.withSumX ? 1 : 0),
				viewValue.length - (this.withSumY ? 1 : 0),
			];

			var modelValue = [];
			for (var y = minY; y < maxY; ++y)
				modelValue.push(...viewValue[y].slice(minX, maxX));

			return modelValue.map(v => v === '' ? null : v);
		}

		/**
		 * Helper to create the rows of the 2D array used by hands on table.
		 * This is a slightly changed version of pdf-export.js from the server, we should refactor this
		 * to make it smaller.
		 */
		_makeHeaderRows(partitions) {
			var totalCols = partitions.reduce((memo, tp) => memo * tp.elements.length, 1),
				currentColSpan = totalCols;

			var body = [];

			// Create header rows for top partitions
			partitions.forEach(tp => {
				// Update currentColSpan
				currentColSpan /= tp.elements.length;

				// Create header row
				var row = [];

				// Add one field for each element in tp, with current colspan
				for (var colIndex = 0; colIndex < totalCols; ++colIndex) {
					// Add field
					var tpe = tp.elements[(colIndex / currentColSpan) % tp.elements.length];
					row.push(tpe.name);

					// Add as many fillers as the colSpan value - 1
					var colLimit = colIndex + currentColSpan - 1;
					for (; colIndex < colLimit; ++colIndex)
						row.push("");
				}

				if (this.withSumX)
					row.push('Total');

				// push to body
				body.push(row);
			});

			return body;
		}

		/**
		 * Make the header columns on the left of the table.
		 * This function makes top rows, then rotate them.
		 */
		_makeHeaderCols(partitions) {
			const rows = this._makeHeaderRows(partitions);
			if (rows.length === 0)
				return [];

			var result = new Array(rows[0].length);

			for (var x = 0; x < rows[0].length; ++x) {
				result[x] = new Array(rows.length);

				for (var y = 0; y < rows.length; ++y) {
					result[x][y] = angular.copy(rows[y][x]);

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
});


export default module.name;

