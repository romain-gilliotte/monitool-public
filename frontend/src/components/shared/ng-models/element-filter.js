import angular from 'angular';

const module = angular.module(__moduleName, []);

/**
 * This directive is a form control that allows to select multiple elements in a list.
 * To make thing faster than selecting one by one, it allows to select groups at once.
 */
module.component(__componentName, {
    require: {
        ngModelCtrl: 'ngModel',
    },

    template: require(__templatePath),

    bindings: {
        elements: '<',
        groups: '<',
    },

    controller: class {
        $onInit() {
            this.ngModelCtrl.$formatters.push(modelValue =>
                this._model2view(modelValue, this.elements, this.groups)
            );

            this.ngModelCtrl.$parsers.push(viewValue =>
                this._view2model(viewValue, this.elements, this.groups)
            );

            this.ngModelCtrl.$render = () => (this.selectedElements = this.ngModelCtrl.$viewValue);
        }

        // When elements or groups definition change.
        $onChanges(changes) {
            // Reset the list of selectable elements.
            this.selectableElements = [
                { id: 'all', name: 'project.all_elements' },
                ...(this.groups || []),
                ...this.elements,
            ];

            // Check that all selected elements are still valid.
            this.selectedElements = (this.selectedElements || []).filter(id => {
                return !!this.selectableElements.find(selectable => selectable.id == id);
            });
        }

        onUiSelectChange() {
            // Special case: we want to empty the list when a user select something over "all".
            if (this.selectedElements.length === 2 && this.selectedElements[0] === 'all')
                this.selectedElements = [this.selectedElements[1]];
            // Evaluate the whole list to remove inconsistencies.
            else
                this.selectedElements = this._model2view(
                    this._view2model(this.selectedElements, this.elements, this.groups),
                    this.elements,
                    this.groups
                );

            this.ngModelCtrl.$setViewValue(this.selectedElements);
        }

        /**
         * Convert the model value to the array that will be used in the view.
         * It merges elements that can be merged together using the group ids,
         * then add the elements that are not in any group.
         *
         * For instance:
         * 	model = ['element1', 'element2']
         * 	elements = [{id: 'element1', ...}, {id: 'element2', ...}]
         * 	groups = [{id: 'whatever', members: ['element1', 'element2']}]
         *
         * Will give
         * 	['whatever']
         */
        _model2view(model, elements, groups) {
            groups = groups || [];

            if (model.length == elements.length) return ['all'];

            // retrieve all groups that are in the list.
            const selectedGroups = groups.filter(group => {
                return group.members.every(id => model.includes(id));
            });

            const additionalIds = model.filter(id => {
                return selectedGroups.every(group => !group.members.includes(id));
            });

            return [...selectedGroups.map(e => e.id), ...additionalIds];
        }

        /**
         * Convert the view array to the model value, by expanding all groups.
         *
         * For instance:
         * 	view = ['whatever']
         * 	elements = [{id: 'element1', ...}, {id: 'element2', ...}]
         * 	groups = [{id: 'whatever', members: ['element1', 'element2']}]
         *
         * Will give
         * 	['element1', 'element2']
         */
        _view2model(view, elements, groups) {
            groups = groups || [];

            const model = {};

            view.forEach(id => {
                if (id == 'all') elements.forEach(e => (model[e.id] = true));
                else {
                    const group = groups.find(g => g.id == id);
                    if (group) group.members.forEach(m => (model[m] = true));
                    else model[id] = true;
                }
            });

            return Object.keys(model);
        }
    },
});

export default module.name;
