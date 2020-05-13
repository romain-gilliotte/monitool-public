const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const gm = require('gm');
const util = require('util');
const config = require('../config');

const unoconvMimes = {
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
};

const gmMimes = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'application/pdf': 'pdf',
};

const defaultThumbnail = fs.readFileSync('data/thumbnail.png');

/**
 * @param {Buffer} buffer
 * @param {string} mimeType
 */
async function generateThumbnail(buffer, mimeType, targetRatio = 1.5) {
    const ext = unoconvMimes[mimeType] || gmMimes[mimeType];

    if (config.unoconv.uri && unoconvMimes[mimeType] && !gmMimes[mimeType]) {
        const form = new FormData();
        form.append('file', buffer, `file.${unoconvMimes[mimeType]}`);

        const response = await axios.post(config.unoconv.uri, form, {
            responseType: 'arraybuffer',
            headers: form.getHeaders(),
        });

        buffer = response.data;
        mimeType = 'application/pdf';
    }

    try {
        if (!gmMimes[mimeType]) {
            throw new Error('Invalid type');
        }

        let image = gm(buffer, `file.${gmMimes[mimeType]}`);
        const { width, height } = await util.promisify(image.size.bind(image))();

        const ratio = width / height;
        if (targetRatio < ratio) {
            image = image.crop(height * targetRatio, height);
        } else {
            image = image.crop(width, width / targetRatio);
        }

        image = image.resize(300, 200);

        buffer = await util.promisify(image.toBuffer.bind(image))('PNG');
        mimeType = 'image/png';
    } catch (e) {
        const image = gm(defaultThumbnail, 'file.png')
            .fill('#000000')
            .font('Arial-Bold', 30)
            .drawText(90, 135, ext.slice(0, 3).toLocaleUpperCase());

        buffer = await util.promisify(image.toBuffer.bind(image))('PNG');
        mimeType = 'image/png';
    }

    return buffer;
}

module.exports = { generateThumbnail };
