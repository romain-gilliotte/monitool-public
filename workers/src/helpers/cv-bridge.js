import sharp from 'sharp';
import { cv } from './cv.js';
async function decodeImage(buffer) {
    const { data, info } = await sharp(buffer)
        .removeAlpha()
        .toColorspace('srgb')
        .raw()
        .toBuffer({ resolveWithObject: true });

    const c = cv();
    const rgb = c.matFromArray(info.height, info.width, c.CV_8UC3, data);
    const bgr = new c.Mat();
    c.cvtColor(rgb, bgr, c.COLOR_RGB2BGR);
    rgb.delete();
    return bgr;
}

async function encodeJpeg(mat, quality) {
    const c = cv();
    const rgb = new c.Mat();
    c.cvtColor(mat, rgb, c.COLOR_BGR2RGB);
    const buffer = Buffer.from(rgb.data);
    const width = rgb.cols;
    const height = rgb.rows;
    rgb.delete();

    return sharp(buffer, { raw: { width, height, channels: 3 } })
        .jpeg({ quality })
        .toBuffer();
}

function pointsToMat(points) {
    const c = cv();
    const flat = new Float32Array(points.length * 2);
    for (let i = 0; i < points.length; i++) {
        flat[i * 2] = points[i].x;
        flat[i * 2 + 1] = points[i].y;
    }
    return c.matFromArray(points.length, 1, c.CV_32FC2, flat);
}

async function withMats(fn) {
    const tracked = [];
    const track = m => {
        tracked.push(m);
        return m;
    };
    try {
        return await fn(track);
    } finally {
        for (const m of tracked) {
            try {
                m.delete();
            } catch {}
        }
    }
}

export { decodeImage, encodeJpeg, pointsToMat, withMats };
