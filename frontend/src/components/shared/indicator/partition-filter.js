import angular from 'angular';

const module = angular.module(__moduleName, []);

module.component('partitionFilter', {
	require: {
		ngModelCtrl: 'ngModel'
	},

	bindings: {
		variable: '<'
	},

	template: require(__templatePath),

	controller: class PartitionFilterController {

		$onInit() {
			this.ngModelCtrl.$parsers.push(this._viewToModel.bind(this));
			this.ngModelCtrl.$formatters.push(this._modelToView.bind(this));
			this.ngModelCtrl.$render = () => this.filter = this.ngModelCtrl.$viewValue;
		}

		$onChanges(changes) {
			if (changes.variable) {
				this.filter = {};

				if (this.variable)
					this.variable.partitions.forEach(partition => {
						this.filter[partition.id] = partition.elements.map(e => e.id);
					});
			}
		}

		onFilterChange() {
			this.ngModelCtrl.$setViewValue(angular.copy(this.filter));
		}

		_viewToModel(viewValue) {
			var modelValue = {};

			if (this.variable)
				this.variable.partitions.forEach(partition => {
					if (viewValue[partition.id].length !== partition.elements.length)
						modelValue[partition.id] = viewValue[partition.id];
				});

			return modelValue;
		}

		_modelToView(modelValue) {
			var viewValue = {};

			if (this.variable)
				this.variable.partitions.forEach(partition => {
					if (modelValue[partition.id])
						viewValue[partition.id] = modelValue[partition.id];
					else
						viewValue[partition.id] = partition.elements.map(e => e.id);
				});

			return viewValue;
		}
	}
});


export default module.name;
