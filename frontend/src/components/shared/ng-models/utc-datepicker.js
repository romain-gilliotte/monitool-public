import angular from 'angular';
import uiDatepickerPopup from 'angular-ui-bootstrap/src/datepickerPopup/index';

const module = angular.module(__moduleName, [uiDatepickerPopup]);

/**
 * Init datepicker modules
 */
module.config(function (uibDatepickerConfig, uibDatepickerPopupConfig) {
	uibDatepickerConfig.showWeeks = false;
	uibDatepickerConfig.startingDay = 1;
	uibDatepickerPopupConfig.showButtonBar = false;
});


// Work around bug in angular ui datepicker
// https://github.com/angular-ui/bootstrap/issues/6140
module.component(__componentName, {
	require: {
		ngModelCtrl: 'ngModel'
	},

	template: require(__templatePath),

	controller: class UtcDatepickerController {

		$onInit() {
			this.ngModelCtrl.$formatters.push(modelValue => {
				modelValue = new Date(modelValue + 'T00:00:00Z');
				modelValue = new Date(modelValue.getTime() + modelValue.getTimezoneOffset() * 60 * 1000);
				return modelValue;
			});

			this.ngModelCtrl.$parsers.push(viewValue => {
				viewValue = new Date(viewValue.getTime() - viewValue.getTimezoneOffset() * 60 * 1000);
				viewValue = viewValue.toISOString().substring(0, 10);
				return viewValue;
			});

			this.ngModelCtrl.$render = () => {
				this.localDate = this.ngModelCtrl.$viewValue;
			};
		}

		onValueChange() {
			this.ngModelCtrl.$setViewValue(this.localDate);
		}
	}
});


export default module.name;
