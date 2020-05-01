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
        const slWinStepW = 0.25 * slWinSizeW;
        const slWinStepH = 0.25 * slWinSizeH;
        for (let y = 0; y <= image.sizes[0] - slWinSizeH; y += slWinStepH) {
            for (let x = 0; x <= image.sizes[1] - slWinSizeW; x += slWinStepW) {
                const qrZone = new cv.Rect(x, y, slWinSizeW, slWinSizeH);
                const qrCode = image
                    .getRegion(qrZone)
                    .normalize(0, 255, cv.NORM_MINMAX)
                    .cvtColor(cv.COLOR_GRAY2RGBA);

                const value = jsQR(qrCode.getData(), qrCode.sizes[1], qrCode.sizes[0]);
                if (value) {
                    // Correct sliding window
                    for (let key in value.location) {
                        const location = value.location[key];
                        location.x = x + location.x;
                        location.y = y + location.y;
                    }

                    return value;
                }
            }
        }
    }

    throw new Error('Could not find QR-Code');
}

function reprojectFromCode(image, width, height) {
    // Find QR code
    let code = findQrCode(image);
    let contourPoints = [
        new cv.Point2(code.location.topLeftCorner.x, code.location.topLeftCorner.y),
        new cv.Point2(code.location.bottomLeftCorner.x, code.location.bottomLeftCorner.y),
        new cv.Point2(code.location.bottomRightCorner.x, code.location.bottomRightCorner.y),
        new cv.Point2(code.location.topRightCorner.x, code.location.topRightCorner.y),
    ];

    // Add a 30% border on the original image, to avoid black borders on perspective transform.
    let borderW = Math.floor(image.sizes[1] * 0.3);
    let borderH = Math.floor(image.sizes[0] * 0.3);
    image = image.copyMakeBorder(borderH, borderH, borderW, borderW, cv.BORDER_REPLICATE);
    contourPoints = contourPoints.map(p => p.add(new cv.Point2(borderW, borderH)));

    // Reproject image so that the QR code is in a known position on the top-right
    let margin = 0.15;
    let wRatio = width / 595;
    let hRatio = height / 842;
    let targetPoints = [
        new cv.Point2(493 * wRatio, 35 * hRatio),
        new cv.Point2(493 * wRatio, 119 * hRatio),
        new cv.Point2(577 * wRatio, 119 * hRatio),
        new cv.Point2(577 * wRatio, 35 * hRatio),
    ];

    targetPoints = targetPoints.map(
        p =>
            new Point2(
                (1 - 2 * margin) * p.x + margin * width,
                (1 - 2 * margin) * p.y + margin * height
            )
    );

    let transform = cv.getPerspectiveTransform(contourPoints, targetPoints);
    return image.warpPerspective(transform, new cv.Size(width, height));
}

module.exports = { readQrCode, findQrCode, reprojectFromCode };
