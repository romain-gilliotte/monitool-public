import angular from 'angular';
import { getParser } from 'olap-in-memory';
import mtPartitionFilter from './partition-filter';
import mtExpression from '../../../directives/validators/expression';

const module = angular.module(__moduleName, [mtPartitionFilter, mtExpression]);

const PERCENTAGE_FORMULA = '100 * numerator / denominator';
const PERMILLE_FORMULA = '1000 * numerator / denominator';
const COPY_FORMULA = 'copied_value';

module.component(__componentName, {
    require: {
        ngModelCtrl: 'ngModel',
    },

    bindings: {
        dataSources: '<',
    },

    template: require(__templatePath),

    controller: class {
        constructor() {
            this.parser = getParser();
        }

        $onInit() {
            this.ngModelCtrl.$parsers.push(this._viewToModel.bind(this));
            this.ngModelCtrl.$formatters.push(this._modelToView.bind(this));

            this.ngModelCtrl.$render = () => {
                this.computation = this.ngModelCtrl.$viewValue;

                try {
                    this.symbols = this.parser.parse(this.computation.formula).variables();
                } catch (e) {
                    this.symbols = [];
                }
            };
        }

        $onChanges(changes) {
            if (changes.dataSources) {
                this.selectElements = [];
                this.variablesById = {};
                this.dataSources.forEach(dataSource => {
                    dataSource.elements.forEach(variable => {
                        this.variablesById[variable.id] = variable; // Use to find partition on view
                        this.selectElements.push({
                            id: variable.id,
                            name: variable.name,
                            group: dataSource.name,
                        }); // Used by selectbox
                    });
                });
            }
        }

        onTypeChange() {
            if (this.computation.type === 'copy') this.computation.formula = COPY_FORMULA;
            else if (this.computation.type === 'percentage')
                this.computation.formula = PERCENTAGE_FORMULA;
            else if (this.computation.type === 'permille')
                this.computation.formula = PERMILLE_FORMULA;

            this.onFormulaChange();
        }

        onFormulaChange() {
            // Create and remove items in computation.parameters hash, when the formula changes.
            var newSymbols,
                oldSymbols = Object.keys(this.computation.parameters);
            try {
                newSymbols = this.parser.parse(this.computation.formula).variables();
            } catch (e) {
                newSymbols = [];
            }

            if (!angular.equals(newSymbols, oldSymbols)) {
                var addedSymbols = newSymbols.filter(s => !oldSymbols.includes(s));

                // Add new symbols to formula
                addedSymbols.forEach(s => {
                    this.computation.parameters[s] = {
                        elementId: null,
                        filter: {},
                    };
                });
            }

            this.symbols = newSymbols;
            this.ngModelCtrl.$setViewValue(angular.copy(this.computation));
        }

        /**
         * Trigered when a filter, or the formula in fixed mode changes.
         */
        onOtherChange() {
            this.ngModelCtrl.$setViewValue(angular.copy(this.computation));
        }

        _viewToModel(viewValue) {
            // why not filter out the parameters that are not needed in the modelValue here instead of before save in the model?
            if (viewValue.type === 'unavailable') return null;
            else
                return {
                    formula: viewValue.formula,
                    parameters: viewValue.parameters,
                };
        }

        _modelToView(modelValue) {
            // Guess formula type with the content.
            if (modelValue === null) return { type: 'unavailable', formula: '', parameters: {} };
            else if (modelValue.formula === COPY_FORMULA)
                return {
                    type: 'copy',
                    formula: COPY_FORMULA,
                    parameters: modelValue.parameters,
                };
            else if (modelValue.formula === PERCENTAGE_FORMULA)
                return {
                    type: 'percentage',
                    formula: PERCENTAGE_FORMULA,
                    parameters: modelValue.parameters,
                };
            else if (modelValue.formula === PERMILLE_FORMULA)
                return {
                    type: 'permille',
                    formula: PERMILLE_FORMULA,
                    parameters: modelValue.parameters,
                };
            else
                return {
                    type: 'formula',
                    formula: modelValue.formula,
                    parameters: modelValue.parameters,
                };
        }
    },
});

export default module.name;
