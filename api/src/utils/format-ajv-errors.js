module.exports = errors => {
    return errors.map(error => {
        let path = error.instancePath;
        if (error.keyword === 'additionalProperties') {
            path += `.${error.params.additionalProperty}`;
        }

        return { path: path, code: error.keyword, message: error.message };
    });
};
