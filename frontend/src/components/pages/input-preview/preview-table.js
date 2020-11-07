import uiRouter from '@uirouter/angularjs';
import angular from 'angular';
require(__scssPath);

const module = angular.module(__moduleName, [uiRouter]);

/** Draws a table which shows changes to a given input */
module.component(__componentName, {
    bindings: {
        project: '<',
        content: '<',
    },

    template: require(__templatePath),

    controller: class {
        $onChanges() {
            // Remove time / location
            const content = Object.create(this.content);
            content.dimensions = content.dimensions.filter(
                d => !['time', 'location'].includes(d.id)
            );

            this.table = this.createTable(content);
        }

        createTable(content) {
            const distribution = this.computeBestDistribution(content);
            const rowParts = content.dimensions.slice(0, distribution);
            const colParts = content.dimensions.slice(distribution);

            const table = [];
            this.addTopLeftCorner(table, rowParts, colParts);
            this.addTitlesOnTop(table, colParts, 0);
            this.addTitlesOnLeft(table, rowParts, colParts.length);
            this.addData(table, colParts, content.data);
            return table;
        }

        /**
         * Decide which dimensions will go in rows and columns so that
         * the number of 8 columns is not exceded.
         */
        computeBestDistribution(content) {
            let distribution = Math.floor(content.dimensions.length);
            while (distribution > 1) {
                const width = content.dimensions
                    .slice(distribution - 1)
                    .reduce((m, d) => m * d.items.length, 1);

                if (width <= 8) distribution -= 1;
                else break;
            }
            return distribution;
        }

        addTopLeftCorner(table, rowParts, colParts) {
            if (rowParts.length && colParts.length) {
                table[0] = table[0] || [];
                table[0].push({
                    colspan: rowParts.length,
                    rowspan: colParts.length,
                    class: 'header',
                });
            }
        }

        addTitlesOnTop(table, dimensions, startRow, index = 0) {
            if (index == dimensions.length) return;

            const colspan = dimensions.slice(index + 1).reduce((m, d) => m * d.items.length, 1);
            const items = dimensions[index].items;

            for (let item of items) {
                table[startRow] = table[startRow] || [];
                table[startRow].push({
                    rowspan: 1,
                    colspan: colspan,
                    content: this.getLabel(item),
                    class: 'header',
                });

                this.addTitlesOnTop(table, dimensions, startRow + 1, index + 1);
            }
        }

        addTitlesOnLeft(table, dimensions, startRow, index = 0) {
            if (index == dimensions.length) {
                return;
            }

            const rowspan = dimensions.slice(index + 1).reduce((m, d) => m * d.items.length, 1);
            const items = dimensions[index].items;

            for (let [itemIndex, item] of items.entries()) {
                const itemStartRow = startRow + itemIndex * rowspan;

                table[itemStartRow] = table[itemStartRow] || [];
                table[itemStartRow].push({
                    rowspan: rowspan,
                    colspan: 1,
                    content: this.getLabel(item),
                    class: 'header',
                });

                this.addTitlesOnLeft(table, dimensions, itemStartRow, index + 1);
            }
        }

        addData(table, colParts, data) {
            const dataCpy = [...data];
            const numCols = colParts.reduce((m, d) => m * d.items.length, 1);

            let rowIndex = colParts.length;
            while (dataCpy.length) {
                // for (let rowIndex = colParts.length; rowIndex < table.length; ) {
                const row = dataCpy.splice(0, numCols).map(v => {
                    const cell = { colspan: 1, rowspan: 1 };
                    let { before, after } = v;
                    if (before === null) before = '∅';
                    if (after === null) after = '∅';

                    if (before === after) {
                        cell.content = before;
                        cell.class = 'unchanged';
                    } else {
                        cell.content = `${before} → ${after}`;
                        if (before === '∅') cell.class = 'added';
                        else if (after === '∅') cell.class = 'removed';
                        else cell.class = 'changed';
                    }

                    return cell;
                });

                table[rowIndex] = table[rowIndex] || [];
                table[rowIndex].push(...row);
                ++rowIndex;
            }
        }

        getLabel(id) {
            const variables = this.project.forms.reduce((m, ds) => [...m, ...ds.elements], []);
            const partitionsEls = variables
                .reduce((m, v) => [...m, ...v.partitions], [])
                .reduce((m, p) => [...m, ...p.elements], []);

            const item = [...variables, ...partitionsEls].find(item => item.id === id);
            return item?.name || '[Deleted]';
        }
    },
});

export default module.name;
