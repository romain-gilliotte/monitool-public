const Ajv = require('ajv');
const TimeSlot = require('timeslot-dag');

const schema = require('../schema/input.json');
schema.definitions = require('../schema/shared.json');

const schemaValidate = new Ajv().compile(schema);

const timeAttributes = [
    "day", "month_week_sat", "month_week_sun", "month_week_mon", "week_sat",
    "week_sun", "week_mon", "month", "quarter", "semester", "year"
];

function validate(input) {
    // If schema validation does not pass, do not go further
    if (!schemaValidate(input)) {
        return schemaValidate.errors.map(error => {
            let path = error.dataPath;
            if (error.keyword === 'additionalProperties')
                path += `.${error.params.additionalProperty}`;

            return { path: path, code: error.keyword, message: error.message };
        });
    }

    const errors = [];
    input.content.forEach(content => {
        const expectedLength = content.dimensions.reduce((m, d) => m * d.items.length, 1);
        if (expectedLength !== content.data.length)
            errors.push({ code: 'invalid length' })

        for (let dimension of content.dimensions) {
            if (dimension.id === 'time') {
                if (!timeAttributes.includes(dimension.attribute))
                    errors.push({ code: 'invalid attribute' });

                const itemsValid = dimension.items.every(item => {
                    try {
                        return TimeSlot.fromValue(item).periodicity === dimension.attribute
                    }
                    catch (e) {
                        return false;
                    }
                });

                if (!itemsValid)
                    errors.push({ code: 'time item invalid' });
            }
            else if (dimension.id == 'location') {
                if (dimension.attribute !== 'entity')
                    errors.push({ code: 'invalid location attribute' });
            }
        }
    });

    return errors;
}

module.exports = validate;