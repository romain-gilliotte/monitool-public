import angular from 'angular';

const module = angular.module(__moduleName, []);

module.component(__componentName, {
	bindings: {
		ids: '<',
		items: '<',
		groups: '<'
	},

	template: require(__templatePath),

	controller: class {

		$onChanges(changes) {
			this.view = this._model2view(this.ids, this.items, this.groups);
		}

		_model2view(model, elements, groups) {
			groups = groups || [];

			if (model.length == elements.length)
				return [{ name: 'project.all_elements' }];

			else if (model.length == 0)
				return [{ name: 'shared.none' }]

			// retrieve all groups that are in the list.
			const selectedGroups = groups.filter(group => {
				return group.members.every(id => model.includes(id));
			});

			const additionalIds = model.filter(id => {
				return selectedGroups.every(group => !group.members.includes(id));
			});

			return [
				...selectedGroups,
				...additionalIds.map(id => elements.find(e => e.id == id))
			];
		}
	}
});

export default module.name;