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

import uiModal from 'angular-ui-bootstrap/src/modal/index';

import editionModal from './indicator-edition';

const module = angular.module(
	'monitool.components.shared.indicator.display',
	[
		uiModal, // for $uibModal
		editionModal.name
	]
);


module.directive('indicator', function($uibModal) {
	return {
		restrict: 'E',
		template: require('./display.html'),
		scope: {
			indicator: '=',
			indicatorList: '=',
			editableProject: '=project'
		},
		link: function($scope) {
			$scope.editIndicator = function() {
				$uibModal
					.open({
						component: 'indicatorEditionModal',
						size: 'lg',
						resolve: {
							planning: () => $scope.indicator,
							indicator: () => null,
							dataSources: () => $scope.editableProject.forms
						}
					})
					.result
					.then(function(newIndicator) {
						var indicator = $scope.indicator;

						if (indicator && !newIndicator)
							$scope.indicatorList.splice($scope.indicatorList.indexOf(indicator), 1);
						else if (!indicator && newIndicator)
							$scope.indicatorList.push(newIndicator);
						else if (indicator && newIndicator)
							$scope.indicatorList.splice($scope.indicatorList.indexOf(indicator), 1, newIndicator);
					});
			};
		}
	}
});


export default module;
