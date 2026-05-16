const jsQR = require('jsqr');
const { cv } = require('../../../../helpers/cv');
const { slideOnImage } = require('./_helper');

/**
 * Find QR code in a Matrix, and return its data and corner positions.
 *
 * @param {import('@techstark/opencv-js').Mat} image
 * @returns {Promise<[Record<string, {x: number, y: number}>, Buffer]>}
 */
async function findQrCode(image) {
    const c = cv();
    const gray = new c.Mat();
    c.cvtColor(image, gray, c.COLOR_BGR2GRAY);

    let value;
    try {
        await slideOnImage(gray, async (region, rect) => {
            const rgba = new c.Mat();
            try {
                c.cvtColor(region, rgba, c.COLOR_GRAY2RGBA);
                const code = jsQR(rgba.data, rect.width, rect.height);

                if (code && code.binaryData.length) {
                    for (let key in code.location) {
                        const location = code.location[key];
                        code.location[key] = { x: rect.x + location.x, y: rect.y + location.y };
                    }
                    value = code;
                }
            } finally {
                rgba.delete();
            }
            return !!value;
        });
    } finally {
        gray.delete();
    }

    if (!value) {
        throw new Error('Could not find QR-Code in provided image');
    }

    const location = {
        'qr-tl': value.location.topLeftCorner,
        'qr-tr': value.location.topRightCorner,
        'qr-br': value.location.bottomRightCorner,
        'qr-bl': value.location.bottomLeftCorner,
    };

    return [location, Buffer.from(value.binaryData)];
}

module.exports = { findQrCode };
