module.exports = {
    type: 'object',
    additionalProperties: false,
    required: ['id', 'name', 'periodicity', 'active', 'elements'],
    properties: {
        id: {
            $ref: '#/definitions/uuid',
        },
        name: {
            type: 'string',
            minLength: 1,
        },
        entities: {
            type: 'array',
            uniqueItems: true,
            items: {
                $ref: '#/definitions/uuid',
            },
        },
        periodicity: {
            type: 'string',
            enum: [
                'day',
                'week_sat',
                'week_sun',
                'week_mon',
                'month_week_sat',
                'month_week_sun',
                'month_week_mon',
                'month',
                'quarter',
                'semester',
                'year',
            ],
        },
        active: {
            type: 'boolean',
        },
        elements: {
            type: 'array',
            minItems: 1,
            items: {
                type: 'object',
                additionalProperties: false,
                required: [
                    'id',
                    'name',
                    'active',
                    'timeAgg',
                    'geoAgg',
                    'partitions',
                    'distribution',
                ],
                properties: {
                    id: {
                        $ref: '#/definitions/uuid',
                    },
                    name: {
                        type: 'string',
                        minLength: 1,
                    },
                    active: {
                        type: 'boolean',
                    },
                    timeAgg: {
                        type: 'string',
                        enum: ['none', 'sum', 'average', 'highest', 'lowest', 'last'],
                    },
                    geoAgg: {
                        type: 'string',
                        enum: ['none', 'sum', 'average', 'highest', 'lowest', 'last'],
                    },
                    distribution: {
                        type: 'number',
                    },
                    partitions: {
                        type: 'array',
                        maxItems: 5,
                        items: {
                            type: 'object',
                            additionalProperties: false,
                            required: ['id', 'name', 'active', 'aggregation', 'elements', 'groups'],
                            properties: {
                                id: {
                                    $ref: '#/definitions/uuid',
                                },
                                name: {
                                    type: 'string',
                                    minLength: 1,
                                },
                                active: {
                                    type: 'boolean',
                                },
                                aggregation: {
                                    type: 'string',
                                    enum: ['sum', 'average', 'highest', 'lowest', 'last'],
                                },
                                elements: {
                                    type: 'array',
                                    minItems: 2,
                                    maxItems: 255,
                                    items: {
                                        type: 'object',
                                        additionalProperties: false,
                                        required: ['id', 'active', 'name'],
                                        properties: {
                                            id: {
                                                $ref: '#/definitions/uuid',
                                            },
                                            active: {
                                                type: 'boolean',
                                            },
                                            name: {
                                                type: 'string',
                                                minLength: 1,
                                            },
                                        },
                                    },
                                },
                                groups: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        additionalProperties: false,
                                        required: ['id', 'name', 'members'],
                                        properties: {
                                            id: {
                                                $ref: '#/definitions/uuid',
                                            },
                                            name: {
                                                type: 'string',
                                                minLength: 1,
                                            },
                                            members: {
                                                type: 'array',
                                                uniqueItems: true,
                                                items: {
                                                    $ref: '#/definitions/uuid',
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    },
};
