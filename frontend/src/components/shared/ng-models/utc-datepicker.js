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
	bindings: {
		minMode: '<',
		minDate: "<",
		maxDate: "<",
	},
	require: {
		ngModelCtrl: 'ngModel'
	},
	template: require(__templatePath),

	controller: class UtcDatepickerController {

		$onChanges() {
			this.datePickerOptions = {};

			if (this.minMode)
				this.datePickerOptions.minMode = this.minMode;
			if (this.minDate)
				this.datePickerOptions.minDate = this._modelToView(this.minDate);
			if (this.maxDate)
				this.datePickerOptions.maxDate = this._modelToView(this.maxDate);
		}

		$onInit() {
			this.ngModelCtrl.$formatters.push(modelValue => this._modelToView(modelValue));
			this.ngModelCtrl.$parsers.push(viewValue => this._viewToModel(viewValue));
			this.ngModelCtrl.$render = () => {
				this.localDate = this.ngModelCtrl.$viewValue;
			};
		}

		onValueChange() {
			this.ngModelCtrl.$setViewValue(this.localDate);
		}

		_modelToView(modelValue) {
			modelValue = new Date(modelValue + 'T00:00:00Z');
			modelValue = new Date(modelValue.getTime() + modelValue.getTimezoneOffset() * 60 * 1000);
			return modelValue;
		}

		_viewToModel(viewValue) {
			viewValue = new Date(viewValue.getTime() - viewValue.getTimezoneOffset() * 60 * 1000);
			viewValue = viewValue.toISOString().substring(0, 10);
			return viewValue;
		}
	}
});


export default module.name;
