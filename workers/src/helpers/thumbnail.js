const childproc = require('child_process');
const fs = require('fs/promises');
const gm = require('gm');
const util = require('util');
const os = require('os');
const path = require('path');

const libreofficeMimes = {
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

/**
 * Make a 300x200 thumbnail
 *
 * @param {Buffer} buffer
 * @param {string} mimeType
 */
async function generateThumbnail(buffer, mimeType) {
    const ext = libreofficeMimes[mimeType] || gmMimes[mimeType] || otherTypes[mimeType];
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'monitool-thumbnail-'));

    try {
        if (libreofficeMimes[mimeType]) {
            const filePath = path.join(tmpDir, `file`);
            let numTries = 10;

            await fs.writeFile(`${filePath}.xlsx`, buffer);
            while (numTries > 0) {
                numTries--;

                try {
                    await new Promise((resolve, reject) => {
                        childproc.exec(
                            `libreoffice --headless --convert-to pdf ${filePath}.xlsx`,
                            { cwd: tmpDir },
                            (error, stdout) => {
                                if (error) reject(error);
                                else resolve(stdout);
                            }
                        );
                    });

                    buffer = await fs.readFile(`${filePath}.pdf`);
                    mimeType = 'application/pdf';
                    break;
                } catch (e) {
                    // For some reason, libreoffice sometime crashes when running in parallel.
                    // => Just retry in a couple seconds.
                    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));
                    continue;
                }
            }
        }

        if (gmMimes[mimeType]) {
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
        } else {
            throw new Error('Invalid type');
        }
    } catch (e) {
        console.log(e);

        const defaultThumbnail = await fs.readFile('data/thumbnail.png');
        const image = gm(defaultThumbnail, 'file.png')
            .fill('#000000')
            .font('Arial-Bold', 30)
            .drawText(90, 135, ext.slice(0, 3).toLocaleUpperCase());

        buffer = await util.promisify(image.toBuffer.bind(image))('PNG');
        mimeType = 'image/png';
    } finally {
        await fs.rmdir(tmpDir, { recursive: true });
    }

    return buffer;
}

module.exports = { generateThumbnail };
