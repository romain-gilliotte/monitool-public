const childproc = require('node:child_process');
const fs = require('node:fs/promises');
const gm = require('gm');
const util = require('node:util');
const os = require('node:os');
const path = require('node:path');

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
            const profileDir = path.join(tmpDir, 'lo-profile');

            await fs.writeFile(`${filePath}.xlsx`, buffer);

            // Use a dedicated UserInstallation profile per call: parallel soffice
            // invocations otherwise fight over the same profile lock and crash.
            await new Promise((resolve, reject) => {
                childproc.execFile(
                    'soffice',
                    [
                        `-env:UserInstallation=file://${profileDir}`,
                        '--headless',
                        '--convert-to',
                        'pdf',
                        '--outdir',
                        tmpDir,
                        `${filePath}.xlsx`,
                    ],
                    { cwd: tmpDir, timeout: 60000, killSignal: 'SIGKILL' },
                    (error, stdout) => {
                        if (error) reject(error);
                        else resolve(stdout);
                    }
                );
            });

            buffer = await fs.readFile(`${filePath}.pdf`);
            mimeType = 'application/pdf';
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
        await fs.rm(tmpDir, { recursive: true, force: true });
    }

    return buffer;
}

module.exports = { generateThumbnail };
