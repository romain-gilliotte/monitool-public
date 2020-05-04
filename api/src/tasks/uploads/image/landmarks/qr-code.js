const jsQR = require('jsqr');
const cv = require('opencv4nodejs');
const { slideOnImage } = require('./_helper');

/**
 * Find QR code in a Matrix, and return its data and corner positions.
 *
 * @param {cv.Mat} image
 * @returns {[Record<string, {x: number, y: number, w: number, h: number}>, Buffer]}
 */
function findQrCode(image) {
    let value;

    // Otsu threshold the image before giving to detector.
    // It seems to help it a lot with bad images.
    image = image.cvtColor(cv.COLOR_BGR2GRAY);

    slideOnImage(image, (region, rect) => {
        // region = region.threshold(0, 255, cv.THRESH_BINARY + cv.THRESH_OTSU);

        let code = jsQR(region.cvtColor(cv.COLOR_GRAY2RGBA).getData(), rect.width, rect.height);

        // reject empty codes, which this lib detects sometimes
        if (code && code.binaryData.length) {
            for (let key in code.location) {
                const location = code.location[key];
                code.location[key] = new cv.Point2(rect.x + location.x, rect.y + location.y);
            }

            value = code;
        }

        return !!value;
    });

    try {
        const location = {
            'qr-tl': value.location.topLeftCorner,
            'qr-tr': value.location.topRightCorner,
            'qr-br': value.location.bottomRightCorner,
            'qr-bl': value.location.bottomLeftCorner,
        };

        return [location, Buffer.from(value.binaryData)];
    } catch (e) {
        throw new Error('Could not find QR-Code in provided image');
    }
}

module.exports = { findQrCode };
