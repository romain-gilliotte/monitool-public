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
async function generateThumbnail(buffer, mimeType) {
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
        const thumbnail = gm(buffer, 'file.pdf').crop(595, 400);
        const toBuffer = util.promisify(thumbnail.toBuffer.bind(thumbnail));

        buffer = await toBuffer('PNG');
        mimeType = 'image/png';
    } else {
        buffer = fs.readFileSync('data/placeholder.png');
        mimeType = 'image/png';
    }

    return buffer;
}

module.exports = { generateThumbnail };
