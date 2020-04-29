const jsQR = require('jsqr');
const { ObjectId } = require('mongodb');
const cv = require('opencv4nodejs');

function readQrCode(page) {
    const slWinStep = 20;
    const slWinSize = 250;
    const width = page.sizes[1];

    for (let offset = slWinSize; offset < 500; offset += slWinStep) {
        const qrZone = new cv.Rect(width - offset, 0, slWinSize, slWinSize);
        const qrCode = page
            .getRegion(qrZone)
            .cvtColor(cv.COLOR_BGR2GRAY) // help detection by normalizing
            .normalize(0, 255, cv.NORM_MINMAX)
            .cvtColor(cv.COLOR_GRAY2RGBA);

        const value = jsQR(qrCode.getData(), qrCode.sizes[1], qrCode.sizes[0]);
        if (value) {
            try {
                if (value.binaryData.length !== 17) {
                    throw new Error('Invalid length');
                }

                const code = Buffer.from(value.binaryData).toString('hex');
                const projectId = new ObjectId(code.substr(0, 24));
                const dataSourceIdPrefix = code.substr(24, 8);
                const pageNo = parseInt(code.substr(32, 2), 16);

                return {
                    projectId,
                    dataSourceIdPrefix,
                    pageNo,
                    orientation: 'portrait',
                    language: 'fr',
                };
            } catch (e) {
                // We found another QR-code => skip.
            }
        }
    }

    throw new Error('Could not find QR-Code');
}

module.exports = { readQrCode };
