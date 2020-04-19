module.exports = {
    "type": "object",
    "additionalProperties": false,
    "required": [
        "email",
        "accepted"
    ],
    "properties": {
        "email": {
            "type": "string",
            "format": "email"
        },
        "accepted": {
            "type": "boolean"
        }
    }
}