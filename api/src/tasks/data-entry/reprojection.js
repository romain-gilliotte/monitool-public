const cv = require('opencv4nodejs');
const { findArucoMarkers } = require('./search/aruco');
const { getPageContour } = require('./search/page-contours');
const { findQrCode } = require('./search/qr-code');

function reproject(image, width, height) {
    // Find points in common
    const knownObj = findKnownPoints(image);
    const refObj = getReferencePoints(width, height);
    const known = [];
    const ref = [];
    for (let key in refObj) {
        if (knownObj[key]) {
            known.push(knownObj[key]);
            ref.push(refObj[key]);
        }
    }

    // reproject
    const homography = cv.findHomography(known, ref);
    return image.warpPerspective(homography.homography, new cv.Size(width, height));
}

function getReferencePoints(w, h) {
    const [hr, wr] = [h / 841, w / 594];

    return {
        'qr-tl': new cv.Point2(491 * wr, 20 * hr),
        'qr-tr': new cv.Point2(574 * wr, 20 * hr),
        'qr-bl': new cv.Point2(491 * wr, 104 * hr),
        'qr-br': new cv.Point2(574 * wr, 104 * hr),
        'aruco-62-br': new cv.Point2(44 * wr, 821 * hr),
        'aruco-62-tl': new cv.Point2(20 * wr, 797 * hr),
        'aruco-62-tr': new cv.Point2(44 * wr, 797 * hr),
        'aruco-62-bl': new cv.Point2(20 * wr, 821 * hr),
        'aruco-207-br': new cv.Point2(574 * wr, 821 * hr),
        'aruco-207-tl': new cv.Point2(550 * wr, 797 * hr),
        'aruco-207-tr': new cv.Point2(574 * wr, 797 * hr),
        'aruco-207-bl': new cv.Point2(550 * wr, 821 * hr),
        'corner-tl': new cv.Point2(0 * wr, 0 * hr),
        'corner-tr': new cv.Point2(594 * wr, 0 * hr),
        'corner-br': new cv.Point2(594 * wr, 841 * hr),
        'corner-bl': new cv.Point2(0 * wr, 841 * hr),
    };
}

function findKnownPoints(image) {
    const [qr, data] = findQrCode(image);
    const aruco = findArucoMarkers(image);
    const points = { ...aruco, ...qr };

    let corners = getPageContour(image);
    if (corners) {
        const cornerPoints = corners.getPoints();
        const trIndex = cornerPoints.reduce((memo, p2, index, arr) => {
            if (memo === null) return index;

            const qrtr = points['qr-tr'];
            const p1 = arr[memo];
            const d1 = (p1.x - qrtr.x) ** 2 + (p1.y - qrtr.y) ** 2;
            const d2 = (p2.x - qrtr.x) ** 2 + (p2.y - qrtr.y) ** 2;
            return d1 < d2 ? memo : index;
        }, null);

        points['corner-tr'] = cornerPoints[trIndex];
        points['corner-br'] = cornerPoints[(trIndex + 1) % 4];
        points['corner-bl'] = cornerPoints[(trIndex + 2) % 4];
        points['corner-tl'] = cornerPoints[(trIndex + 3) % 4];
    }

    return points;
}

function decodeQrCode(image) {
    const value = findQrCodes(image, 1)[0];

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
