const { cv } = require('../../../helpers/cv');
const { decodeImage, encodeJpeg, pointsToMat, withMats } = require('../../../helpers/cv-bridge');
const { findArucoMarkers } = require('./landmarks/aruco');
const { getPageContour } = require('./landmarks/page-contours');
const { findQrCode } = require('./landmarks/qr-code');

const MAX_SIZE = 2560;

/**
 * @param {import('../../../io').InputOutput} io
 * @param {any} upload
 */
async function processImageUpload(io, upload) {
    const c = cv();
    let original = await decodeImage(upload.original.data.buffer);

    try {
        if (MAX_SIZE < original.rows || MAX_SIZE < original.cols) {
            const scale = Math.min(MAX_SIZE / original.rows, MAX_SIZE / original.cols);
            const newCols = Math.floor(original.cols * scale);
            const newRows = Math.floor(original.rows * scale);
            const resized = new c.Mat();
            c.resize(original, resized, new c.Size(newCols, newRows), 0, 0, c.INTER_CUBIC);
            original.delete();
            original = resized;
        }

        const [qrLandmarks, data] = await findQrCode(original);
        const [templateId, pageNo] = [data.slice(0, 6), data[6]];
        const template = await io.database.collection('forms').findOne({ randomId: templateId });

        if (!template) {
            throw Error('Could not find associated form');
        }

        // Depending on file orientation, chose final size of our image (50px/cm is ~ 125dpi).
        let width, height;
        if (template.orientation === 'portrait') {
            [width, height] = [21.0 * 50, 29.7 * 50];
        } else {
            [width, height] = [29.7 * 50, 21.0 * 50];
        }

        const regions = {};
        for (let r in template.boundaries) {
            const { x, y, w, h, pageNo: boundaryPageNo } = template.boundaries[r];
            if (r === 'corner' || r === 'qr' || r.startsWith('aruco')) continue;
            if (Number.isFinite(boundaryPageNo) && pageNo !== boundaryPageNo) continue;

            regions[r] = { x: x * width, y: y * height, w: w * width, h: h * height };
        }

        const landmarksObj = await findLandmarks(original, qrLandmarks);
        const targetObj = computeTargets(template, pageNo, width, height);
        const landmarks = [];
        const target = [];
        for (let key in targetObj) {
            if (landmarksObj[key]) {
                landmarks.push(landmarksObj[key]);
                target.push(targetObj[key]);
            }
        }

        const jpeg = await withMats(async track => {
            const srcMat = track(pointsToMat(landmarks));
            const dstMat = track(pointsToMat(target));
            const H = track(c.findHomography(srcMat, dstMat));
            const document = track(new c.Mat());
            c.warpPerspective(original, document, H, new c.Size(width, height));
            return encodeJpeg(document, 60);
        });

        return {
            $set: {
                status: 'pending_dataentry',
                processed: {
                    size: jpeg.byteLength,
                    mimeType: 'image/jpeg',
                    data: jpeg,
                    dataSourceId: template.dataSourceId,
                    regions,
                },
            },
        };
    } finally {
        original.delete();
    }
}

async function findLandmarks(image, qrLandmarks) {
    const aruco = await findArucoMarkers(image);
    const points = { ...aruco, ...qrLandmarks };

    if (Object.keys(points).length < 12) {
        const corners = await getPageContour(image);
        if (corners) {
            // We don't know if the contour is clockwise or counter clockwise.
            // => Sort the points in clockwise order.
            const centroid = corners.reduce(
                (m, p) => ({ x: m.x + p.x / 4, y: m.y + p.y / 4 }),
                { x: 0, y: 0 }
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
    const boundaries = file.boundaries;
    const targets = {};
    for (let key in boundaries) {
        const rect = boundaries[key];
        if (rect.pageNo !== undefined && rect.pageNo !== pageNo) {
            continue;
        }

        targets[`${key}-tl`] = { x: rect.x * w, y: rect.y * h };
        targets[`${key}-tr`] = { x: (rect.x + rect.w) * w, y: rect.y * h };
        targets[`${key}-bl`] = { x: rect.x * w, y: (rect.y + rect.h) * h };
        targets[`${key}-br`] = { x: (rect.x + rect.w) * w, y: (rect.y + rect.h) * h };
    }

    return targets;
}

module.exports = { processImageUpload, findLandmarks, computeTargets };
