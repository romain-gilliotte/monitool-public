const cv = require('opencv4nodejs');

/**
 * Use Edge detection to find something big and with four sides on a picture.
 * This allows finding a form in a simple background with reasonable accuracy.
 *
 * @see https://bretahajek.com/2017/01/scanning-documents-photos-opencv/
 */
function extractPage(image, width, height) {
    const edges = getEdges(image);
    const contourPoints = getPageContour(edges).getPoints();

    const targetPoints = [
        new cv.Point2(0, 0),
        new cv.Point2(0, height),
        new cv.Point2(width, height),
        new cv.Point2(width, 0),
    ];

    const transform = cv.getPerspectiveTransform(contourPoints, targetPoints);
    return image.warpPerspective(transform, new cv.Size(width, height));
}

function getEdges(image) {
    image = image.cvtColor(cv.COLOR_BGR2GRAY);
    image = image.normalize(0, 255, cv.NORM_MINMAX);
    image = image.bilateralFilter(9, 75, 75);
    image = image.adaptiveThreshold(255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, 115, 4);
    image = image.medianBlur(11);
    image = image.canny(200, 250);
    return image;
}

function getPageContour(edges) {
    const maxArea = (edges.sizes[0] - 30) * (edges.sizes[1] - 30);
    let minArea = maxArea * 0.3;

    const contours = edges.findContours(cv.RETR_TREE, cv.CHAIN_APPROX_SIMPLE);

    // fixme: readability array reduce...
    let pageContour = null;

    for (let contour of contours) {
        const perimeter = contour.arcLength(true);
        const approx = contour.approxPolyDPContour(0.03 * perimeter, true);

        if (
            approx.numPoints == 4 &&
            approx.isConvex &&
            minArea < approx.area &&
            approx.area < maxArea
        ) {
            pageContour = approx;
            minArea = approx.area;
        }
    }

    return pageContour;
}

module.exports = { extractPage };
