
import angular from 'angular';
import { getQueryDimensions } from '../../../helpers/query-builder';

const module = angular.module(__moduleName, []);

module.component(__componentName, {

	bindings: {
		project: '<',
		query: '<',

		onUpdate: '&'
	},

	template: require(__templatePath),

	controller: class OlapDimensionsController {

		$onChanges(changes) {
			if (changes.query) {
				this.selected = { rows: [], cols: [] };
				this.showTotals = false;
				this.choices = this._makeChoices();

				this._makeRowColsList();
				this.triggerUpdate();
			}
		}

		/** Tell parent component about the changes. */
		triggerUpdate() {
			this.onUpdate({
				aggregate: [...this.selected.rows, ...this.selected.cols].map(({ id, attribute }) => ({ id, attribute })),
				distribution: this.selected.rows.length,
				showTotals: this.showTotals
			});
		}

		/** Event triggered when rows or columns change */
		onSelectUpdate() {
			this._makeRowColsList();
			this.triggerUpdate();
		}

		/** Build the list of possibles rows and columns for the table (from the dimension attributes). */
		_makeChoices() {
			const dimensions = getQueryDimensions(this.project, this.query, false, false);

			return dimensions.reduce((m, dimension) => [
				...m,
				...dimension.attributes.map(attribute => ({
					$$hashKey: `${dimension.id}.${attribute}`,
					id: dimension.id,
					attribute,
					label: dimension.id == 'time' ?
						`project.dimensions.${attribute}` :
						`${dimension.label}`
				}))
			], []);
		}

		/**
		 * Update the list of possible rows and columns, depending on which are selected
		 * in either one.
		 */
		_makeRowColsList() {
			const selectedChoices = [...this.selected.rows, ...this.selected.cols];

			this.availableCols = this.choices.filter(choice =>
				this.selected.cols.includes(choice) ||
				!selectedChoices.find(selected => selected.id == choice.id)
			);

			this.availableRows = this.choices.filter(choice =>
				this.selected.rows.includes(choice) ||
				!selectedChoices.find(selected => selected.id == choice.id)
			);
		}
	}
});

export default module.name;
