import angular from 'angular';
import uiDatepickerPopup from 'angular-ui-bootstrap/src/datepickerPopup/index';

const module = angular.module(__moduleName, [uiDatepickerPopup]);

module.component('optionalDate', {
	require: {
		ngModelCtrl: 'ngModel'
	},

	template: require(__templatePath),

	bindings: {
		default: '<',
		message: '@'
	},

	controller: class OptionalDateController {

		$onInit() {
			this.ngModelCtrl.$render = () => {
				this.specifyDate = this.ngModelCtrl.$viewValue !== null;
				this.chosenDate = this.ngModelCtrl.$viewValue;
			};
		}

		toggleSpecifyDate() {
			this.specifyDate = !this.specifyDate;
			if (this.specifyDate)
				this.chosenDate = this.default;

			this.onDateChange();
		}

		onDateChange() {
			this.ngModelCtrl.$setViewValue(this.specifyDate ? this.chosenDate : null);
		}
	}
});


export default module.name;