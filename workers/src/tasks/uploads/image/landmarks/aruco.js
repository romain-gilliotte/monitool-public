import jsAruco from 'js-aruco';
const { AR } = jsAruco;
import { cv } from '../../../../helpers/cv.js';
import { slideOnImage } from './_helper.js';
/**
 * @param {import('@techstark/opencv-js').Mat} image
 * @returns {Promise<Record<string, {x: number, y: number}>>}
 */
async function findArucoMarkers(image) {
    const c = cv();
    const detector = new AR.Detector();
    const points = {};

    await slideOnImage(image, async (region, rect) => {
        const gray = new c.Mat();
        const threshold = new c.Mat();
        const adaptative = new c.Mat();
        const attemptColor = new c.Mat();
        const attemptThresh = new c.Mat();
        const attemptAdapt = new c.Mat();

        try {
            c.cvtColor(region, gray, c.COLOR_BGR2GRAY);
            c.threshold(gray, threshold, 0, 255, c.THRESH_BINARY + c.THRESH_OTSU);
            c.adaptiveThreshold(
                gray,
                adaptative,
                255,
                c.ADAPTIVE_THRESH_GAUSSIAN_C,
                c.THRESH_BINARY,
                21,
                0
            );

            c.cvtColor(region, attemptColor, c.COLOR_BGR2RGBA);
            c.cvtColor(threshold, attemptThresh, c.COLOR_GRAY2RGBA);
            c.cvtColor(adaptative, attemptAdapt, c.COLOR_GRAY2RGBA);

            const attempts = [attemptColor, attemptThresh, attemptAdapt];
            for (const attempt of attempts) {
                const detected = detector.detect({
                    data: attempt.data,
                    width: rect.width,
                    height: rect.height,
                });

                for (const marker of detected) {
                    const corners = marker.corners;
                    ['tl', 'tr', 'br', 'bl'].forEach((corner, index) => {
                        points[`aruco-${marker.id}-${corner}`] = {
                            x: corners[index].x + rect.x,
                            y: corners[index].y + rect.y,
                        };
                    });
                }

                if (Object.keys(points).length >= 12) {
                    break;
                }
            }
        } finally {
            gray.delete();
            threshold.delete();
            adaptative.delete();
            attemptColor.delete();
            attemptThresh.delete();
            attemptAdapt.delete();
        }

        return Object.keys(points).length >= 12;
    });

    return points;
}

export { findArucoMarkers };
