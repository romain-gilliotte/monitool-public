

module.exports = async (cube, rendererOpts) => {
    if (rendererOpts == 'report') return cube.getNestedObject('main', true, true);
    else if (rendererOpts == 'flatArray') return cube.getData('main');
    else if (rendererOpts == 'nestedArray') return cube.getNestedArray('main');
    else return cube.getNestedObject('main');
};
