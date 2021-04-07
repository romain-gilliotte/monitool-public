module.exports = {
    definitions: require('./_definitions'),
    type: 'object',
    additionalProperties: false,
    required: ['renderer', 'formula', 'parameters', 'aggregate', 'dice'],
    properties: {
        renderer: {
            enum: ['json', 'xlsx'],
        },
        rendererOpts: {},
        upto: {
            type: ['null', 'string'],
            pattern: '^[0-9a-f]{8}$',
        },
        formula: { $ref: '#/definitions/formula' },
        parameters: {
            type: 'object',
            additionalProperties: false,
            minProperties: 1,
            patternProperties: {
                '^[_a-z0-9]+$': {
                    type: 'object',
                    additionalProperties: false,
                    required: ['variableId', 'dice'],
                    properties: {
                        variableId: {
                            $ref: '#/definitions/uuid',
                        },
                        dice: {
                            $ref: '#/definitions/dice',
                        },
                    },
                },
            },
        },
        aggregate: {
            type: 'array',
            items: {
                type: 'object',
                required: ['id', 'attribute'],
                properties: {
                    id: { $ref: '#/definitions/dimensionId' },
                    attribute: { $ref: '#/definitions/dimensionAttribute' },
                },
            },
        },
        dice: {
            $ref: '#/definitions/dice',
        },
    },
};
