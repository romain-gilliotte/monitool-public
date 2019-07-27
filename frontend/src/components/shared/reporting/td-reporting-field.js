import angular from 'angular';

import mtIndicatorUnit from '../../../filters/indicator';

const module = angular.module(
	'monitool.components.shared.reporting.field',
	[
		mtIndicatorUnit
	]
);


module.directive('tdReportingField', function() {
	return {
		controllerAs: '$ctrl',
		restrict: 'A',
		scope: {}, // Isolate

		bindToController: {
			value: '<',
			indicator: '<',
		},

		template: '{{$ctrl.display}}<i ng-if="$ctrl.logo" class="fa" ng-class="$ctrl.logo" title="{{$ctrl.value}}"></i>',

		controller: class ReportingFieldController {

			constructor($element, $filter, $sce) {
				this.$sce = $sce;
				this.$element = $element;
				this.indicatorUnit = $filter('indicatorUnit');
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

					const ind = this.indicator;

					// Make color
					if (ind && ind.colorize && ind.baseline !== null && ind.target !== null) {
						let progress = (this.value - ind.baseline) / (ind.target - ind.baseline);
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
					const unit = this.indicatorUnit(this.indicator);
					if (unit)
						this.display = this.display + unit;
				}
				else {
					this.logo = 'fa-question-circle';
					this.value = this.value + '';
					this.$element.css('background-color', '');
				}
			}
		}
	}
});

export default module.name;

