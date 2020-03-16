
const axios = require('axios');

const api = axios.create({
    baseURL: 'http://localhost:8000',
    headers: {
        Authorization: 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ik1EWXdSalpGUlVRMVFVWTVOekJHTXpReVJUTTBRVUZFTjBJNE5UaEJRalZHUVRZd1FqYzNRUSJ9.eyJpc3MiOiJodHRwczovL21vbml0b29sLmV1LmF1dGgwLmNvbS8iLCJzdWIiOiJnb29nbGUtb2F1dGgyfDEwOTI3MDkxNjUzOTIzMTc3OTAzNiIsImF1ZCI6WyJodHRwczovL2FwaS5tb25pdG9vbC5vcmciLCJodHRwczovL21vbml0b29sLmV1LmF1dGgwLmNvbS91c2VyaW5mbyJdLCJpYXQiOjE1ODAyMzcwODksImV4cCI6MTU4MDMyMzQ4OSwiYXpwIjoiejMxS3Q2RllwOFlERzRCeXBINHFwMWliTGQxTnM0TUUiLCJzY29wZSI6Im9wZW5pZCBwcm9maWxlIGVtYWlsIn0.kauGAuz4CesZQH46YVO-LgVqtP38lacXhba6SlGjqxD-GCI8Xn_QjROC6161poaKozTUKEfLrpymxY7I_EuxTLQgh_rykjuutJvTYvs79JuwX1b7n-7KVyqI1JPj1_Smwy-4z4D2o5jbCidrgSArbNpbYkRCZzJODf5wQ6MZf8UCI_O1cHOQ9rfbrQn4tk4yJlGR3oyzWNTWrUfvoDkEmuuEeAdGsEf4U5_oZmVrkOtQ9Ttrd3Gf8L9ipkRPnOq9Xl3HS9FtnUSdf_RHrZAqNSJUbkfRARC33JO_mmV4uqDPDgsBHXuzsnY4yKdHP-k1q3a12wLnpdBGhRhibWTmHg'
    }
})


describe('test', () => {
    let projectId;

    it('should create project', async () => {
        const response = await api.post('/resources/project', {
            owner: 'rgilliotte@gmail.com',
            active: true,
            "country": "testCountry",
            "name": "testProject",
            "start": "2010-01-01",
            "end": "2011-01-01",
            "entities": [
                {
                    "id": "0c243e08-8c21-4946-9f5f-ce255106901b", "name": "location1", "start": null, "end": null,
                },
                {
                    "id": "otherloc", "name": "location1", "start": null, "end": null,
                },
            ],
            "groups": [],
            "users": [],
            "logicalFrames": [],
            "extraIndicators": [],
            "forms": [
                {
                    "id": "8a7980f8-0e47-49bb-bf54-fdbe2013e3ea",
                    "name": "whatever",
                    "periodicity": "month",
                    "entities": ["0c243e08-8c21-4946-9f5f-ce255106901b"],
                    "start": null,
                    "end": null,
                    "elements": [
                        {
                            "id": '01c18ad2-f840-49c0-aaab-7a2c079c525c',
                            "name": "whatever",
                            "timeAgg": "sum",
                            "geoAgg": "sum",
                            "distribution": 0,
                            "partitions": []
                        },
                        {
                            "id": "c0cdae8e-4ebb-41e3-a68e-d8247d3ca7ce",
                            "name": "whatever",
                            "timeAgg": "sum",
                            "geoAgg": "sum",
                            "distribution": 0,
                            "partitions": [
                                {
                                    "id": "a7623d67-6cf0-42eb-b5b5-1d8c8dada396",
                                    "name": "whatever",
                                    "elements": [
                                        { "id": "da93cae1-9d79-413e-ae31-da25fe57cb47", "name": "whatever" },
                                        { "id": "bcda5c13-6b48-4a4c-82a9-21947b51459d", "name": "whatever2" }
                                    ],
                                    "groups": [],
                                    "aggregation": "sum"
                                },
                                {
                                    "id": "104b93c3-8d50-43b5-b149-4bf8d80a850a",
                                    "name": "whatever",
                                    "elements": [
                                        { "id": "26ca342c-f119-429a-9e11-0ef82f541376", "name": "whatever" },
                                        { "id": "8e568d78-e844-4563-9ff8-ecab5af06b31", "name": "whatever2" },
                                        { "id": "39ded232-3801-4745-ab7a-04e29371c0d5", "name": "whatever3" }
                                    ],
                                    "groups": [],
                                    "aggregation": "sum"
                                }
                            ]
                        }
                    ]
                }
            ]
        });

        projectId = response.data._id
        console.log(response.data)
    })

    it('should list project', async () => {
        const response = await api.get(`/resources/project`);
        console.log(response.data)
        console.log(response.headers)
    })

    it('should get project', async () => {
        const response = await api.get(`/resources/project/${projectId}`);
        console.log(response.data)

    })

    it.skip('should edit project', async () => {
        const response = await api.put(`/resources/project/${projectId}`, {
            _id: projectId,
            owner: 'rgilliotte@gmail.com',
            country: "testCountry2",
            name: "testProject",
            start: "2010-01-01",
            end: "2014-01-01",
            active: true,
            entities: [],
            groups: [],
            forms: [],
            logicalFrames: [],
            users: [],
            extraIndicators: [],
        });

        console.log(response.data)
    })

    it('should get revisions', async () => {
        const response = await api.get(`/resources/project/${projectId}/revisions`);
        console.log(response.data)

    })

    it('should allow writing inputs', async () => {
        const response = await api.post(`/resources/project/${projectId}/input`, {
            content: [
                {
                    variableId: '01c18ad2-f840-49c0-aaab-7a2c079c525c',
                    data: [34, 45],
                    dimensions: [
                        { id: 'time', attribute: 'month', items: ['2010-02', '2010-03'] },
                        { id: 'location', attribute: 'entity', items: ['0c243e08-8c21-4946-9f5f-ce255106901b'] },
                    ]
                },
                {
                    variableId: 'c0cdae8e-4ebb-41e3-a68e-d8247d3ca7ce',
                    data: [1, 2, 3, 4, 5, 6],

                    // optional?
                    dimensions: [
                        { id: 'time', attribute: 'month', items: ['2010-03'] },
                        { id: 'location', attribute: 'entity', items: ['0c243e08-8c21-4946-9f5f-ce255106901b'] },
                        {
                            id: "a7623d67-6cf0-42eb-b5b5-1d8c8dada396",
                            attribute: 'element',
                            items: ["da93cae1-9d79-413e-ae31-da25fe57cb47", "bcda5c13-6b48-4a4c-82a9-21947b51459d"]
                        },
                        {
                            id: "104b93c3-8d50-43b5-b149-4bf8d80a850a",
                            attribute: 'element',
                            items: ["26ca342c-f119-429a-9e11-0ef82f541376", "8e568d78-e844-4563-9ff8-ecab5af06b31", "39ded232-3801-4745-ab7a-04e29371c0d5"]
                        }
                    ],
                }
            ]
        });

        console.log(response.data);
    });

    it.skip('should allow fetching input for data entry of one variable by ', async () => {
        const response = await api.post(`/resources/project/${projectId}/reporting`, {
            formula: 'anc1 / anc * 100',
            parameters: {
                anc1: {
                    variableId: "c0cdae8e-4ebb-41e3-a68e-d8247d3ca7ce",
                    dice: [
                        {
                            id: "a7623d67-6cf0-42eb-b5b5-1d8c8dada396",
                            attribute: 'element',
                            items: ["da93cae1-9d79-413e-ae31-da25fe57cb47"]
                        },
                    ]
                },
                anc: {
                    variableId: "c0cdae8e-4ebb-41e3-a68e-d8247d3ca7ce",
                    dice: []
                }
            },
            dice: [
                {
                    id: 'time',
                    attribute: 'month',
                    items: ['2010-01', '2010-03'],
                },
                {
                    id: 'location',
                    attribute: 'entity',
                    items: ['0c243e08-8c21-4946-9f5f-ce255106901b'],
                },
            ],
            drill: [
                { dimensionId: 'time', attribute: 'month' },
            ],
            allowInterpolate: false
        });

        console.log(response.status);
        console.log(response.data);
    });

    it.skip('should allow fetching data entry status of many variables', async () => {
        const response = await api.post(`/resources/project/${projectId}/reporting`, {
            formula: '(!Number.isNaN(variable_1) + !Number.isNaN(variable_2)) / 2',
            parameters: {
                variable_1: {
                    variableId: "c0cdae8e-4ebb-41e3-a68e-d8247d3ca7ce",
                    dice: []
                },
                variable_2: {
                    variableId: "01c18ad2-f840-49c0-aaab-7a2c079c525c",
                    dice: []
                },
            },
            dice: [],
            dimensionIds: ['time', 'location']
        });

        console.log(response.data)
    });

    it('should allow fetching data before performing a data entry', async () => {
        const response = await api.post(`/resources/project/${projectId}/reporting`, {
            "formula": "cst",
            "parameters": {
                "cst": {
                    "variableId": "01c18ad2-f840-49c0-aaab-7a2c079c525c",
                    "dice": []
                }
            },
            "dice": [
                { "id": "time", "attribute": "month", "items": ["2010-08"] },
                { "id": "location", "attribute": "entity", "items": ["0c243e08-8c21-4946-9f5f-ce255106901b"] }
            ],
            "dimensionIds": [],
            "output": 'flatArray'
        });

        const response = await api.post(`/resources/project/${projectId}/reporting`, {
            dimensions: [
                { id: 'time', attribute: 'month', items: ['2015-01'] },
                { id: 'location', attribute: 'entity', items: ['0c243e08-8c21-4946-9f5f-ce255106901b'] },
            ],
            measures: [

            ],

        });

        console.log(response.data)
    })
});
