"use strict";

angular.module('monitool.controllers.indicator', [])

	.controller('IndicatorListController', function($scope, hierarchy) {
		$scope.orderField = 'name';
		$scope.hierarchy = hierarchy;
	})
	
	.controller('IndicatorChooseController', function($scope, $modalInstance, forbiddenIds, hierarchy) {
		$scope.forbidden = forbiddenIds;
		$scope.hierarchy = hierarchy;

		$scope.choose = function(indicatorId) {
			$modalInstance.close(indicatorId);
		};

		$scope.cancel = function() {
			$modalInstance.dismiss()
		};
	})

	.controller('IndicatorEditController', function($state, $scope, $stateParams, $modal, mtFormula, mtFetch, indicator, indicatorsById, types, themes) {
		// Formula handlers
		$scope.addFormula = function() {
			var uuid  = PouchDB.utils.uuid().toLowerCase(),
				value = {name: '', expression: '', parameters: {}};

			$scope.indicator.formulas[uuid] = value;
		};

		$scope.deleteFormula = function(formulaId) {
			delete $scope.indicator.formulas[formulaId];
		};

		$scope.chooseIndicator = function(formulaId, symbol) {
			var usedIndicators = $scope.indicator.formulas[formulaId].__symbols.map(function(s) {
				return $scope.indicator.formulas[formulaId].parameters[s];
			}).filter(function(e) { return !!e; });
			usedIndicators.push(indicator._id);

			var indicatorId = $modal.open({
				templateUrl: 'partials/indicators/selector-popup.html',
				controller: 'IndicatorChooseController',
				size: 'lg',
				resolve: {
					forbiddenIds: function() { return usedIndicators; },
					hierarchy: function() { return mtFetch.themes({mode: "tree"}); }
				}
			}).result;

			indicatorId.then(function(indicatorId) {
				mtFetch.indicator(indicatorId).then(function(indicator) {
					$scope.indicatorsById[indicatorId] = indicator;
					$scope.indicator.formulas[formulaId].parameters[symbol] = indicatorId;
				});
			});
		};

		$scope.formulasAreValid = true;
		$scope.$watch('indicator.formulas', function() {
			$scope.formulasAreValid = true;
			for (var formulaId in $scope.indicator.formulas) {
				mtFormula.annotate($scope.indicator.formulas[formulaId]);
				if (!$scope.indicator.formulas[formulaId].__isValid)
					$scope.formulasAreValid = false;
			}
		}, true);

		// Form actions
		$scope.save = function() {
			// remove unused parameters
			for (var formulaId in $scope.indicator.formulas)
				mtFormula.clean($scope.indicator.formulas[formulaId]);

			// create random id if new indicator
			if ($stateParams.indicatorId === 'new')
				$scope.indicator._id = PouchDB.utils.uuid().toLowerCase();

			// persist
			$scope.indicator.$save(function() {
				$scope.master = angular.copy($scope.indicator);
				$state.go('main.indicators');
			});
		};

		$scope.isUnchanged = function() {
			return angular.equals($scope.master, $scope.indicator);
		};

		$scope.reset = function() {
			$scope.indicator = angular.copy($scope.master);
		};

		// init scope
		$scope.indicatorsById = indicatorsById;
		$scope.indicator = indicator;
		$scope.master = angular.copy(indicator);
		$scope.types = types;
		$scope.themes = themes;
	})
	
	.controller('IndicatorReportingController', function($scope, mtReporting, indicator, projects, indicatorsById) {
		$scope.indicator = indicator;
		$scope.projects  = projects;

		$scope.presentation = {display: 'value', plot: false, colorize: false};
		$scope.query = {
			type: "indicator",
			indicator: $scope.indicator,
			projects: $scope.projects.map(function(p) { return mtReporting.getAnnotatedProjectCopy(p, indicatorsById); }),
			begin: mtReporting.getDefaultStartDate(),
			end: mtReporting.getDefaultEndDate(),
			groupBy: 'month',
		};

		// h@ck
		$scope.dates = {begin: new Date($scope.query.begin), end: new Date($scope.query.end)};
		$scope.$watch("dates", function() {
			$scope.query.begin = moment($scope.dates.begin).format('YYYY-MM-DD');
			$scope.query.end = moment($scope.dates.end).format('YYYY-MM-DD');
		}, true);

		$scope.$on('languageChange', function(e) {
			$scope.dates = angular.copy($scope.dates);
		})

		$scope.inputs = [];
		$scope.$watch("[query.begin, query.end]", function() {
			mtReporting.getInputs($scope.query).then(function(inputs) {
				$scope.inputs = inputs;
			});
		}, true);

		// Update cols and data when grouping or inputs changes.
		$scope.$watch("[query.begin, query.end, query.groupBy, inputs]", function() {
			$scope.cols = mtReporting.getStatsColumns($scope.query);
			$scope.data = mtReporting.regroupIndicator($scope.inputs, $scope.query, indicatorsById);
		}, true);

		var chart = c3.generate({bindto: '#chart', data: {x: 'x', columns: []}, axis: {x: {type: "category"}}});
		$scope.plots = {};
		$scope.$watch('[plots, query.begin, query.end, query.groupBy, inputs, presentation.display]', function(newValue, oldValue) {
			var allEntityIds = [], removedEntityIds = [], idToName = {};
			$scope.query.projects.forEach(function(project) {
				newValue[0][project._id] && allEntityIds.push(project._id);
				!newValue[0][project._id] && oldValue[0][project._id] && removedEntityIds.push(project._id);
				idToName[project._id] = project.name;
				
				project.inputEntities.forEach(function(entity) {
					newValue[0][entity.id] && allEntityIds.push(entity.id);
					!newValue[0][entity.id] && oldValue[0][entity.id] && removedEntityIds.push(entity.id);
					idToName[entity.id] = entity.name;
				});
			});

			chart.load({
				type: 'line',
				unload: removedEntityIds.map(function(entityId) { return idToName[entityId]; }),
				columns: [
						['x'].concat($scope.cols.filter(function(e) { return e.id != 'total' }).map(function(e) { return e.name; }))
					]
					.concat(allEntityIds.map(function(entityId) {
						var column = [idToName[entityId]];
						$scope.cols.forEach(function(col) {
							if (col.id !== 'total') {
								if ($scope.data[entityId] && $scope.data[entityId][col.id] && $scope.data[entityId][col.id][indicator._id])
									column.push($scope.data[entityId][col.id][indicator._id][$scope.presentation.display] || 0);
								else
									column.push(0);
							}
						});
						return column;
					}))
			});

			$scope.imageFilename = [$scope.query.indicator.name, $scope.query.begin, $scope.query.end].join('_') + '.png';

		}, true);
	})
	