const cvModule = require('@techstark/opencv-js');

let instance = null;
let resolveReady;
const ready = new Promise(resolve => {
    resolveReady = resolve;
});

if (cvModule.Mat) {
    instance = cvModule;
    resolveReady();
} else {
    cvModule.onRuntimeInitialized = () => {
        instance = cvModule;
        resolveReady();
    };
}

function init() {
    return ready;
}

function cv() {
    if (!instance) {
        throw new Error('OpenCV WASM not initialized. Call init() and await it before using cv().');
    }
    return instance;
}

module.exports = { init, cv };
