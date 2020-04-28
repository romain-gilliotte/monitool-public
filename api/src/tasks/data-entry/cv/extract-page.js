const cv = require('opencv4nodejs');

/**
 * Use Edge detection to find something big and with four sides on a picture.
 * This allows finding a form in a simple background with reasonable accuracy.
 *
 * @see https://bretahajek.com/2017/01/scanning-documents-photos-opencv/
 */
function extractPage(image, width = 1050, height = 1485) {
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

function getEdges(img) {
    return img
        .bilateralFilter(9, 75, 75)
        .adaptiveThreshold(255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, 115, 4)
        .medianBlur(11)
        .copyMakeBorder(5, 5, 5, 5, cv.BORDER_CONSTANT, 0) // in example, last param is Vec3, but cause crash?
        .canny(200, 250);
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
