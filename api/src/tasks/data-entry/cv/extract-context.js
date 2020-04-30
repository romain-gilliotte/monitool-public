const jsQR = require('jsqr');
const { ObjectId } = require('mongodb');
const cv = require('opencv4nodejs');

function readQrCode(image) {
    const value = findQrCode(image);

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
}

function findQrCode(image) {
    image = image.cvtColor(cv.COLOR_BGR2GRAY);

    for (let scale = 1; scale < 4; ++scale) {
        const slWinSizeW = image.sizes[1] / scale;
        const slWinSizeH = image.sizes[0] / scale;
        const slWinStepW = 0.1 * slWinSizeW;
        const slWinStepH = 0.1 * slWinSizeH;
        for (let y = 0; y <= image.sizes[0] - slWinSizeH; y += slWinStepH) {
            for (let x = 0; x <= image.sizes[1] - slWinSizeW; x += slWinStepW) {
                const qrZone = new cv.Rect(x, y, slWinSizeW, slWinSizeH);
                const qrCode = image
                    .getRegion(qrZone)
                    .normalize(0, 255, cv.NORM_MINMAX)
                    .cvtColor(cv.COLOR_GRAY2RGBA);

                const value = jsQR(qrCode.getData(), qrCode.sizes[1], qrCode.sizes[0]);
                if (value) {
                    return value;
                }
            }
        }
    }

    throw new Error('Could not find QR-Code');
}

function reprojectFromCode(image, width, height) {
    const wRatio = width / 595;
    const hRatio = height / 842;
    const code = findQrCode(image);

    const contourPoints = [
        new cv.Point(code.location.topLeftCorner.x, code.location.topLeftCorner.y),
        new cv.Point(code.location.bottomLeftCorner.x, code.location.bottomLeftCorner.y),
        new cv.Point(code.location.bottomRightCorner.x, code.location.bottomRightCorner.y),
        new cv.Point(code.location.bottomRightCorner.x, code.location.bottomRightCorner.y),
    ];

    const targetPoints = [
        new cv.Point(493 * wRatio, 35 * hRatio),
        new cv.Point(493 * wRatio, 119 * hRatio),
        new cv.Point(577 * wRatio, 119 * hRatio),
        new cv.Point(577 * wRatio, 35 * hRatio),
    ];

    const transform = cv.getPerspectiveTransform(contourPoints, targetPoints);
    return image.warpPerspective(transform, new cv.Size(width, height));
}

module.exports = { readQrCode, findQrCode, reprojectFromCode };
