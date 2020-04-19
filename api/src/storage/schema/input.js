module.exports = {
    "definitions": require('./_definitions'),
    "type": "object",
    "additionalProperties": false,
    "required": [
        "content",
        "projectId"
    ],
    "properties": {
        "projectId": {
            "type": "string",
            "pattern": "^[0-9a-f]{24}$"
        },
        "content": {
            "type": "array",
            "items": {
                "type": "object",
                "additionalProperties": false,
                "required": [
                    "variableId",
                    "data",
                    "dimensions"
                ],
                "properties": {
                    "variableId": {
                        "$ref": "#/definitions/uuid"
                    },
                    "data": {
                        "type": "array",
                        "items": {
                            "type": [
                                "null",
                                "number"
                            ]
                        }
                    },
                    "dimensions": {
                        "$ref": "#/definitions/dice"
                    }
                }
            }
        }
    }
}