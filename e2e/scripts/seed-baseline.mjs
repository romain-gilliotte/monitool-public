// Builds and inserts the deterministic baseline project used by the
// data-entry / reporting / downloads specs. Structure is intentionally minimal:
//   - 2 sites
//   - 1 monthly data source with a single variable that has NO partitions
//     (so the Handsontable grid is 1x1 and trivial to drive)
//   - 1 logical frame with one goal-level indicator that simply copies that
//     variable (formula "a"), so a single entered value surfaces verbatim in
//     the general reporting table.
import { BASELINE_PROJECT_ID, BASELINE_SEQ_ID } from './constants.mjs';

// Fixed, schema-valid uuids (8-4-4-4-12 hex).
export const SITE_A = 'aaaaaaaa-0000-4000-8000-000000000001';
export const SITE_B = 'aaaaaaaa-0000-4000-8000-000000000002';
export const DATASOURCE_ID = 'bbbbbbbb-0000-4000-8000-000000000001';
export const VARIABLE_ID = 'cccccccc-0000-4000-8000-000000000001';
export const LOGFRAME_ID = 'dddddddd-0000-4000-8000-000000000001';

export const BASELINE = {
    name: 'E2E Baseline Project',
    country: 'E2E Land',
    start: '2020-01-01',
    end: '2020-06-30', // 6 monthly periods, all in the past => all fillable
    siteAName: 'Site A',
    siteBName: 'Site B',
    datasourceName: 'Monthly activity report',
    variableName: 'Number of consultations',
    indicatorName: 'Total consultations',
};

export function buildBaselineProject(owner) {
    const variable = {
        id: VARIABLE_ID,
        name: BASELINE.variableName,
        active: true,
        timeAgg: 'sum',
        geoAgg: 'sum',
        distribution: 0,
        partitions: [],
    };

    const dataSource = {
        id: DATASOURCE_ID,
        name: BASELINE.datasourceName,
        periodicity: 'month',
        active: true,
        entities: [SITE_A, SITE_B],
        elements: [variable],
    };

    const indicator = {
        display: BASELINE.indicatorName,
        baseline: null,
        target: null,
        colorize: false,
        computation: {
            formula: 'a',
            parameters: { a: { elementId: VARIABLE_ID, filter: {} } },
        },
    };

    const logicalFrame = {
        id: LOGFRAME_ID,
        name: 'E2E logical framework',
        goal: 'Verify data entry surfaces in reporting',
        entities: [SITE_A, SITE_B],
        start: null,
        end: null,
        indicators: [indicator],
        purposes: [],
    };

    return {
        _id: BASELINE_PROJECT_ID,
        owner,
        country: BASELINE.country,
        name: BASELINE.name,
        active: true,
        start: BASELINE.start,
        end: BASELINE.end,
        entities: [
            { id: SITE_A, name: BASELINE.siteAName, active: true },
            { id: SITE_B, name: BASELINE.siteBName, active: true },
        ],
        groups: [],
        forms: [dataSource],
        logicalFrames: [logicalFrame],
        extraIndicators: [],
    };
}

export async function seedBaselineProject(io, owner) {
    await io.database.collection('project').insertOne(buildBaselineProject(owner));
    await io.database
        .collection('input_seq')
        .insertOne({ _id: BASELINE_SEQ_ID, projectIds: [BASELINE_PROJECT_ID] });
}
