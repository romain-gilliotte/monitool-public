import angular from 'angular';
import { buildQueryFromIndicator, buildQueryFromVariable } from '../../../helpers/query-builder';

const module = angular.module(__moduleName, []);

module.component(__componentName, {
    bindings: {
        project: '<', // To get the indicators
        download: '<',
        onUpdate: '&',
    },
    template: require(__templatePath),
    controller: class {
        constructor($filter) {
            'ngInject';

            this.translate = $filter('translate');
        }

        $onChanges(changes) {
            if (changes.project) {
                this.elementOptions = this._computeChoices();
                this.chosenElement = this.elementOptions[0];

                this.onUpdate(this.chosenElement);
            }
        }

        _computeChoices() {
            return [
                ...this.project.logicalFrames.reduce(
                    (m, logFrame) => [
                        ...m,
                        ...logFrame.indicators.map(indicator =>
                            this._buildChoiceFromIndicator(indicator, logFrame)
                        ),
                        ...logFrame.purposes.reduce(
                            (m, purpose) => [
                                ...m,
                                ...purpose.indicators.map(indicator =>
                                    this._buildChoiceFromIndicator(indicator, logFrame)
                                ),
                                ...purpose.outputs.reduce(
                                    (m, output) => [
                                        ...m,
                                        ...output.indicators.map(indicator =>
                                            this._buildChoiceFromIndicator(indicator, logFrame)
                                        ),
                                        ...output.activities.reduce(
                                            (m, activity) => [
                                                ...m,
                                                ...activity.indicators.map(indicator =>
                                                    this._buildChoiceFromIndicator(
                                                        indicator,
                                                        logFrame
                                                    )
                                                ),
                                            ],
                                            []
                                        ),
                                    ],
                                    []
                                ),
                            ],
                            []
                        ),
                    ],
                    []
                ),
                ...this.project.extraIndicators.map(indicator =>
                    this._buildChoiceFromIndicator(indicator)
                ),
                ...this.project.forms.reduce(
                    (m, dataSource) => [
                        ...m,
                        ...dataSource.elements.map(variable =>
                            this._buildChoiceFromVariable(variable, dataSource)
                        ),
                    ],
                    []
                ),
            ];
        }

        _buildChoiceFromIndicator(indicator, logicalFramework = null) {
            const base = {
                name: indicator.display,
                baseline: indicator.baseline,
                target: indicator.target,
                colorize: indicator.colorize,
                query: buildQueryFromIndicator(indicator, logicalFramework, this.project),
            };

            if (logicalFramework)
                return {
                    ...base,
                    group: this.translate('project.logical_frame') + ': ' + logicalFramework.name,
                };
            else return { ...base, group: this.translate('indicator.extra') };
        }

        _buildChoiceFromVariable(variable, dataSource) {
            return {
                name: variable.name,
                baseline: null,
                target: null,
                colorize: false,
                group: this.translate('project.collection_form') + ': ' + dataSource.name,
                query: buildQueryFromVariable(variable, dataSource, this.project),
            };
        }
    },
});

export default module.name;
