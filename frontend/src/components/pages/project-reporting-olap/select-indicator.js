import angular from 'angular';


const module = angular.module(
	'monitool.components.shared.reporting.select-indicator',
	[
	]
);


module.component('selectIndicator', {
	bindings: {
		project: '<', // To get the indicators
		onUpdate: '&'
	},
	template: require('./select-indicator.html'),
	controller: class IndicatorSelectController {

		constructor($rootScope, $filter) {
			this.language = $rootScope.language;
			this.translate = $filter('translate');
		}

		$onChanges(changes) {
			this.elementOptions = this._computeChoices();
			this.chosenElement = this.elementOptions[0];

			this.onUpdate({
				indicator: this.chosenElement.indicator,
				logicalFramework: this.chosenElement.logicalFramework
			});
		}

		_computeChoices() {
			const choices = [];

			this.project.logicalFrames.forEach(logicalFrame => {
				var fn = indicator => {
					return {
						name: indicator.display,
						group: this.translate('project.logical_frame') + ": " + logicalFrame.name,
						logicalFramework: logicalFrame,
						indicator: indicator
					};
				};

				choices.push(...logicalFrame.indicators.map(fn));
				logicalFrame.purposes.forEach(purpose => {
					choices.push(...purpose.indicators.map(fn));
					purpose.outputs.forEach(output => {
						choices.push(...output.indicators.map(fn));
						output.activities.forEach(activity => {
							choices.push(...activity.indicators.map(fn));
						});
					});
				});
			});

			this.project.extraIndicators.forEach(indicator => {
				choices.push({
					name: indicator.display,
					group: this.translate('indicator.extra'),
					indicator: indicator
				});
			});

			this.project.forms.forEach(dataSource => {
				dataSource.elements.forEach(variable => {
					choices.push({
						name: variable.name,
						group: this.translate('project.collection_form') + ": " + dataSource.name,
						indicator: {
							display: variable.name,
							baseline: null,
							target: null,
							computation: {
								formula: 'a',
								parameters: {
									a: {
										elementId: variable.id,
										filter: {}
									}
								}
							}
						}
					});
				});
			});

			return choices.filter(choice => choice.indicator.computation && Object.keys(choice.indicator.computation.parameters).length);
		}
	}
});

export default module.name;

