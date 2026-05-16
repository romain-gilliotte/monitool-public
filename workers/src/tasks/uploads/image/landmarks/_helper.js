import { cv } from '../../../../helpers/cv.js';
/**
 * @param {import('@techstark/opencv-js').Mat} image
 * @param {(region: import('@techstark/opencv-js').Mat, rect: import('@techstark/opencv-js').Rect) => Promise<boolean>} handler
 */
async function slideOnImage(image, handler) {
    const c = cv();
    for (let scale = 1; scale < 6; ++scale) {
        const slWinSizeW = Math.floor(image.cols / scale);
        const slWinSizeH = Math.floor(image.rows / scale);
        const slWinStepW = Math.floor(0.25 * slWinSizeW);
        const slWinStepH = Math.floor(0.25 * slWinSizeH);
        for (let y = 0; y <= image.rows - slWinSizeH; y += slWinStepH) {
            for (let x = 0; x <= image.cols - slWinSizeW; x += slWinStepW) {
                const rectangle = new c.Rect(x, y, slWinSizeW, slWinSizeH);
                const region = image.roi(rectangle);

                let stop;
                try {
                    stop = await handler(region, rectangle);
                } finally {
                    region.delete();
                }

                if (stop) return;
            }
        }
    }
}

export { slideOnImage };
