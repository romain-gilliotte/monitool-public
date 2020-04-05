const assert = require('assert');
const axios = require('axios');
const fs = require('fs');
const _ = require('lodash');
const { ObjectId } = require('mongodb');

const api = axios.create({
    baseURL: 'http://localhost:8000',
    validateStatus: status => status >= 200 && status < 500,
    headers: {
        email: 'rgilliotte@gmail.com'
    }
});

before(async () => {
    process.env.MONITOOL_MONGO_DB = `monitool_${Math.random().toString(16).substr(2)}`;
    await require('../../src/main').start();
});

after(async () => {
    await require('../../src/main').stop();
});

describe('Project router', () => {
    let projectData;

    beforeEach(async () => {
        projectData = JSON.parse(fs.readFileSync('test/assets/project.json', 'utf8'));
    });

    describe('GET /project', () => {

        before(async () => {
            for (let i = 0; i < 10; ++i) {
                for (let email of ['rgilliotte@gmail.com', 'rgilliotte+1@gmail.com'])
                    await database.collection('project').insertOne({ owner: email, ...projectData });
            }
        });

        after(async () => {
            await database.dropCollection('project');
        });

        it('should retrieve all projets which are allowed', async () => {

        });

    });

    describe('GET /project/:id', () => {
        let projectId;

        before(async () => {
            const res = await database.collection('project').insertOne(projectData);
            projectId = res.insertedId;
        });

        it('Getting an inserted project should work', async () => {
            const response = await api.get(`/resources/project/${projectId} `);
            assert.equal(response.status, 200);
        });

        it('Getting a project with an invalid id should return 404', async () => {
            const response = await api.get(`/resources/project/abcdef`);
            assert.equal(response.status, 404);
        });

        it('Getting a project with a valid id, but not existing should return 404', async () => {
            const response = await api.get(`/resources/project/${new ObjectId().toHexString()} `);
            assert.equal(response.status, 404);
        });

        it('Getting a project which is not allowed for us should return 404', async () => {
            const response = await api.get(
                `/resources/project/${projectId} `,
                { headers: { email: 'otheremail@gmail.com' } }
            );

            assert.equal(response.status, 404);
        });
    });

    describe('GET /project/:id/revisions', () => {

    });

    describe('POST /project', () => {

        it('Creation should work if the passed object is valid', async () => {
            const response = await api.post('/resources/project', projectData);
            const { _id, ...project } = response.data;
            assert.ok(_id);
            assert.deepEqual(project, projectData);

            const dbProject = await database.collection('project').findOne({ _id: new ObjectId(_id) });
            assert.ok(dbProject);
        });

        it('Creation should return 400 if the object already has an id', async () => {
            const response = await api.post(
                '/resources/project',
                { _id: '5e7b7b87e20155423379cbf7', ...projectData }
            );

            assert.equal(response.status, 400);
        });

        it('Creation should return 400 if the object does not pass validation', async () => {
            delete projectData.entities;

            const response = await api.post('/resources/project', projectData);
            assert.equal(response.status, 400);
        });
    });

    describe('PUT /project/:id', () => {

    });

});
