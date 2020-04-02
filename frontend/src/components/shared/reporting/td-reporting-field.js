import angular from 'angular';


const module = angular.module(__moduleName, []);

module.directive('tdReportingField', function () {
	return {
		controllerAs: '$ctrl',
		restrict: 'A',
		scope: {}, // Isolate

		bindToController: {
			interpolated: '<',
			incomplete: '<',
			value: '<',
			baseline: '<',
			target: '<',
			colorize: '<',
			unit: '<'
		},

		template: '<span ng-bind-html="$ctrl.display"></span><i ng-if="$ctrl.logo" class="fa" ng-class="$ctrl.logo"></i>',

		controller: class ReportingFieldController {

			constructor($element, $filter, $sce) {
				this.$sce = $sce;
				this.$element = $element;
			}

			$onChanges(changes) {
				// Reset bgcolor
				this.$element.css('background-color', '');
				this.display = '';
				this.logo = null;

				if (this.value === undefined) {
					this.$element.css('background-color', '#eee');
				}
				else if (this.value === null) {
					// Can either be because the value is NaN, or because the data entry is missing.
					// fixme: differenciate those.
					this.logo = 'fa-question-circle-o';
					this.$element.attr('title', 'This value cannot be computed because the data entry was not done.');
				}
				else if (typeof this.value === "number") {
					// Make color
					if (this.colorize && this.baseline !== null && this.target !== null) {
						let progress = (this.value - this.baseline) / (this.target - this.baseline);
						progress = Math.max(0, progress);
						progress = Math.min(1, progress);

						this.$element.css('background-color', 'hsl(' + progress * 120 + ', 100%, 75%)');
					}

					this.$element.css('font-style', this.incomplete ? 'italic' : 'inherit');

					if (this.interpolated && this.incomplete)
						this.$element.attr('title', 'This value was computed from data which is interpolated and incomplete.');
					else if (this.interpolated)
						this.$element.attr('title', 'This value was computed from data which is interpolated.');
					else if (this.incomplete)
						this.$element.attr('title', 'This value was computed from data which is incomplete.');
					else
						this.$element.removeAttr('title');

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

					if (this.interpolated) {
						this.display = '≈&nbsp;' + this.display;
					}

					// Add unit
					if (this.unit)
						this.display = this.display + this.unit;

					this.display = this.$sce.trustAsHtml(this.display)
				}
			}
		}
	}
});

export default module.name;

