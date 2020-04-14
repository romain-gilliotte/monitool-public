import angular from 'angular';
import range from 'lodash.range';
require(__cssPath);

const module = angular.module(__moduleName, []);

module.component(__componentName, {
	require: {
		'ngModelCtrl': 'ngModel',
	},
	bindings: {
		numPartitions: '<'
	},
	template: require(__templatePath),

	controller: class PartitionDistributionController {

		$onChanges(changes) {
			// ... we check that current distribution is valid.
			if (this.distribution > this.numPartitions)
				this.distribution = 0;

			// ... we redraw the tables when the user changes the number of partitions.
			this.distributions = [];

			for (var i = 0; i <= this.numPartitions; ++i) {
				this.distributions.push({
					value: i,

					// Unique identifier used for each radio. This is to match the label with each radio.
					radioId: 'i_' + Math.random().toString().slice(2),

					// rows and cols for this table.
					leftCols: range(0, i),
					headerRows: range(i, this.numPartitions)
				});
			}
		}

		$onInit() {
			// This unique identifier used for the radio name. This is the same for all radios.
			this.radioName = 'i_' + Math.random().toString().slice(2);

			// To render the ngModelController, we just pass the distribution value to the scope.
			this.ngModelCtrl.$render = () => {
				this.distribution = this.ngModelCtrl.$viewValue;
			};
		}

		onValueChange() {
			this.ngModelCtrl.$setViewValue(this.distribution);
		}
	}
});


export default module.name;