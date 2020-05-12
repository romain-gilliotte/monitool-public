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

/**
 * @param {Buffer} buffer
 * @param {string} mimeType
 */
async function generateThumbnail(buffer, mimeType, targetRatio = 1.5) {
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

    if (gmMimes[mimeType]) {
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
    } else {
        buffer = fs.readFileSync('data/placeholder.png');
        mimeType = 'image/png';
    }

    return buffer;
}

module.exports = { generateThumbnail };
