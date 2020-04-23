import angular from 'angular';
require(__cssPath);

const module = angular.module(__moduleName, []);

module.component(__componentName, {
	bindings: {
		partitions: '<',
		distribution: '<',
		onUpdate: '&'
	},
	template: require(__templatePath),

	controller: class {

		$onChanges(changes) {
			// Make an editable version of the partitions (one way data bindings).
			this.editablePartitions = angular.copy(this.partitions);
			this.numActiveElements = {};
			this.editablePartitions.forEach(p => this.numActiveElements[p.id] = p.elements.filter(e => e.active).length);

			this.availablePartitions = this.editablePartitions.filter(p => p.active);

			// Tell the template about the table layout
			const indexes = this.partitions.map((p, i) => p.active ? i : -1).filter(i => i !== -1);
			this.table = {
				// rows and cols for this table.
				leftCols: indexes.slice(0, this.distribution),
				headerRows: indexes.slice(this.distribution)
			};

			// Update size in the table cell
			const width = this.table.headerRows.reduce((m, i) => m * this.numActiveElements[this.partitions[i].id], 1);
			const height = this.table.leftCols.reduce((m, i) => m * this.numActiveElements[this.partitions[i].id], 1);
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
