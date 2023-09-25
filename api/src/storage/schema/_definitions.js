module.exports = {
    dice: {
        type: 'array',
        items: {
            oneOf: [
                {
                    type: 'object',
                    required: ['id', 'attribute', 'items'],
                    additionalProperties: false,
                    properties: {
                        id: { $ref: '#/definitions/dimensionId' },
                        attribute: { $ref: '#/definitions/dimensionAttribute' },
                        items: {
                            $ref: '#/definitions/dimensionItems',
                        },
                    },
                },
                {
                    type: 'object',
                    required: ['id', 'attribute', 'range'],
                    additionalProperties: false,
                    properties: {
                        id: { $ref: '#/definitions/dimensionId' },
                        attribute: { $ref: '#/definitions/dimensionAttribute' },
                        range: {
                            type: 'array',
                            minItems: 2,
                            maxItems: 2,
                            items: [
                                { oneOf: [{ type: 'null' }, { $ref: '#/definitions/timeslot' }] },
                                { oneOf: [{ type: 'null' }, { $ref: '#/definitions/timeslot' }] },
                            ],
                        },
                    },
                },
            ],
        },
    },
    dimensionId: {
        oneOf: [
            {
                enum: ['time', 'location'],
            },
            {
                $ref: '#/definitions/uuid',
            },
        ],
    },
    dimensionAttribute: {
        oneOf: [
            {
                enum: [
                    'day',
                    'month_week_sat',
                    'month_week_sun',
                    'month_week_mon',
                    'week_sat',
                    'week_sun',
                    'week_mon',
                    'month',
                    'quarter',
                    'semester',
                    'year',
                    'entity',
                    'element',
                ],
            },
            {
                $ref: '#/definitions/dimensionId',
            },
        ],
    },
    dimensionItems: {
        oneOf: [
            {
                type: 'array',
                uniqueItems: true,
                maxItems: 255,
                items: {
                    $ref: '#/definitions/uuid',
                },
            },
            {
                type: 'array',
                uniqueItems: true,
                maxItems: 255,
                items: {
                    $ref: '#/definitions/timeslot',
                },
            },
        ],
    },
    timeslot: {
        type: 'string',
        minLength: 1,
        maxLength: 20, // fixme: write a pattern
    },
    uuid: {
        type: 'string',
        pattern: '^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$',
    },
    indicators: {
        type: 'array',
        items: {
            $ref: '#/definitions/indicator',
        },
    },
    indicator: {
        type: 'object',
        additionalProperties: false,
        required: ['baseline', 'target', 'colorize', 'display', 'computation'],
        properties: {
            display: {
                type: 'string',
                minLength: 1,
            },
            baseline: {
                oneOf: [
                    {
                        type: 'null',
                    },
                    {
                        type: 'number',
                    },
                ],
            },
            target: {
                oneOf: [
                    {
                        type: 'null',
                    },
                    {
                        type: 'number',
                    },
                ],
            },
            colorize: {
                type: 'boolean',
            },
            computation: {
                $ref: '#/definitions/computation',
            },
        },
    },
    formula: {
        type: 'string',
        minLength: 1,
    },
    computation: {
        oneOf: [
            {
                type: 'object',
                additionalProperties: false,
                required: ['formula', 'parameters'],
                properties: {
                    formula: { $ref: '#/definitions/formula' },
                    parameters: {
                        type: 'object',
                        additionalProperties: false,
                        patternProperties: {
                            '.*': {
                                type: 'object',
                                additionalProperties: false,
                                required: ['elementId', 'filter'],
                                properties: {
                                    elementId: {
                                        $ref: '#/definitions/uuid',
                                    },
                                    filter: {
                                        type: 'object',
                                        additionalProperties: false,
                                        patternProperties: {
                                            '.*': {
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
            {
                type: 'null',
            },
        ],
    },
};
