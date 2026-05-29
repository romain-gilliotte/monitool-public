// Shared locators for app widgets that specs target repeatedly. Handsontable is a
// 3rd-party grid whose cells carry no data-testid, so we reach them through their
// rendered DOM — kept here so a Handsontable upgrade only touches one selector.

// Every editable cell of the data-entry Handsontable grid, in row-major DOM order.
export function gridCells(page) {
    return page.getByTestId('hot-container').locator('.ht_master .htCore tbody td');
}

// A single grid cell by index (defaults to the first — the 1x1 partition-free case).
export function gridCell(page, index = 0) {
    return gridCells(page).nth(index);
}

// The reporting table row whose text contains the given indicator/partition name.
export function reportingRow(page, name) {
    return page.getByTestId('reporting-table').locator('tr', { hasText: name });
}
