import angular from 'angular';
import { v4 as uuid } from 'uuid';

const module = angular.module(__moduleName, []);

module.component(__componentName, {
	bindings: {
		resolve: '<',
		modalInstance: '<',
		close: '&',
		dismiss: '&'
	},
	template: require(__templatePath),
	controller: class PartitionEditionModalController {

		constructor($scope, $filter) {
			this.translate = $filter('translate');
			this.$scope = $scope;
		}

		$onInit() {
			this.$scope.$on('modal.closing', event => {
				if (!this.isUnchanged() && !this.closedOnPurpose) {
					var question = this.translate('shared.sure_to_leave');
					var isSure = window.confirm(question);
					if (!isSure)
						event.preventDefault();
				}
			});
		}

		$onChanges(changes) {
			if (this.resolve.partition) {
				this.isNew = false;
				this.master = this.resolve.partition;
			}
			else {
				this.isNew = true;
				this.master = {
					id: uuid(),
					name: "",
					elements: [{ id: uuid(), name: "" }, { id: uuid(), name: "" }],
					groups: [],
					aggregation: "sum"
				};
			}

			this.partition = angular.copy(this.master);
			this.useGroups = !!this.partition.groups.length;
			this.closedOnPurpose = false;
		}

		isUnchanged() {
			return angular.equals(this.master, this.partition);
		}

		save() {
			this.closedOnPurpose = true;
			if (!this.useGroups)
				this.partition.groups.length = 0;

			this.close({ '$value': this.partition });
		}

		reset() {
			angular.copy(this.master, this.partition);
			this.useGroups = !!this.partition.groups.length;
		}

		createPartitionElement() {
			this.partition.elements.push({ id: uuid(), name: '' });
			this.partitionForm.$setValidity('elementLength', this.partition.elements.length >= 2);
		}

		deletePartitionElement(peId) {
			// Remove from element list
			this.partition.elements = this.partition.elements.filter(e => e.id !== peId);

			// Remove from all groups
			this.partition.groups.forEach(group => {
				group.members = group.members.filter(id => id !== peId);
			});

			this.partitionForm.$setValidity('elementLength', this.partition.elements.length >= 2);
		}

		createGroup() {
			this.partition.groups.push({ id: uuid(), name: '', members: [] });
		}

		deleteGroup(pgId) {
			this.partition.groups = this.partition.groups.filter(g => g.id !== pgId);
		}

		onChangeStatusClicked(newStatus) {
			this.partition.active = newStatus;
		}

		delete() {
			this.closedOnPurpose = true;
			this.close();
		}

	}
});


export default module.name;
