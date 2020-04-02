import angular from 'angular';

const module = angular.module(__moduleName, []);

module.component(__componentName, {
	require: {
		ngModelCtrl: 'ngModel'
	},

	template: require(__templatePath),

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
