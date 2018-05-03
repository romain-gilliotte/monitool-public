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
import ngResource from 'angular-resource';

import {getList} from '../../helpers/input-slots';


const module = angular.module(
	'monitool.services.models.input',
	[
		ngResource
	]
);

module.factory('Input', function($resource, $q) {

	// Create $resource
	var Input = $resource('/api/resources/input/:id', { id: "@_id" }, { save: { method: "PUT" }});

	Input.fetchFormStatus = function(project, formId) {
		var form = project.forms.find(f => f.id == formId);

		return Input.query({mode: 'ids_by_form', projectId: project._id, formId: formId}).$promise.then(function(inputsDone) {
			var prj = {};

			inputsDone.forEach(inputId => {
				var splitted      = inputId.split(':'),
					inputEntityId = splitted[4],
					strPeriod     = splitted[5];

				prj[strPeriod] = prj[strPeriod] || {};
				prj[strPeriod][inputEntityId] = 'outofschedule';
			});

			form.entities.forEach(entityId => {
				var strPeriods;
				if (form.periodicity === 'free')
					strPeriods = Object.keys(prj);
				else {
					var entity = project.entities.find(entity => entity.id == entityId);
					strPeriods = getList(project, entity, form);
				}

				strPeriods.forEach(strPeriod => {
					prj[strPeriod] = prj[strPeriod] || {};

					if (prj[strPeriod][entityId] == 'outofschedule')
						prj[strPeriod][entityId] = 'done';
					else
						prj[strPeriod][entityId] = 'expected';
				});
			});

			// Sort periods alphabetically
			var periods = Object.keys(prj);
			periods.sort();

			var newObj = {};
			periods.forEach(period => newObj[period] = prj[period])
			prj = newObj;

			return prj;
		});
	};

	Input.fetchLasts = function(project, entityId, formId, period) {
		var form = project.forms.find(f => f.id == formId);

		return Input.query({
			mode: "current+last",
			projectId: project._id,
			entityId: entityId,
			formId: formId,
			period: period
		}).$promise.then(function(result) {
			var currentInputId = ['input', project._id, formId, entityId, period].join(':');

			// both where found
			if (result.length === 2)
				return { current: result[0], previous: result[1], isNew: false };

			// only the current one was found
			else if (result.length === 1 && result[0]._id === currentInputId)
				return { current: result[0], previous: null, isNew: false };

			var current = new Input({
				_id: currentInputId, type: "input",
				project: project._id, form: formId, period: period, entity: entityId,
				values: {}
			});

			form.elements.forEach(element => {
				const numFields = element.partitions.reduce((p, memo) => memo * p.elements.length, 1);

				current.values[element.id] = new Array(numFields);
				for (var i = 0; i < numFields; ++i)
					current.values[element.id][i] = 0;
			});

			// the current one was not found (and we may or not have found the previous one).
			return {current: current, previous: result.length ? result[0] : null, isNew: true};
		});
	};



	return Input;
});


export default module;