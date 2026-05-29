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

// A second, disaggregated data source (2 partitions x 2 elements) used by the
// multi-partition data-entry spec. Lives in the same baseline project / sequence
// so its inputs flow through BASELINE_SEQ_ID like the partition-free variable.
export const DATASOURCE_PARTITIONED_ID = 'bbbbbbbb-0000-4000-8000-000000000002';
export const VARIABLE_PARTITIONED_ID = 'cccccccc-0000-4000-8000-000000000002';
export const PARTITION_SEX_ID = 'eeeeeeee-0000-4000-8000-000000000001';
export const PARTITION_AGE_ID = 'eeeeeeee-0000-4000-8000-000000000002';
export const SEX_M_ID = 'ffffffff-0000-4000-8000-000000000001';
export const SEX_F_ID = 'ffffffff-0000-4000-8000-000000000002';
export const AGE_LT5_ID = 'ffffffff-0000-4000-8000-000000000011';
export const AGE_GTE5_ID = 'ffffffff-0000-4000-8000-000000000012';

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
    partitionedDatasourceName: 'Disaggregated activity report',
    partitionedVariableName: 'Consultations by sex and age',
    partitionedIndicatorName: 'Total disaggregated consultations',
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

    // Disaggregated variable: 2 partitions (Sex, Age) x 2 elements each.
    // distribution:1 puts one partition on columns and one on rows in the grid.
    const partitionedVariable = {
        id: VARIABLE_PARTITIONED_ID,
        name: BASELINE.partitionedVariableName,
        active: true,
        timeAgg: 'sum',
        geoAgg: 'sum',
        distribution: 1,
        partitions: [
            {
                id: PARTITION_SEX_ID,
                name: 'Sex',
                active: true,
                aggregation: 'sum',
                groups: [],
                elements: [
                    { id: SEX_M_ID, name: 'Male', active: true },
                    { id: SEX_F_ID, name: 'Female', active: true },
                ],
            },
            {
                id: PARTITION_AGE_ID,
                name: 'Age',
                active: true,
                aggregation: 'sum',
                groups: [],
                elements: [
                    { id: AGE_LT5_ID, name: '<5', active: true },
                    { id: AGE_GTE5_ID, name: '>=5', active: true },
                ],
            },
        ],
    };

    const partitionedDataSource = {
        id: DATASOURCE_PARTITIONED_ID,
        name: BASELINE.partitionedDatasourceName,
        periodicity: 'month',
        active: true,
        entities: [SITE_A, SITE_B],
        elements: [partitionedVariable],
    };

    const partitionedIndicator = {
        display: BASELINE.partitionedIndicatorName,
        baseline: null,
        target: null,
        colorize: false,
        computation: {
            formula: 'a',
            parameters: { a: { elementId: VARIABLE_PARTITIONED_ID, filter: {} } },
        },
    };

    const logicalFrame = {
        id: LOGFRAME_ID,
        name: 'E2E logical framework',
        goal: 'Verify data entry surfaces in reporting',
        entities: [SITE_A, SITE_B],
        start: null,
        end: null,
        indicators: [indicator, partitionedIndicator],
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
        forms: [dataSource, partitionedDataSource],
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
