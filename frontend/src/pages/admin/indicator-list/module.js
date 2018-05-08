/*!
 * This file is part of Monitool.
 *
 * Monitool is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Monitool is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Monitool. If not, see <http://www.gnu.org/licenses/>.
 */

import angular from 'angular';
import Indicator from '../../../services/models/indicator';
import Theme from '../../../services/models/theme';
import {translate} from '../../../services/utils/translate';

import uiRouter from '@uirouter/angularjs';
import uiModal from 'angular-ui-bootstrap/src/modal/index';
import uiSelect from 'ui-select';

import 'ui-select/dist/select.min.css';

import mtDirectiveAutoresize from '../../../directives/helpers/autoresize';

const module = angular.module(
	'monitool.pages.admin.indicatorlist',
	[
		uiRouter, // for $stateProvider
		uiModal, // for $uibModal
		uiSelect, // for <ui-select>

		mtDirectiveAutoresize.name
	]
);


module.config(function($stateProvider) {

	if (window.user.type == 'user' && window.user.role == 'admin') {

		$stateProvider.state('main.admin.indicator_list', {
			url: '/admin/indicators',
			template: require('./list.html'),
			controller: 'AdminIndicatorListController',
			resolve: {
				indicators: () => Indicator.fetchAll(),
				themes: () => Theme.fetchAll()
			}
		});
	}
});


module.controller("AdminIndicatorListController", function($scope, $uibModal, indicators, themes) {
	$scope.indicators = indicators;
	$scope.themes = themes;

	// give a color to each theme
	// give to indicators the color of the first theme
	var classes = ["text-primary", "text-success", "text-info", "text-warning", "text-danger"];
	$scope.themes.forEach((theme, index) => theme.class = classes[index % classes.length]);

	var sortIndicators = function() {
		$scope.themes.sort((a, b) => {
			return a.name[$scope.language].localeCompare(b.name[$scope.language]);
		});

		$scope.indicators.sort((a, b) => {
			return a.name[$scope.language].localeCompare(b.name[$scope.language]);
		});
	};

	sortIndicators();

	var createModal = function(indicator, isNew) {
		return $uibModal.open({
			controller: 'IndicatorEditModalController',
			template: require('./edit-modal.html'),
			size: 'lg', scope: $scope,
			resolve: {
				themes: function() { return $scope.themes; },
				indicator: function() { return indicator; },
				isNew: function() { return isNew; }
			}
		}).result;
	};

	$scope.$watch('language', sortIndicators);

	$scope.create = function() {
		var indicator = new Indicator();

		createModal(indicator, true).then(function(action) {
			if (action === '$save') {
				$scope.indicators.push(indicator);
				sortIndicators();
				indicator.save();
			}
		});
	};

	$scope.edit = function(indicator) {
		var backup = angular.copy(indicator);

		createModal(indicator, false)
			.then(function(action) {
				if (action === '$save') {
					sortIndicators();
					indicator.save();
				}

				if (action === '$delete') {
					$scope.indicators.splice($scope.indicators.indexOf(indicator), 1);
					indicator.delete();
				}
			})
			.catch(function() {
				angular.copy(backup, indicator);
			})
	};
});


module.controller('IndicatorEditModalController', function($uibModalInstance, $scope, googleTranslation, indicator, themes, isNew) {
	$scope.indicator = indicator;
	$scope.master = angular.copy(indicator);
	$scope.themes = themes;
	$scope.isNew = isNew;

	var indicatorWatch = $scope.$watch('indicator', function() {
		$scope.indicatorChanged = !angular.equals($scope.master, $scope.indicator);
		$scope.indicatorSavable = $scope.indicatorChanged && !$scope.indicatorForm.$invalid;
	}, true);

	// Form actions
	$scope.save = function() {
		if (!$scope.indicatorSavable)
			return;

		$uibModalInstance.close('$save');
	};

	$scope.translate = function(key, destLanguage) {
		for (var sourceLanguage in $scope.languages) {
			var source = indicator[key][sourceLanguage];

			if (sourceLanguage != destLanguage && source && source.length) {
				translate(source, destLanguage, sourceLanguage).then(function(result) {
					$scope.$apply(() => {
						indicator[key][destLanguage] = result;
					});
				});

				break;
			}
		}
	};

	$scope.delete = function() {
		$uibModalInstance.close('$delete');
	};

	$scope.cancel = function() {
		$uibModalInstance.dismiss();
	};
});

export default module;
