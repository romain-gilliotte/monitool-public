import angular from 'angular';

const module = angular.module(
	'monitool.components.ng-models.number-optional',
	[
	]
);


module.component('optionalNumber', {
	require: {
		ngModelCtrl: 'ngModel'
	},

	template: require('./number-optional.html'),

	bindings: {
		default: '<',
		message: '@'
	},

	controller: class OptionalNumberController {

		$onInit() {
			this.ngModelCtrl.$render = () => {
				this.specifyValue = this.ngModelCtrl.$viewValue !== null;
				this.chosenValue = this.ngModelCtrl.$viewValue;
			};
		}

		toggleSpecifyValue() {
			this.specifyValue = !this.specifyValue;
			if (this.specifyValue)
				this.chosenValue = this.default;

			this.onValueChange();
		}

		onValueChange() {
			this.ngModelCtrl.$setViewValue(this.specifyValue ? this.chosenValue : null);
		}
	}
});


export default module.name;
