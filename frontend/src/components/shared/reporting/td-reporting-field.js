import angular from 'angular';

const module = angular.module(
	'monitool.components.shared.reporting.field',
	[
	]
);


module.directive('tdReportingField', function () {
	return {
		controllerAs: '$ctrl',
		restrict: 'A',
		scope: {}, // Isolate

		bindToController: {
			value: '<',
			baseline: '<',
			target: '<',
			colorize: '<',
			unit: '<'
		},

		template: '{{$ctrl.display}}<i ng-if="$ctrl.logo" class="fa" ng-class="$ctrl.logo" title="{{$ctrl.value}}"></i>',

		controller: class ReportingFieldController {

			constructor($element, $filter, $sce) {
				this.$sce = $sce;
				this.$element = $element;
			}

			$onChanges(changes) {
				// Reset bgcolor
				this.$element.css('background-color', '');

				if (this.value === undefined) {
					this.display = '';
					this.$element.css('background-color', '#eee');
					this.logo = null;
				}

				else if (typeof this.value === "string") {
					this.display = '';
					this.logo = 'fa-ban';
				}

				else if (typeof this.value === "number" && isNaN(this.value)) {
					this.display = '';
					this.logo = 'fa-exclamation-triangle';
				}

				else if (typeof this.value === "number") {
					this.logo = null;

					// Make color
					if (this.colorize && this.baseline !== null && this.target !== null) {
						let progress = (this.value - this.baseline) / (this.target - this.baseline);
						progress = Math.max(0, progress);
						progress = Math.min(1, progress);

						this.$element.css('background-color', 'hsl(' + progress * 120 + ', 100%, 75%)');
					}

					// Split value by thousands
					let value = Math.round(this.value).toString();
					if (value !== 'Infinity') {
						this.display = '';
						while (value.length !== 0) {
							this.display = '.' + value.substr(-3) + this.display;
							value = value.substr(0, value.length - 3);
						}
						this.display = this.display.substring(1);
					}
					else
						this.display = value;

					// Add unit
					if (this.unit)
						this.display = this.display + this.unit;
				}
				else {
					this.logo = 'fa-question-circle-o';
					this.value = this.value + '';
					this.$element.css('background-color', '');
				}
			}
		}
	}
});

export default module.name;

