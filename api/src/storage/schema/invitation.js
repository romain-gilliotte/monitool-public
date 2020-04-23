module.exports = {
    definitions: require('./_definitions'),
    type: 'object',
    additionalProperties: false,
    required: ['email', 'accepted'],
    properties: {
        projectId: {
            type: 'string',
            match: '^[0-9a-z]{24}$',
        },
        email: {
            type: 'string',
            format: 'email',
        },
        accepted: {
            type: 'boolean',
        },
        dataEntry: {
            type: 'object',
            required: ['dataSourceIds', 'siteIds'],
            properties: {
                dataSourceIds: {
                    type: 'array',
                    uniqueItems: true,
                    items: {
                        $ref: '#/definitions/uuid',
                    },
                },
                siteIds: {
                    type: 'array',
                    uniqueItems: true,
                    items: {
                        $ref: '#/definitions/uuid',
                    },
                },
            },
        },
    },
};
