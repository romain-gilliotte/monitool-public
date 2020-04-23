import angular from 'angular';
import { getQueryDimensions } from '../../../helpers/query-builder';

const module = angular.module(__moduleName, []);

module.component(__componentName, {
    bindings: {
        project: '<',
        query: '<',

        onUpdate: '&',
    },

    template: require(__templatePath),

    controller: class {
        $onChanges(changes) {
            if (changes.query) {
                this.selected = { rows: [], cols: [] };
                this.showTotals = false;
                this.choices = this._makeChoices();

                this._makeRowColsList();
                this.triggerUpdate();
            }
        }

        /** Tell parent component about the changes. */
        triggerUpdate() {
            this.onUpdate({
                aggregate: [...this.selected.rows, ...this.selected.cols].map(
                    ({ id, attribute }) => ({
                        id,
                        attribute,
                    })
                ),
                distribution: this.selected.rows.length,
                showTotals: this.showTotals,
            });
        }

        /** Event triggered when rows or columns change */
        onSelectUpdate() {
            this._makeRowColsList();
            this.triggerUpdate();
        }

        /** Build the list of possibles rows and columns for the table (from the dimension attributes). */
        _makeChoices() {
            const dimensions = getQueryDimensions(this.project, this.query, false, false);

            return dimensions.reduce(
                (m, dimension) => [
                    ...m,
                    ...dimension.attributes
                        .filter(attr => attr !== 'all')
                        .map(attribute => {
                            const { label, labelData } = this._getLabel(
                                dimension.id,
                                attribute,
                                dimension.label
                            );

                            return {
                                $$hashKey: `${dimension.id}.${attribute}`,
                                id: dimension.id,
                                attribute,
                                label: label,
                                labelData: labelData,
                            };
                        }),
                ],
                []
            );
        }

        /**
         * Update the list of possible rows and columns, depending on which are selected
         * in either one.
         */
        _makeRowColsList() {
            const selectedChoices = [...this.selected.rows, ...this.selected.cols];

            this.availableCols = this.choices.filter(
                choice =>
                    this.selected.cols.includes(choice) ||
                    !selectedChoices.find(selected => selected.id == choice.id)
            );

            this.availableRows = this.choices.filter(
                choice =>
                    this.selected.rows.includes(choice) ||
                    !selectedChoices.find(selected => selected.id == choice.id)
            );
        }

        // Fixme: we could avoid that by allowing attribute labeling
        // in olap-in-memory
        _getLabel(dimensionId, attribute, dimensionLabel) {
            let label = null,
                labelData = {};
            if (dimensionId === 'time') label = `project.dimensions.${attribute}`;
            else if (dimensionId === 'location' && attribute === 'entity')
                label = 'project.dimensions.entity';
            else {
                let group = this.project.groups.find(g => g.id == attribute);
                if (group) {
                    label = 'project.dimensions.group';
                    labelData.name = group.name;
                } else if (attribute === 'element') {
                    label = 'project.dimensions.partition';
                    labelData.name = dimensionLabel;
                } else {
                    let partition;
                    out: for (let i = 0; i < this.project.forms.length; ++i)
                        for (let j = 0; j < this.project.forms[i].elements.length; ++j)
                            for (
                                let k = 0;
                                k < this.project.forms[i].elements[j].partitions.length;
                                ++k
                            )
                                if (
                                    this.project.forms[i].elements[j].partitions[k].id ===
                                    dimensionId
                                ) {
                                    partition = this.project.forms[i].elements[j].partitions[k];
                                    break out;
                                }

                    let pgroup;
                    for (let i = 0; i < partition.groups.length; ++i)
                        if (partition.groups[i].id === attribute) {
                            pgroup = partition.groups[i];
                            break;
                        }

                    label = 'project.dimensions.partition_group';
                    labelData.name = partition.name;
                    labelData.groupName = pgroup.name;
                }
            }

            return { label, labelData };
        }
    },
});

export default module.name;
