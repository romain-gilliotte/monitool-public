const jsQR = require('jsqr');
const cv = require('opencv4nodejs');
const { slideOnImage } = require('./_helper');

function findQrCode(image) {
    let value;

    // Otsu threshold the image before giving to detector.
    // It seems to help it a lot with bad images.
    image = image.cvtColor(cv.COLOR_BGR2GRAY);

    slideOnImage(image, (region, rectangle) => {
        // region = region.threshold(0, 255, cv.THRESH_BINARY + cv.THRESH_OTSU);

        let code = jsQR(
            region.cvtColor(cv.COLOR_GRAY2RGBA).getData(),
            rectangle.width,
            rectangle.height
        );

        if (code) {
            // Fix coordinates
            for (let key in code.location) {
                const location = code.location[key];
                code.location[key] = new cv.Point2(
                    rectangle.x + location.x,
                    rectangle.y + location.y
                );
            }

            value = code;
        }

        return !!value;
    });

    const location = {
        'qr-tl': value.location.topLeftCorner,
        'qr-tr': value.location.topRightCorner,
        'qr-br': value.location.bottomRightCorner,
        'qr-bl': value.location.bottomLeftCorner,
    };

    return [location, value.binaryData];
}

module.exports = { findQrCode };
