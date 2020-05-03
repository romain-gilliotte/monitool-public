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
    if (!qr) {
        throw new Error('Failed to find QR code.');
    }

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

const image = cv.imread('data/WhatsApp Image 2020-05-02 at 16.23.05.jpeg').resize(1600, 1200);
const newImage = reproject(image, 600, 800);
cv.imshowWait('toto', newImage);

// function reprojectFromCode(image, width, height) {
//     // Find QR code
//     let code = findQrCode(image);
//     let contourPoints = [
//         new cv.Point2(code.location.topLeftCorner.x, code.location.topLeftCorner.y),
//         new cv.Point2(code.location.bottomLeftCorner.x, code.location.bottomLeftCorner.y),
//         new cv.Point2(code.location.bottomRightCorner.x, code.location.bottomRightCorner.y),
//         new cv.Point2(code.location.topRightCorner.x, code.location.topRightCorner.y),
//     ];

//     // Add a 30% border on the original image, to avoid black borders on perspective transform.
//     let borderW = Math.floor(image.sizes[1] * 0.5);
//     let borderH = Math.floor(image.sizes[0] * 0.5);
//     image = image.copyMakeBorder(borderH, borderH, borderW, borderW, cv.BORDER_REPLICATE);
//     contourPoints = contourPoints.map(p => p.add(new cv.Point2(borderW, borderH)));

//     // Reproject image so that the QR code is in a known position on the top-right, with
//     // some margin to spare
//     const qrWidth = 0.1 * width;
//     let targetPoints = [
//         new cv.Point2(0.8 * width, 0.1 * height),
//         new cv.Point2(0.8 * width, 0.1 * height + qrWidth),
//         new cv.Point2(0.8 * width + qrWidth, 0.1 * height + qrWidth),
//         new cv.Point2(0.8 * width + qrWidth, 0.1 * height),
//     ];

//     let transform = cv.getPerspectiveTransform(contourPoints, targetPoints);
//     return image.warpPerspective(transform, new cv.Size(width, height));
// }

// /**
//  * Use Edge detection to find something big and with four sides on a picture.
//  * This allows finding a form in a simple background with reasonable accuracy.
//  *
//  * @see https://bretahajek.com/2017/01/scanning-documents-photos-opencv/
//  * @see https://stackoverflow.com/questions/43009923/how-to-complete-close-a-contour-in-python-opencv
//  * @see https://stackoverflow.com/questions/8667818/opencv-c-obj-c-detecting-a-sheet-of-paper-square-detection
//  */
// function extractPage(image, width, height, prefix = 'test-') {
//     const contourPoints = getPageContour(image).getPoints();
//     const targetPoints = [
//         new cv.Point2(0, 0),
//         new cv.Point2(0, height),
//         new cv.Point2(width, height),
//         new cv.Point2(width, 0),
//     ];

//     const transform = cv.getPerspectiveTransform(contourPoints, targetPoints);
//     return image.warpPerspective(transform, new cv.Size(width, height));
// }

// module.exports = { reprojectFromCode, slideOnImage };
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
