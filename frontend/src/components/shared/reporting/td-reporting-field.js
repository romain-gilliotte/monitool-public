import angular from 'angular';

const module = angular.module(__moduleName, []);

module.directive(__componentName, function () {
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

		controller: class {

			constructor($element) {
				"ngInject";

				this.$element = $element;
			}

			$onChanges(changes) {
				if (this.value) {
					let { v: value, c: complete, r: raw } = this.value;

					const text = this._getText(value, complete, raw)
					this.$element.html(text);

					const color = this._getColor(value, complete, raw);
					this.$element.css('background-color', color);

					const title = this._getTitle(value, complete, raw);
					if (title) this.$element.attr('title', title);
					else this.$element.removeAttr('title');

					const fontStyle = complete ? 'inherit' : 'italic';
					this.$element.css('font-style', fontStyle);
				}
				else {
					this.$element.html('');
					this.$element.css('background-color', '#eee');
					this.$element.removeAttr('title');
					this.$element.css('font-style', 'inherit');
				}
			}

			_getText(value, complete, raw) {
				if (value === null) {
					if (complete)
						return '<i class="fa fa-exclamation"></i>';
					else
						return '<i class="fa fa-question-circle-o"></i>';
				}
				else if (typeof value === 'number') {
					// Split value by thousands
					let text = Math.round(value).toString();
					if (text !== 'Infinity') {
						let splitted = '';
						while (text.length > 0) {
							splitted = '.' + text.substr(-3) + splitted;
							text = text.substr(0, text.length - 3);
						}
						text = splitted.substring(1);
					}

					if (!raw)
						text = '≈&nbsp;' + text;

					if (this.unit)
						text = text + this.unit;

					return text;
				}

				return '';
			}

			_getColor(value, complete, raw) {
				if (typeof value === 'number' && this.colorize && this.baseline !== null && this.target !== null) {
					let progress = (value - this.baseline) / (this.target - this.baseline);
					progress = Math.max(0, progress);
					progress = Math.min(1, progress);

					return 'hsl(' + progress * 120 + ', 100%, 75%)';
				}

				return '';
			}

			_getTitle(value, complete, raw) {
				if (value === null) {
					if (complete)
						return 'Division by zero';
					else
						return 'This value cannot be computed because the data entry was not done.';
				}
				else if (typeof value === 'number') {
					if (!raw && !complete)
						return 'This value was computed from data which is interpolated and incomplete.';
					else if (!raw)
						return 'This value was computed from data which is interpolated.';
					else if (!complete)
						return 'This value was computed from data which is incomplete.';
				}
			}
		}
	}
});

export default module.name;

