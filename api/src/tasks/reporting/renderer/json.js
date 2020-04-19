const filename = null;
const mimeType = 'application/json';

module.exports = async (cube, rendererOpts) => {
    let result;
    if (rendererOpts == 'report') result = cube.getNestedObject('main', true, true);
    else if (rendererOpts == 'flatArray') result = cube.getData('main');
    else if (rendererOpts == 'nestedArray') result = cube.getNestedArray('main');
    else result = cube.getNestedObject('main');

    const payload = Buffer.from(JSON.stringify(result));
    return { mimeType, payload, filename };
};
