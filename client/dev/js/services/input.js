"use strict";

angular.module('monitool.services.models.input', [])
	.factory('Input', function($resource, itertools) {

		// this has nothing to do on the root scope.
		// => move it to a service and factorize with the similiar function in mtReporting
		var _getPeriods = function(form, project) {
			var periods;
			if (['year', 'quarter', 'month', 'week', 'day'].indexOf(form.periodicity) !== -1) {
				var period = form.periodicity === 'week' ? 'isoWeek' : form.periodicity;

				var current = moment(form.useProjectStart ? project.begin : form.start).startOf(period),
					end     = moment(form.useProjectEnd ? project.end : project.end).endOf(period);

				if (end.isAfter()) // do not allow to go in the future
					end = moment();

				periods = [];
				while (current.isBefore(end)) {
					periods.push(current.clone());
					current.add(1, form.periodicity);
				}
			}
			else if (form.periodicity === 'planned') {
				periods = form.intermediaryDates.map(function(period) {
					return moment(period);
				});
				periods.unshift(moment(form.start));
				periods.push(moment(form.end));
			}
			else
				throw new Error(form.periodicity + ' is not a valid periodicity');

			return periods;
		};

		/**
		 * This takes a mode and an array of values.
		 * mode is none, sum, average, highest, lowest, last
		 */
		var _aggregateValues = function(mode, values) {
			// filter out unanswered questions
			values = values.filter(function(v) { return v !== undefined && v !== null; });

			// if nothing remains, we can't aggregate.
			if (values.length == 0)
				return undefined;

			switch (mode) {
				case "none":
					return values.length == 1 ? values[0] : undefined;

				case "sum":
					return values.reduce(function(a, b) { return a + b; });

				case "average":
					return values.reduce(function(a, b, index, arr) { return a + b / arr.length; }, 0);

				case "highest":
					return values.reduce(function(a, b) { return a > b ? a : b; });

				case "lowest":
					return values.reduce(function(a, b) { return a > b ? b : a; });

				case "last":
					return values[values.length - 1];
			}
		};


		/**
		 * mode is geoAgg or timeAgg
		 */
		var _groupInputs = function(mode, inputs, form) {
			var newInput = Input.makeFake(form);

			form.aggregatedData.forEach(function(section) {
				section.elements.forEach(function(element) {
					var elementMode = element[mode], values;

					if (element.partitions.length === 0) {
						values = inputs.map(function(input) { return input.values[element.id]; });
						newInput.values[element.id] = _aggregateValues(elementMode, values);
					}
					else {
						itertools.product(element.partitions).map(function(list) {
							return list.map(function(p) { return p.id; }).sort().join('.');
						}).forEach(function(partition) {
							values = inputs.map(function(input) { return input.values[element.id + '.' + partition]; });
							newInput.values[element.id + '.' + partition] = _aggregateValues(elementMode, values);
						});
					}
				});
			});

			return newInput;
		};


		// Create $resource
		var Input = $resource('/resources/input/:id', { id: "@_id" }, { save: { method: "PUT" }});

		/**
		 * Factory with default value
		 */
		Input.makeNew = function(projectId, form, period, entityId) {
			var input = new Input({
				_id: [projectId, entityId, form.id, period].join(':'),
				type: "input",
				project: projectId,
				form: form.id,
				period: period,
				entity: entityId,
				values: {},
			});

			input.sanitize(form);
			return input;
		};

		/**
		 * Factory with default value
		 */
		Input.makeFake = function(form) {
			var input = new Input({form: form.id, values: {}});
			input.sanitize(form);
			return input;
		};

		Input.fetchProjectStatus = function(project) {
			return Input.query({mode: 'project_input_ids', projectId: project._id}).$promise.then(function(result) {
				// create hash with all existing inputs
				var existingInputs = {};
				result.forEach(function(id) { existingInputs[id] = true; });
				
				var displayedInputs = []

				// iterate on all inputs that should exist according to the project forms (and current date).
				project.dataCollection.forEach(function(form) {
					_getPeriods(form, project).forEach(function(period) {
						var inputEntities;
						if (form.collect === 'entity')
							inputEntities = project.inputEntities;
						else if (form.collect === 'project')
							inputEntities = [{id: "none"}];
						else
							throw new Error('Invalid form.collect value.');

						inputEntities.forEach(function(inputEntity) {
							var inputId = [project._id, inputEntity.id, form.id, period.format('YYYY-MM-DD')].join(':');
							if (form.active || existingInputs[inputId])
								displayedInputs.push({
									filled: existingInputs[inputId] ? 'yes' : 'no',
									period: period,
									formId: form.id, formName: form.name,
									inputEntityId: inputEntity.id,
									inputEntityName: inputEntity.name
								});

							delete existingInputs[inputId];
						});
					});
				});

				Object.keys(existingInputs).forEach(function(inputId) {
					var parts = inputId.split(':');
					displayedInputs.push({
						filled: 'invalid',
						period: moment(parts[3], 'YYYY-MM-DD'),
						formId: parts[2],
						formName: project.dataCollection.find(function(form) { return form.id === parts[2]; }).name,
						inputEntityId: parts[1],
						inputEntityName: parts[1] == 'none' ? undefined : project.inputEntities.find(function(entity) { return entity.id === parts[1]; }).name
					});
				});

				return displayedInputs;
			});
		};

		Input.fetchLasts = function(projectId, entityId, form, period) {
			return Input.query({
				mode: "current+last",
				projectId: projectId,
				entityId: entityId,
				formId: form.id,
				period: period
			}).$promise.then(function(result) {
				result.forEach(function(input) { input.sanitize(form); });

				var currentInputId = [projectId, entityId, form.id, period].join(':');

				// both where found
				if (result.length === 2) 
					return { current: result[0], previous: result[1], isNew: false };

				// only the current one was found
				else if (result.length === 1 && result[0]._id === currentInputId) 
					return { current: result[0], previous: null, isNew: false };

				// the current one was not found (and we may or not have found the previous one).
				return {
					current: Input.makeNew(projectId, form, period, entityId),
					previous: result.length ? result[0] : null,
					isNew: true
				};
			});
		};


		/**
		 * Retrieve from server all inputs that match (between 2 dates)
		 * - a given project
		 * - a given indicator
		 * - a group or an entity
		 */
		// Input.fetchFromQuery = function(query) {
		// 	// Retrieve all relevant inputs.
		// 	var options;
		// 	if (query.type === 'project' || query.type === 'group')
		// 		options = {mode: 'project_inputs', begin: query.begin, end: query.end, projectId: query.project._id};

		// 	else if (query.type === 'entity')
		// 		options = {mode: 'entity_inputs', begin: query.begin, end: query.end, entityId: query.id};

		// 	else if (query.type === 'indicator')
		// 		// we want all inputs from a form with the relevant formId
		// 		options = {
		// 			mode: 'form_inputs',
		// 			begin: query.begin, end: query.end,
		// 			formId: query.projects.map(function(p) {
		// 				var form = p.dataCollection.find(function(f) {
		// 					return !!f.fields.find(function(field) { return query.indicator._id === field.indicatorId });
		// 				});
		// 				return form ? form.id : null;
		// 			}).filter(function(form) { return form; })
		// 		};
		// 	else
		// 		throw new Error('query.type must be indicator, project, group or entity');

		// 	return Input.query(options).$promise.then(function(inputs) {
		// 		// Discard all inputs that are not relevant.
		// 		if (query.type === 'project')
		// 			inputs = inputs.filter(function(input) { return input.project === query.project._id; });

		// 		else if (query.type === 'entity')
		// 			inputs = inputs.filter(function(input) { return input.entity === query.id; });

		// 		else if (query.type === 'group')
		// 			inputs = inputs.filter(function(input) {
		// 				var project = query.project || query.projects.find(function(p) { return p._id === input.project; }),
		// 					group   = project.inputGroups.find(function(g) { return g.id === query.id; });

		// 				return group.members.indexOf(input.entity) !== -1;
		// 			});

		// 		// Sanitize all inputs.
		// 		var formsById = {};
		// 		if (query.project)
		// 			query.project.dataCollection.forEach(function(form) { formsById[form.id] = form; });
		// 		if (query.projects)
		// 			query.projects.forEach(function(p) { p.dataCollection.forEach(function(form) { formsById[form.id] = form; }); });

		// 		inputs.forEach(function(input) {
		// 			input.sanitize(formsById[input.form]);
		// 		});

		// 		return inputs;
		// 	});
		// };

		Input.fetchForProject = function(project) {
			return Input.query({mode: "project_inputs", projectId: project._id}).$promise.then(function(inputs) {
				// Sanitize all inputs.

				var formsById = {};	// start by indexings form by id
				project.dataCollection.forEach(function(form) {
					formsById[form.id] = form;
				});

				inputs.forEach(function(input) { // ask each input to sanitize itself with the relevant form.
					input.sanitize(formsById[input.form]);
				});

				return inputs;
			});
		};

		Input.aggregate = function(inputs, form, groupBy, projectGroups) {
			var groupedInputs = {};

			// Transform input list to {"2010-Q1": { "someEntityId": [Input('2010-02'), Input('2010-01'), ...], ... }}
			inputs.forEach(function(input) {
				input.getAggregationKeys(groupBy, projectGroups).forEach(function(key) {
					!groupedInputs[key] && (groupedInputs[key] = {});
					!groupedInputs[key][input.entity] && (groupedInputs[key][input.entity] = []);
					groupedInputs[key][input.entity].push(input);
				});
			});

			// Transform to {"2010-Q1": [[Input('2010-01'), Input('2010-02'), ...], ...]}
			for (var groupKey in groupedInputs) {
				for (var entityId in groupedInputs[groupKey]) {
					// sort by date so that "last" aggregation mode works
					groupedInputs[groupKey][entityId].sort(function(a, b) { return a < b ? -1 : 1; });
				}

				// transform into array
				groupedInputs[groupKey] = Object.keys(groupedInputs[groupKey]).map(function(k) { return groupedInputs[groupKey][k]; });
			}

			// Now we need to aggregate by levels. We will obtain {"2010-Q1": Input()}
			for (var key in groupedInputs) {
				// aggregate by time first.
				groupedInputs[key].forEach(function(sameEntityInputs, index) {
					groupedInputs[key][index] = _groupInputs('timeAgg', sameEntityInputs, form);
				});

				// and then by location
				groupedInputs[key] = _groupInputs('geoAgg', groupedInputs[key], form);
			}

			return groupedInputs;
		};


		/**
		 * Change values to match a given form
		 */
		Input.prototype.sanitize = function(form) {
			if (this.form !== form.id)
				throw new Error('Invalid form');

			// Index form elements by id so that we can check everything faster.
			var elementsById = {};
			form.aggregatedData.forEach(function(section) {
				section.elements.forEach(function(element) {
					elementsById[element.id] = element;
				});
			});

			var newValues = {};
			
			Object.keys(this.values).forEach(function(key) {
				// first index = element.id, all others = partitions.
				var parts = key.split('.');

				// Value is invalid.
				if (typeof this.values[key] !== 'number')
					return;

				// Element is undefined or
				// Number of partitions is unexpected
				var element = elementsById[parts[0]];
				if (!element || parts.length !== element.partitions.length + 1)
					return;

				// now check that all partitions exist
				// IMPLEMENT ME!

				newValues[key] = this.values[key];
			}, this);

			this.values = newValues;
		};


		// /**
		//  * Given a rawId, and a filter, returns the appropriate sum
		//  * If no filter is provided, assume the user want all partitions.
		//  */
		// Input.prototype.extractRawValue = function(rawId, filter) {
		// 	var result = 0;
		// 	var numFilters = filter.length;

		// 	Object.keys(this.values).forEach(function(key) {
		// 		// if the filter is not found, skip.
		// 		for (var i = 0; i < numFilters; ++i)
		// 			if (key.indexOf(filter[i]) === -1)
		// 				return;

		// 		result += this.values[key];
		// 	}, this);
		// };

		/**
		 * Given a input.value hash, compute all possible sums.
		 * This is used for the agg data stats.
		 */
		Input.prototype.computeSums = function() {
			var result = {};

			for (var key in this.values) {
				var parts = key.split('.'),
					variableId = parts.shift();

				// now we need to create a key for each subset of the partition.
				var numElements = parts.length,
					numSubsets = Math.pow(2, parts.length);

				for (var subsetIndex = 0; subsetIndex < numSubsets; ++subsetIndex) {
					// Build subset key
					var subsetKey = variableId;
					for (var partitionIndex = 0; partitionIndex < numElements; ++partitionIndex)
						if (subsetIndex & (1 << partitionIndex))
							subsetKey += '.' + parts[partitionIndex];

					result[subsetKey] = result[subsetKey] || 0; // initialize if needed
					result[subsetKey] += this.values[key];
				}
			}

			return result;
		};


		/**
		 * Compute all aggregations keys this input should be included in
		 */
		Input.prototype.getAggregationKeys = function(aggregationType, projectGroups) {
			// annotate each input with keys that will later tell the sumBy function how to aggregate the data.
			var period = moment(this.period);

			switch (aggregationType) {
				case 'year':
					return ['total', period.format('YYYY')];

				case 'quarter':
					return ['total', period.format('YYYY-[Q]Q')];

				case 'month':
					return ['total', period.format('YYYY-MM')];

				case 'week':
					return ['total', period.format('YYYY-[W]WW')];

				case 'day':
					return ['total', period.format('YYYY-MM-DD')];

				case 'entity':
					return this.entity !== 'none' ? ['total', this.entity] : ['total'];

				case 'group':
					// FIXME this test appears to be always false
					if (this.entity !== 'none' && projectGroups)
						return projectGroups.filter(function(group) {
							return group.members.indexOf(this.entity) !== -1;
						}, this).pluck('id')
					else
						return [];

				case 'project':
					return ['total', this.project];
			}
		};

		return Input;
	});
