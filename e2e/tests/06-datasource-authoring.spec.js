// Doc use-case: initial-project-configuration/data-source
//   (README + calendar + variables + aggregation-modes + reducing-form-size)
//
// Author a data source end-to-end: create a fresh project, then on it define a
// data source (name + monthly periodicity), add one variable with sum/sum
// aggregation, and add one disaggregation (partition) with two elements. Save
// and verify everything round-trips through the API + Mongo by reloading the
// app and reopening the editor.
//
// We create a NEW project (like spec 03) rather than editing the shared
// deterministic baseline, so this spec does not perturb specs 01/02/04.
//
// Risk documented inline: the partition editor is a ui-bootstrap $uibModal
// appended to <body>; its two pre-seeded element rows carry random uuids, so
// their name inputs are driven positionally (.nth) inside the
// `partition-elements` container — the same library-rendered exception we make
// for the Handsontable grid.
import { test, expect } from '../fixtures.js';
import { getProjectById } from '../helpers/db.mjs';
import { waitProjectSaved, waitProjectCreated } from '../helpers/responses.mjs';

const PROJECT_NAME = 'E2E Data Source Project';
const COUNTRY = 'Testland';
const DS_NAME = 'Field staff monthly report';
const VARIABLE_NAME = 'Number of people reached';
const PARTITION_NAME = 'Gender';
const ELEMENT_FEMALE = 'Female';
const ELEMENT_MALE = 'Male';

test('author a data source with a variable, aggregation modes and a partition', async ({
    page,
}) => {
    // --- Create a fresh project and persist its basics (so the data-source nav
    // tab becomes enabled: it is disabled while the project has no _id). ---
    await page.goto('/app.html#!/projects');
    await page.getByTestId('project-create-button').click();

    await page.getByTestId('nav-config-basics').click();
    await page.getByTestId('basics-country').fill(COUNTRY);
    await page.getByTestId('basics-name').fill(PROJECT_NAME);

    await Promise.all([waitProjectCreated(page), page.getByTestId('save-button').click()]);
    await expect(page).not.toHaveURL(/projects\/new\//);

    // Capture the new project id for the API persistence read-back later.
    const pid = page.url().match(/projects\/([^/]+)\//)[1];

    // --- Open the data-source list and start a new data source. ---
    await page.getByTestId('nav-config-datasources').click();
    await page.getByTestId('ds-create-button').click();
    await expect(page.getByTestId('ds-name')).toBeVisible();

    // --- Data source: name + monthly periodicity (calendar.md). ---
    await page.getByTestId('ds-name').fill(DS_NAME);
    await page.getByTestId('ds-periodicity').selectOption('month');

    // --- Add one variable and set its aggregation modes (variables.md +
    // aggregation-modes.md). The variable panel auto-expands on add. ---
    await page.getByTestId('ds-add-variable').click();
    await page.getByTestId('ds-variable-name').first().fill(VARIABLE_NAME);
    await page.getByTestId('ds-variable-geoagg').first().selectOption('sum');
    await page.getByTestId('ds-variable-timeagg').first().selectOption('sum');

    // --- Add a partition (disaggregation) via the ui-bootstrap modal. The new
    // partition is pre-seeded with exactly two blank elements + aggregation=sum.
    // The modal is appended to <body>, so we look up its testids on `page`. ---
    await page.getByTestId('ds-add-partition').click();
    await expect(page.getByTestId('partition-name')).toBeVisible();

    await page.getByTestId('partition-name').fill(PARTITION_NAME);

    // The two pre-seeded element rows carry random uuids and no business id, so
    // we drive their name inputs positionally inside the elements container.
    const elementNames = page
        .getByTestId('partition-elements')
        .getByTestId('partition-element-name');
    await expect(elementNames).toHaveCount(2);
    await elementNames.nth(0).fill(ELEMENT_FEMALE);
    await elementNames.nth(1).fill(ELEMENT_MALE);

    await expect(page.getByTestId('partition-aggregation')).toHaveValue('sum');

    // Apply closes the modal (sets closedOnPurpose, so no "leave?" confirm).
    await page.getByTestId('partition-apply').click();
    await expect(page.getByTestId('partition-name')).toHaveCount(0);

    // The partition now appears in the variable's partition list.
    const partitionLink = page.locator('[data-testid^="ds-partition-"]');
    await expect(partitionLink).toHaveCount(1);
    await expect(partitionLink).toContainText(PARTITION_NAME);

    // --- Save the project (PUT) and wait for persistence. ---
    await Promise.all([
        waitProjectSaved(page),
        page.getByTestId('save-button').click(),
    ]);

    // --- Verify the authored structure persisted (round-trip UI -> API -> Mongo).
    // We read the project back from the API (the same document the editor would
    // re-render); the editor collapses variable panels on reload, so the API is a
    // stabler oracle for the nested variable/partition fields. ---
    const project = await getProjectById(pid);
    const ds = project.forms.find(f => f.name === DS_NAME);
    expect(ds, 'data source persisted').toBeTruthy();
    expect(ds.periodicity).toBe('month');
    expect(ds.elements).toHaveLength(1);

    const variable = ds.elements[0];
    expect(variable.name).toBe(VARIABLE_NAME);
    expect(variable.geoAgg).toBe('sum');
    expect(variable.timeAgg).toBe('sum');
    expect(variable.partitions).toHaveLength(1);
    expect(variable.partitions[0].name).toBe(PARTITION_NAME);
    expect(variable.partitions[0].aggregation).toBe('sum');
    expect(variable.partitions[0].elements.map(e => e.name).sort()).toEqual(
        [ELEMENT_FEMALE, ELEMENT_MALE].sort()
    );

    // --- And the frontend re-renders the persisted data source on a fresh load. ---
    await page.goto(`/app.html#!/projects/${pid}/data-source`);
    await expect(page.locator('text=' + DS_NAME).first()).toBeVisible();
    await expect(page.locator('text=' + VARIABLE_NAME).first()).toBeVisible();
    await expect(page.getByTestId('app-error')).toHaveCount(0);
});
