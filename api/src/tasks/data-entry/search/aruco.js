const { AR } = require('js-aruco');
const cv = require('opencv4nodejs');
const { slideOnImage } = require('./_helper');

function findArucoMarkers(image) {
    const detector = new AR.Detector();
    const points = {};

    // Search in the image.
    slideOnImage(image, (region, rectangle) => {
        for (let i = 0; i < 2; ++i) {
            let local = region;

            if (i == 0) {
                // Otsu threshold the image before giving to detector.
                // It seems to help it a lot with bad images.
                local = local.cvtColor(cv.COLOR_BGR2GRAY);
                local = local.threshold(0, 255, cv.THRESH_BINARY + cv.THRESH_OTSU);
                local = local.cvtColor(cv.COLOR_GRAY2RGBA);
            } else if (i == 1) {
                local = local.cvtColor(cv.COLOR_BGR2GRAY);
                local = local.adaptiveThreshold(
                    255,
                    cv.ADAPTIVE_THRESH_GAUSSIAN_C,
                    cv.THRESH_BINARY,
                    21,
                    0
                );
                local = local.cvtColor(cv.COLOR_GRAY2RGBA);
            } else {
                local = local.cvtColor(cv.COLOR_BGR2RGBA);
            }

            const detected = detector.detect({
                data: local.getData(),
                width: rectangle.width,
                height: rectangle.height,
            });

            for (let marker of detected) {
                const corners = marker.corners;
                ['tl', 'tr', 'br', 'bl'].forEach((key, index) => {
                    points[`aruco-${marker.id}-${key}`] = new cv.Point2(
                        corners[index].x + rectangle.x,
                        corners[index].y + rectangle.y
                    );
                });
            }
        }

        // Stop when we have found both markers.
        return Object.keys(points).length >= 8;
    });

    return points;
}

module.exports = { findArucoMarkers };
