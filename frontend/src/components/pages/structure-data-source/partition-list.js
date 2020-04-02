import angular from 'angular';
import uiModal from 'angular-ui-bootstrap/src/modal';

import mtPartitionEdition from './partition-edition-modal';

const module = angular.module(__moduleName, [uiModal, mtPartitionEdition]);

module.component(__componentName, {
	bindings: {
		'readOnlyPartitions': '<partitions',
		'onUpdate': '&'
	},
	template: require(__templatePath),
	controller: class PartitionListController {

		constructor($uibModal) {
			this.$uibModal = $uibModal;
		}

		$onChanges(changes) {
			this.partitions = angular.copy(this.readOnlyPartitions)
		}

		editPartition(partition) {
			this.$uibModal
				.open({
					component: 'partitionEditionModal',
					size: 'lg',
					resolve: {
						partition: () => partition
					}
				})
				.result
				.then(newPartition => {
					if (newPartition)
						angular.copy(newPartition, partition);
					else
						this.partitions.splice(this.partitions.indexOf(partition), 1);

					this.onUpdate({ partitions: this.partitions });
				})
				.catch(e => { });
		};

		addPartition() {
			this.$uibModal
				.open({
					component: 'partitionEditionModal',
					size: 'lg'
				})
				.result
				.then(newPartition => {
					this.partitions.push(newPartition);

					console.log('added')
					this.onUpdate({ partitions: this.partitions });
				})
				.catch(e => { });
		};
	}
});

export default module.name;
