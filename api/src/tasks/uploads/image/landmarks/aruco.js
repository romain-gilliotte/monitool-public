const { AR } = require('js-aruco');
const cv = require('opencv4nodejs');
const { slideOnImage } = require('./_helper');

/**
 *
 * @param {cv.Mat} image
 * @returns {Record<string, cv.Point2>}
 */
function findArucoMarkers(image) {
    const detector = new AR.Detector();
    const points = {};

    // Search in the image.
    slideOnImage(image, (region, rect) => {
        const gray = region.cvtColor(cv.COLOR_BGR2GRAY);
        const attempts = [
            region.cvtColor(cv.COLOR_BGR2RGBA),
            gray.threshold(0, 255, cv.THRESH_BINARY + cv.THRESH_OTSU).cvtColor(cv.COLOR_GRAY2RGBA),
            gray
                .adaptiveThreshold(255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, 21, 0)
                .cvtColor(cv.COLOR_GRAY2RGBA),
        ];

        for (let attempt of attempts) {
            const detected = detector.detect({
                data: attempt.getData(),
                width: rect.width,
                height: rect.height,
            });

            for (let marker of detected) {
                const corners = marker.corners;

                ['tl', 'tr', 'br', 'bl'].forEach((corner, index) => {
                    points[`aruco-${marker.id}-${corner}`] = new cv.Point2(
                        corners[index].x + rect.x,
                        corners[index].y + rect.y
                    );
                });
            }

            if (Object.keys(points).length >= 12) {
                break;
            }
        }

        // Stop when we have found all markers.
        return Object.keys(points).length >= 12;
    });

    return points;
}

module.exports = { findArucoMarkers };
