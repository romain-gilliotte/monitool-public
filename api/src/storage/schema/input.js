module.exports = {
    "definitions": require('./_definitions'),
    "type": "object",
    "additionalProperties": false,
    "required": [
        "content"
    ],
    "properties": {
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