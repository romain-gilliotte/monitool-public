
import angular from 'angular';
import uuid from 'uuid/v4';

import mtIndicatorsTbody from './tbody-indicators';

const module = angular.module(
	'monitool.components.pages.project.reporting_general.table',
	[
		mtIndicatorsTbody,
	]
);


module.component('generalTable', {
	bindings: {
		project: '<',

		filter: '<',
		groupBy: '<',
		columns: '<',

		onPlotToggle: '&'
	},
	template: require('./table.html'),
	controller: class GeneralTableController {

		constructor($rootScope, $element, $scope) {
			this._element = angular.element($element);
			this.language = $rootScope.language;
			this.$scope = $scope;
		}

		$onInit() {
			this._binded = this._onScroll.bind(this);
			this._element.bind('scroll', this._binded);
		}

		$onChanges(changes) {
			// Refresh columns when the query changes.
			// if (changes.groupBy || changes.filter)
			// 	this.columns = this._computeColumns();

			if (changes.project)
				this.tbodies = this._computeTBodies();

			if (changes.filter)
				this._updateFilters();
		}

		$onDestroy() {
			this._element.unbind('scroll', this._binded);
		}

		_onScroll() {
			this.headerStyle = {
				transform: 'translate(0, ' + this._element[0].scrollTop + 'px)'
			};

			this.firstColStyle = {
				transform: 'translate(' + this._element[0].scrollLeft + 'px)'
			};

			this.$scope.$apply();
		}

		_updateFilters() {
			this.tbodies.forEach(tbody => {
				const logFrame = this.project.logicalFrames.find(lf => lf.id == tbody.id);
				if (!logFrame) {
					tbody.filter = this.filter;
					return;
				}

				tbody.filter = Object.assign({}, this.filter);
				if (logFrame.start && (!tbody.filter._start || tbody.filter._start < logFrame.start))
					tbody.filter._start = logFrame.start;
				if (logFrame.end && (!tbody.filter._end || tbody.filter._end > logFrame.end))
					tbody.filter._end = logFrame.end;

				if (tbody.filter.entity)
					tbody.filter.entity = logFrame.entities.filter(e => tbody.filter.entity.includes(e));
				else
					tbody.filter.entity = logFrame.entities;

			});
		}

		_computeTBodies() {
			return [
				...this.project.logicalFrames.map(lf => this._logicalFrameworkToTbody(lf)),
				this._extraIndicatorsToTbody(),
				...this.project.forms.map(ds => this._dataSourceToTbody(ds))
			].filter(tbody => tbody.sections.some(s => !!s.indicators.length));
		}

		_logicalFrameworkToTbody(logicalFramework) {
			const tbody = {
				id: logicalFramework.id,
				prefix: 'project.logical_frame',
				name: logicalFramework.name,
				sections: []
			};

			tbody.sections.push({
				id: logicalFramework.id,
				prefix: 'project.goal',
				name: logicalFramework.goal,
				indicators: logicalFramework.indicators.map(i => Object.assign({}, i, {id: uuid()})),
				indent: 0
			});

			logicalFramework.purposes.forEach(purpose => {
				tbody.sections.push({
					id: uuid(),
					prefix: 'project.purpose',
					name: purpose.description,
					indicators: purpose.indicators.map(i => Object.assign({}, i, {id: uuid()})),
					indent: 1
				});

				purpose.outputs.forEach(output => {
					tbody.sections.push({
						id: uuid(),
						prefix: 'project.output',
						name: output.description,
						indicators: output.indicators.map(i => Object.assign({}, i, {id: uuid()})),
						indent: 2
					});

					output.activities.forEach(activity => {
						tbody.sections.push({
							id: uuid(),
							prefix: 'project.activity',
							name: activity.description,
							indicators: activity.indicators.map(i => Object.assign({}, i, {id: uuid()})),
							indent: 3
						});
					});
				});
			});

			return tbody;
		}

		_extraIndicatorsToTbody() {
			return {
				id: "extra",
				name: 'indicator.extra',
				sections: [
					{
						id: uuid(),
						indent: 0,
						indicators: this.project.extraIndicators.map(ind => {
							return Object.assign({}, ind, {id: uuid()})
						})
					}
				]
			};
		}

		_dataSourceToTbody(dataSource) {
			return {
				id: dataSource.id,
				prefix: 'project.collection_form',
				name: dataSource.name,
				sections: [
					{
						id: dataSource.id,
						indent: 0,
						indicators: dataSource.elements.map(variable => {
							// create fake indicators from the variables
							return {
								id: variable.id,
								colorization: false,
								baseline: null,
								target: null,
								display: variable.name,
								computation: {
									formula: 'a',
									parameters: {
										a: {
											elementId: variable.id,
											filter: {}
										}
									}
								}
							};
						})
					}
				]
			};
		}
	}
});


export default module.name;
