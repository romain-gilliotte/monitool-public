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
import TimeSlot, {timeSlotRange} from 'timeslot-dag';
import uiRouter from '@uirouter/angularjs';

import Project from '../../../models/project';
import Link from '../../../models/link';

import mtFilter from './cc-indicator-filter';
import mtGroupBy from './cc-indicator-group-by';
import mtTable from './table';


const module = angular.module(
	'monitool.components.pages.organisation.reporting.indicator',
	[
		uiRouter, // for $stateProvider

		mtFilter,
		mtGroupBy,
		mtTable
	]
);


module.config($stateProvider => {

	$stateProvider.state('main.organisation.reporting.indicator', {
		acceptedUsers: ['loggedIn', 'unknown'],
		url: '/indicator/:thematicId/:indicatorId',
		component: 'ccIndicatorReporting',
		resolve: {
			// emulate previous behaviour to save some implementation time.
			// warning: legacy code!
			ccIndicator: ($stateParams, loadedOrganisation) => {
				const indicator = Object.assign(
					{},
					loadedOrganisation.thematics
						.find(t => t.id === $stateParams.thematicId)
						.indicators
						.find(i => i.id === $stateParams.indicatorId)
				);

				indicator._id = indicator.id;
				delete indicator.id;

				return indicator;
			},

			projects: ($q, $stateParams) => {
				const $sp = $stateParams;
				const deferred = $q.defer();

				Promise
					.all([
						Project.fetchForThematic($sp.organisationId, $sp.thematicId),
						Link.fetchForThematic($sp.organisationId, $sp.thematicId)
					])
					.then(result => {
						const [projects, links] = result;

						projects.forEach(project => {
							project.crossCutting = {};

							const link = links.find(l => 'project:' + l._id.slice(42) == project._id);
							if (link &&
								link.thematics[$sp.thematicId] &&
								link.thematics[$sp.thematicId][$sp.indicatorId]) {

								project.crossCutting[$sp.indicatorId] = {
									computation: link.thematics[$sp.thematicId][$sp.indicatorId]
								}
							}
						})

						deferred.resolve(projects);
					});


				return deferred.promise;
			}
		}
	});
});


module.component('ccIndicatorReporting', {
	bindings: {
		ccIndicator: '<',
		projects: '<'
	},

	template: require('./indicator.html'),

	controller: class IndicatorReportingController {

		constructor($filter) {
			this._formatSlot = $filter('formatSlot');
			this._formatSlotRange = $filter('formatSlotRange');

			this.filter = this.groupBy = null
			this.graphX = [];
			this.graphYs = {};
		}

		$onChanges(changes) {
			this.selectedProjects = this.projects.filter(p => p.active);
		}

		onGroupByUpdate(groupBy) {
			this.groupBy = groupBy;

			if (this.filter)
				this._updateColumns();
		}

		onFilterUpdate(newFilter) {
			this.filter = Object.assign({}, newFilter);
			delete this.filter._showFinished;

			const now = new Date().toISOString().slice(0, 10);
			this.selectedProjects = this.projects.filter(p => newFilter._showFinished || p.end > now);

			if (this.groupBy)
				this._updateColumns();
		}

		onPlotToggle(id, name, data) {
			const newGraphs = Object.assign({}, this.graphYs);

			if (data)
				newGraphs[id] = {name: name, data: data};
			else
				delete newGraphs[id];

			this.graphYs = newGraphs;
		}

		_updateColumns() {
			const [start, end] = [this.filter._start, this.filter._end];

			const slots = Array.from(
				timeSlotRange(
					TimeSlot.fromDate(new Date(start + 'T00:00:00Z'), this.groupBy),
					TimeSlot.fromDate(new Date(end + 'T00:00:00Z'), this.groupBy)
				)
			);

			this.columns = [
				...slots.map(slot => {
					return {
						id: slot.value,
						name: this._formatSlot(slot.value),
						title: this._formatSlotRange(slot.value)
					};
				}),
				{id:'_total', name: "Total"}
			];

			this.graphX = this.columns.filter(x => x.id !== '_total');
		}
	}
});

export default module.name;
