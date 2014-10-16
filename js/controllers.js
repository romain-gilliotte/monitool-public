"use strict";

var monitoolControllers = angular.module('MonitoolControllers', ['MonitoolServices', 'ui.bootstrap', 'ui.select']);


var period = function(date) {
	var month = date.getMonth() + 1,
		year  = date.getFullYear();

	return year + '-' + (month < 10 ? '0' : '') + month;
};



monitoolControllers.controller('MenuController', function($scope, $location) {
	$scope.routes = [
		{path: '#projects', name: "Projets"},
		{path: '#indicators', name: "Catalogue Indicateurs"},
		{path: '#inputs', name: "Saisies en attente"},
		{path: '#reporting', name: "Consultation"},
	];

	$scope.isSelected = function(route) {
		return route.path.substring(1) !== $location.path().substring(1);
	};

	$scope.isVisible = function(route) {
		return true;
	};
});

monitoolControllers.controller('SubMenuController', function($scope, $routeParams, $location) {
	$scope.projectId = $routeParams.projectId;

	// this is wrong: it will get called a LOT for not much.
	$scope.isSelected = function(suffix) {
		var path = $location.path();
		return path.substring(path.length - suffix.length) === suffix;
	};
});


///////////////////////////
// Project
///////////////////////////

monitoolControllers.controller('ProjectListController', function($scope, $location, mtDatabase) {
	mtDatabase.query('monitool/by_type', {include_docs: true, key: 'project'}).then(function(projects) {
		$scope.projects = projects.rows.map(function(row) { return row.doc; });
	});

	$scope.create = function() {
		$location.url('/projects/' + PouchDB.utils.uuid().toLowerCase());
	};
});

monitoolControllers.controller('ProjectDescriptionController', function($scope, $routeParams, $q, mtDatabase) {
	$scope.beginMode = $scope.endMode = 'month';

	mtDatabase.get($routeParams.projectId).then(function(master) {
		$scope.master = master;
	})
	.catch(function(error) {
		$scope.master = {_id: $routeParams.projectId, type: 'project'};
	})
	.finally(function() {

		$scope.update = function(project) {
			$scope.master = angular.copy(project);
			mtDatabase.put($scope.master).then(function(project) {
				$scope.master._rev = $scope.project._rev = project.rev;
			});
		};

		$scope.reset = function() {
			$scope.project = angular.copy($scope.master);
		};

		$scope.reset();
	});
});

monitoolControllers.controller('ProjectCenterListController', function($scope, $routeParams, $q, mtDatabase) {
	$q.all([
		mtDatabase.get($routeParams.projectId),
		mtDatabase.query(
			'monitool/num_inputs_by_project_center',
			{
				startkey: [$routeParams.projectId],
				endkey: [$routeParams.projectId, {}],
				group: true,
				group_level: 2
			}
		)
	]).then(function(result) {
		$scope.project = result[0];
		$scope.usage = {};

		result[1].rows.forEach(function(row) {
			$scope.usage[row.key[1]] = row.value;
		});
	});

	$scope.delete = function(centerId) {
		delete $scope.project.center[centerId];
		mtDatabase.put($scope.project).then(function(result) {
			$scope.project._rev = result.rev;
		});
	};

	$scope.create = function() {
		var newCenterName = $scope.newCenter ? $scope.newCenter.trim() : '';
		$scope.newCenter = '';

		if (!newCenterName || !newCenterName.length)
			return;

		for (var key in $scope.project.center)
			if ($scope.project.center[key].name === newCenterName)
				return;

		$scope.project.center[PouchDB.utils.uuid().toLowerCase()] = {name: newCenterName};
		mtDatabase.put($scope.project).then(function(result) {
			$scope.project._rev = result.rev;
		})
	};
});

monitoolControllers.controller('ProjectIndicatorListController', function($scope, $routeParams, $q, mtDatabase, $location) {
	mtDatabase.get($routeParams.projectId).then(function(project) {
		var usageQuery = mtDatabase.query(
			'monitool/num_inputs_by_project_indicator',
			{ startkey: [$routeParams.projectId], endkey: [$routeParams.projectId, {}], group: true, group_level: 2 }
		);

		var indicatorsQuery = mtDatabase.allDocs({keys: Object.keys(project.planning || {}), include_docs: true});

		$q.all([indicatorsQuery, usageQuery]).then(function(result) {
			$scope.project = project;
			$scope.indicators = {};
			$scope.usage = {};

			result[0].rows.forEach(function(indicator) {
				$scope.indicators[indicator.id] = indicator.doc;
			});

			result[1].rows.forEach(function(row) {
				$scope.usage[row.key[1]] = row.value;
			});
		});
	});

	$scope.create = function() {
		$location.url('/projects/' + $scope.project._id + '/indicators/' + PouchDB.utils.uuid().toLowerCase());
	};
});

monitoolControllers.controller('ProjectIndicatorEditController', function($scope) {

});

monitoolControllers.controller('ProjectUserListController', function($scope) {

});

monitoolControllers.controller('ProjectUserEditController', function($scope) {
	mtDatabase.get($routeParams.projectId).then(function(master) {
		$scope.project = project;
	});

});



///////////////////////////
// Indicators
///////////////////////////

monitoolControllers.controller('IndicatorListController', function($scope, $q, mtDatabase) {
	$q.all([
		mtDatabase.query('monitool/by_type', {key: 'indicator', include_docs: true}),
		mtDatabase.query('monitool/by_type', {key: 'type', include_docs: true}),
		mtDatabase.query('monitool/by_type', {key: 'theme', include_docs: true}),
		mtDatabase.query('monitool/indicator_usage', {group: true})
	]).then(function(result) {
		var usage = usage = {};
		result[3].rows.forEach(function(row) { usage[row.key] = row.value; });

		$scope.hierarchy = {};
		result[0].rows.forEach(function(row) {
			var indicator = row.doc;
			indicator.usage = usage[indicator._id] || 0;

			indicator.themes.forEach(function(theme) {
				indicator.types.forEach(function(type) {
					if (!$scope.hierarchy[theme])
						$scope.hierarchy[theme] = {};

					if (!$scope.hierarchy[theme][type])
						$scope.hierarchy[theme][type] = [];

					$scope.hierarchy[theme][type].push(indicator);
				});
			});

			return row.doc;
		});

		$scope.types = {};
		result[1].rows.forEach(function(row) { return $scope.types[row.id] = row.doc; });

		$scope.themes = {};
		result[2].rows.forEach(function(row) { return $scope.themes[row.id] = row.doc; });
	});
});

monitoolControllers.controller('IndicatorEditController', function($scope) {

});

/**
 * this controller and theme controller are the same, factorize it!
 */
monitoolControllers.controller('TypeListController', function($q, $scope, mtDatabase) {
	$q.all([
		mtDatabase.query('monitool/by_type', {key: 'type', include_docs: true}),
		mtDatabase.query('monitool/type_usage', {group: true})
	]).then(function(result) {
		$scope.types = result[0].rows.map(function(row) { return row.doc; });
		$scope.usage = {};
		result[1].rows.forEach(function(row) {
			$scope.usage[row.key] = row.value;
		});
	});

	$scope.add = function() {
		var newType = {_id: PouchDB.utils.uuid().toLowerCase(), type: 'type', name: $scope.newType || ''};
		newType.name = newType.name.trim();

		$scope.newType = '';
		if (newType.name.length && !$scope.types.filter(function(type) { return type.name == newType.name; }).length) {
			$scope.types.push(newType)
			mtDatabase.put(newType);
		}
	};

	$scope.remove = function(type) {
		$scope.types = $scope.types.filter(function(lType) { return lType !== type });
		mtDatabase.remove(type);
	};
});

monitoolControllers.controller('ThemeListController', function($q, $scope, mtDatabase) {
	$q.all([
		mtDatabase.query('monitool/by_type', {key: 'theme', include_docs: true}),
		mtDatabase.query('monitool/theme_usage', {group: true})
	]).then(function(result) {
		$scope.themes = result[0].rows.map(function(row) { return row.doc; });
		$scope.usage = {};
		result[1].rows.forEach(function(row) {
			$scope.usage[row.key] = row.value;
		});
	});

	$scope.add = function() {
		var newTheme = {_id: PouchDB.utils.uuid().toLowerCase(), type: 'theme', name: $scope.newTheme || ''};
		newTheme.name = newTheme.name.trim();

		$scope.newTheme = '';
		if (newTheme.name.length && !$scope.themes.filter(function(theme) { return theme.name == newTheme.name; }).length) {
			$scope.themes.push(newTheme)
			mtDatabase.put(newTheme);
		}
	};

	$scope.remove = function(theme) {
		$scope.themes = $scope.themes.filter(function(lTheme) { return lTheme !== theme });
		mtDatabase.remove(theme);
	};
});

///////////////////////////
// Input
///////////////////////////

monitoolControllers.controller('InputListController', function($scope, $q, mtDatabase) {
	$scope.inputMonth = period(new Date());
	$scope.maxMonth = $scope.inputMonth;

	$scope.reload = function() {
		$scope.ready = false;

		if (!$scope.inputMonth || !$scope.inputMonth.match(/[0-9]{4}\-[0-9]{2}/))
			return;

		// form control is buggy...
		if ($scope.inputMonth > $scope.maxMonth)
			$scope.inputMonth = $scope.maxMonth;

		$q.all([
			mtDatabase.query('monitool/by_type', {key: 'project'}),
			mtDatabase.query('monitool/input_by_month', {key: $scope.inputMonth, include_docs: true})
		]).then(function(result) {
			var projects = result[0].rows.map(function(row) { return row.value; }),
				inputs   = result[1].rows.map(function(row) { return row.doc; });

			$scope.inputs = [];
			$scope.allDone = true;

			projects.forEach(function(project) {
				for (var centerId in project.center) {
					var filledIndicators = 0,
						totalIndicators  = Object.keys(project.planning).length,
						center           = project.center[centerId],
						input            = inputs.filter(function(input) { return input.center === centerId; });

					if (input.length)
						for (var indicatorId in project.planning)
							if (typeof input[0].indicators[indicatorId] !== 'undefined')
								filledIndicators++;

					$scope.inputs.push({
						centerId: centerId,
						centerName: center.name,
						projectName: project.name,
						projectCountry: project.country,
						missingIndicators: totalIndicators - filledIndicators,
						totalIndicators: totalIndicators
					});

					if (totalIndicators !== filledIndicators)
						$scope.allDone = false;
				}

				$scope.ready = true;
			});
		});
	}
	$scope.reload();
});

monitoolControllers.controller('InputEditController', function($scope, $routeParams, $q, mtDatabase, mtInput, mtIndicators) {
	// Retrieve values and description for this form.
	mtDatabase.query('monitool/project_by_center', {key: $routeParams.centerId, include_docs: true}).then(function(result) {
		$scope.project = result.rows[0].doc;
		$scope.center  = $scope.project.center[$routeParams.centerId];

		$q.all([
			mtInput.getFormValues($routeParams.centerId, $routeParams.month),
			mtIndicators.getPlanningDescription($scope.project, $routeParams.month)
		]).then(function(result) {
			$scope.values = result[0];
			$scope.indicators = result[1];
		});
	});

	// Update all indicator on each change until there are no more changes.
	$scope.evaluate = function() {
		mtIndicators.evaluate($scope.indicators, $scope.values);
	};

	// An indicator is disabled when there exists one instance of it that is calculated in the whole form.
	// !!!!!!!!!!!!!!!! Writing this here is stupid. it should be a property of the input.
	$scope.isDisabled = function(indicatorId) {
		return $scope.indicators.some(function(indicator) {
			return (indicatorId === indicator.id && indicator.compute) ||
				indicator.dependencies.some(function(indicator) {
					return indicatorId === indicator.id && indicator.compute;
				});
		});
	};

	$scope.save = function() {
		mtInput.saveFormValues($routeParams.centerId, $routeParams.month, $scope.values);
	};
});


///////////////////////////
// Reporting
///////////////////////////

monitoolControllers.controller('ReportingByEntitiesController', function($scope, mtDatabase, mtStatistics) {
	var now = new Date();
	$scope.end = period(now);
	now.setFullYear(now.getFullYear() - 1);
	$scope.begin = period(now);
	
	$scope.entityTypes = ['project', 'center'];
	$scope.selectedEntityType = {selected: 'project'};

	$scope.entities = [];
	$scope.selectedEntities = {selected: []};

	// load indicators / centers / projects to fill select box.
	$scope.updateList = function() {
		mtDatabase.query('monitool/by_type', {key: $scope.selectedEntityType.selected}).then(function(data) {
			$scope.entities = data.rows.map(function(row) { return row.value; });
			$scope.selectedEntities = [];

			if ($scope.selectedEntities.length)
				$scope.updateData();
			else
				$scope.statistics = [];
		});
	};

	$scope.updateData = function() {
		var ids = $scope.selectedEntities.selected.map(function(entity) { return entity._id || entity.id; });

		mtStatistics
			.getStatistics($scope.selectedEntityType.selected, ids, $scope.begin, $scope.end)
			.then(function(statistics) {
				$scope.statistics = statistics;
			});
	};

	$scope.updateList();
});

