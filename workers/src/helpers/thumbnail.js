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
    'image/tiff': 'tiff',
    'application/pdf': 'pdf',
};

const otherTypes = {
    'application/zip': 'zip',
};

const defaultThumbnail = fs.readFileSync('data/thumbnail.png');

/**
 * Make a 300x200 thumbnail
 *
 * @param {Buffer} buffer
 * @param {string} mimeType
 */
async function generateThumbnail(buffer, mimeType) {
    const ext = unoconvMimes[mimeType] || gmMimes[mimeType] || otherTypes[mimeType];

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
        if (ratio < 1.5) {
            image = image.crop(width, width / 1.5);
        } else {
            image = image.crop(height * 1.5, height);
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
