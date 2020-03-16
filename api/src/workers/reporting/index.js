const Bull = require('bull');
const CubeLoader = require('./cube-loader');
const ObjectId = require('mongodb').ObjectId;
const queue = new Bull('reporting');

queue.process('compute-report', async (job) => {
    try {
        return await computeReport(job.data);
    }
    catch (e) {
        console.log(e)
        throw e;
    }
});


async function computeReport(computation) {
    console.log(computation)

    const project = await database.collection('project').findOne(
        {
            _id: new ObjectId(computation.projectId)
        },
        {
            projection: {
                'start': true,
                'end': true,
                'entities.id': true,
                'groups.id': true,
                'groups.members': true,
                'forms.start': true,
                'forms.end': true,
                'forms.periodicity': true,
                'forms.elements.id': true,
                'forms.elements.timeAgg': true,
                'forms.elements.geoAgg': true,
                'forms.elements.partitions.id': true,
                'forms.elements.partitions.aggregation': true,
                'forms.elements.partitions.elements.id': true,
                'forms.elements.partitions.groups.id': true,
                'forms.elements.partitions.groups.members': true,
            }
        }
    );

    const loader = new CubeLoader(project);
    const cube = await loader.loadCubeFromComputation(computation);

    if (computation.output == 'flatArray') return cube.getFlatArray('main');
    else if (computation.output == 'nestedArray') return cube.getNestedArray('main');
    else return cube.getNestedObject('main');
}