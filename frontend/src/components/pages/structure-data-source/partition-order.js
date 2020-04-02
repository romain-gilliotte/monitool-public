import angular from 'angular';
import { range } from '../../../helpers/array';
require(__cssPath);

const module = angular.module(__moduleName, []);

module.component(__componentName, {
	bindings: {
		partitions: '<',
		distribution: '<',
		onUpdate: '&'
	},
	template: require(__templatePath),

	controller: class PartitionOrderController {

		$onChanges(changes) {
			// Make an editable version of the partitions (one way data bindings).
			this.editablePartitions = angular.copy(this.partitions);

			// Tell the template about the table layout
			this.table = {
				// rows and cols for this table.
				leftCols: range(0, this.distribution),
				headerRows: range(this.distribution, this.partitions.length)
			};

			// Update size in the table cell
			const width = this.table.headerRows.reduce((m, i) => m * this.partitions[i].elements.length, 1);
			const height = this.table.leftCols.reduce((m, i) => m * this.partitions[i].elements.length, 1);
			this.size = width + 'x' + height;
		}

		// We do not allow values to be present 2 times in the list.
		onValueChange(index) {
			const missing = this.partitions.find(p => !this.editablePartitions.find(op => op.id === p.id));
			const dupIndex = this.editablePartitions.findIndex((op, i) => i !== index && op.id === this.editablePartitions[index].id);

			this.editablePartitions[dupIndex] = angular.copy(missing);
			this.onUpdate({ partitions: this.editablePartitions });
		}
	}
});


export default module.name;
