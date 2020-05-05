const cv = require('opencv4nodejs');
const { findArucoMarkers } = require('./landmarks/aruco');
const { getPageContour } = require('./landmarks/page-contours');
const { findQrCode } = require('./landmarks/qr-code');

const MAX_PROCESSING_SIZE = 2560;
const THUMBNAIL_SIZE = 200;

async function processImageUpload(upload) {
    let original = cv.imdecode(upload.original.data.buffer, cv.IMREAD_COLOR);

    // Resize source image if too big. This hurts feature detection, but otherwise it takes ages.
    if (MAX_PROCESSING_SIZE < original.sizes[0] || MAX_PROCESSING_SIZE < original.sizes[1]) {
        const scale = Math.min(
            MAX_PROCESSING_SIZE / original.sizes[0],
            MAX_PROCESSING_SIZE / original.sizes[1]
        );

        const sizes = original.sizes.map(l => Math.floor(l * scale));
        original = original.resize(sizes[0], sizes[1], 0, 0, cv.INTER_CUBIC);
    }

    // Find reference from the QR code.
    const [qrLandmarks, data] = findQrCode(original);
    const [templateId, pageNo] = [data.slice(0, 6), data[6]];
    const template = await database.collection('fs.files').findOne({ 'metadata.id': templateId });
    if (!template) throw Error('Could not find associated form');

    // Depending on file orientation, chose final size of our image (50px/cm is ~ 125dpi).
    let width, height;
    if (template.metadata.orientation === 'portrait') {
        [width, height] = [21.0 * 50, 29.7 * 50];
    } else {
        [width, height] = [29.7 * 50, 21.0 * 50];
    }

    // Compute regions from template
    const regions = {};
    for (let r in template.metadata.boundaries) {
        const { x, y, w, h, pageNo: boundaryPageNo } = template.metadata.boundaries[r];
        if (r === 'corner' || r === 'qr' || r.startsWith('aruco')) continue;
        if (Number.isFinite(boundaryPageNo) && pageNo !== boundaryPageNo) continue;

        regions[r] = { x: x * width, y: y * height, w: w * width, h: h * height };
    }

    // Find points in common
    const landmarksObj = findLandmarks(original, qrLandmarks);
    const targetObj = computeTargets(template, pageNo, width, height);
    const landmarks = [];
    const target = [];
    for (let key in targetObj) {
        if (landmarksObj[key]) {
            landmarks.push(landmarksObj[key]);
            target.push(targetObj[key]);
        }
    }

    // Reproject and hope for the best.
    const homography = cv.findHomography(landmarks, target);
    const document = original.warpPerspective(homography.homography, new cv.Size(width, height));
    const jpeg = cv.imencode('.jpg', document, [cv.IMWRITE_JPEG_QUALITY, 60]);

    return {
        $set: {
            status: 'pending_dataentry',
            dataSourceId: template.metadata.dataSourceId,
            thumbnail: getThumbnail(original),
            reprojected: {
                size: jpeg.byteLength,
                mimeType: 'image/jpeg',
                data: jpeg,
                regions,
            },
        },
    };
}

function findLandmarks(image, qrLandmarks) {
    const aruco = findArucoMarkers(image);
    const points = { ...aruco, ...qrLandmarks };

    if (Object.keys(points).length < 12) {
        let contour = getPageContour(image);
        if (contour) {
            const corners = contour.getPoints();

            // We don't know if the contour is clockwise or counter clockwise.
            // => Sort the points in clockwise order.
            const centroid = corners.reduce(
                (m, p) => new cv.Point2(m.x + p.x / 4, m.y + p.y / 4),
                new cv.Point2(0, 0)
            );
            corners.sort((a, b) => {
                const angleA = Math.atan2(a.y - centroid.y, a.x - centroid.x);
                const angleB = Math.atan2(b.y - centroid.y, b.x - centroid.x);
                return angleA - angleB;
            });

            // Find top-right corner (closest from the QR-code).
            const trIndex = corners.reduce((memo, p2, index, arr) => {
                if (memo === null) return index;

                const qrtr = points['qr-tr'];
                const p1 = arr[memo];
                const d1 = (p1.x - qrtr.x) ** 2 + (p1.y - qrtr.y) ** 2;
                const d2 = (p2.x - qrtr.x) ** 2 + (p2.y - qrtr.y) ** 2;
                return d1 < d2 ? memo : index;
            }, null);

            points['corner-tr'] = corners[trIndex];
            points['corner-br'] = corners[(trIndex + 1) % 4];
            points['corner-bl'] = corners[(trIndex + 2) % 4];
            points['corner-tl'] = corners[(trIndex + 3) % 4];
        }
    }

    return points;
}

function computeTargets(file, pageNo, w, h) {
    const boundaries = file.metadata.boundaries;
    const targets = {};
    for (let key in boundaries) {
        const rect = boundaries[key];
        if (rect.pageNo !== undefined && rect.pageNo !== pageNo) {
            continue;
        }

        targets[`${key}-tl`] = new cv.Point2(rect.x * w, rect.y * h);
        targets[`${key}-tr`] = new cv.Point2((rect.x + rect.w) * w, rect.y * h);
        targets[`${key}-bl`] = new cv.Point2(rect.x * w, (rect.y + rect.h) * h);
        targets[`${key}-br`] = new cv.Point2((rect.x + rect.w) * w, (rect.y + rect.h) * h);
    }

    return targets;
}

/**
 *
 * @param {cv.Mat} image
 */
function getThumbnail(image) {
    const [h, w] = image.sizes;
    const minLength = Math.min(w, h);
    const rect = new cv.Rect(Math.floor(0.5 * (w - minLength)), 0, minLength, minLength);
    const thumbnail = image.getRegion(rect).resize(THUMBNAIL_SIZE, THUMBNAIL_SIZE);

    const jpeg = cv.imencode('.jpg', thumbnail, [cv.IMWRITE_JPEG_QUALITY, 60]);

    return {
        size: jpeg.byteLength,
        mimeType: 'image/jpeg',
        data: jpeg,
    };
}

module.exports = { processImageUpload, findLandmarks, computeTargets };
