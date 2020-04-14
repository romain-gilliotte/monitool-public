import angular from 'angular';
import uiModal from 'angular-ui-bootstrap/src/modal';
import mtPartitionEdition from './partition-edition-modal';
require(__cssPath);

const module = angular.module(__moduleName, [uiModal, mtPartitionEdition]);

module.component(__componentName, {
	bindings: {
		'readOnlyPartitions': '<partitions',
		'onUpdate': '&'
	},
	template: require(__templatePath),
	controller: class {

		constructor($uibModal) {
			this.$uibModal = $uibModal;
		}

		$onChanges() {
			this.partitions = angular.copy(this.readOnlyPartitions)
		}

		async addPartition() {
			if (this.partitions.length >= 5)
				return;

			const modalOpt = { component: 'partitionEditionModal', size: 'lg' };

			try {
				const newPartition = await this.$uibModal.open(modalOpt).result;
				this.partitions.push(newPartition);

				this.onUpdate({ partitions: this.partitions });
			}
			catch (e) {
			}
		}

		async editPartition(partition) {
			const modalOpt = {
				component: 'partitionEditionModal',
				size: 'lg',
				resolve: { partition: () => partition }
			}

			try {
				const newPartition = await this.$uibModal.open(modalOpt).result;
				if (newPartition)
					angular.copy(newPartition, partition);
				else
					this.partitions.splice(this.partitions.indexOf(partition), 1);

				this.onUpdate({ partitions: this.partitions });
			}
			catch (e) {
			}
		}
	}
});

export default module.name;
