const fs = require('fs');
const cv = require('opencv4nodejs');

const MAX_FEATURES = 50000;
const KEEP_FEATURES = 50;

const reference = cv.imread('reference.png').cvtColor(cv.COLOR_BGR2GRAY).resize(1485, 1050);

/**
 * Use feature matching to search for a particular form on a picture.
 * DOES NOT WORK AT ALL
 *
 * @see https://www.learnopencv.com/image-alignment-feature-based-using-opencv-c-python/
 */
function extractPage(source, width, height) {
    // We know that our reference is a binary image, because we generate it this way
    // => help ORB detector by thresholding the provided image.
    let image = source;
    image = image.resize(height, width);
    image = image.adaptiveThreshold(255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, 121, 20);

    // Detect ORB features and compute descriptors.
    const orb = new cv.ORBDetector(MAX_FEATURES);
    const refKeypoints = orb.detect(reference);
    const refDescriptors = orb.compute(reference, refKeypoints);

    const imgKeypoints = orb.detect(image);
    const imgDescriptors = orb.compute(image, imgKeypoints);
    console.log('test2');

    // Match features.
    const matches = cv.matchBruteForceHamming(imgDescriptors, refDescriptors);
    matches.sort((a, b) => {
        return a.distance < b.distance ? -1 : 1;
    });
    matches.length = KEEP_FEATURES;

    // Draw top matches
    const imMatches = cv.drawMatches(image, reference, imgKeypoints, refKeypoints, matches);
    cv.imwrite('test.png', imMatches);

    // Extract location of good matches
    const refPoints = [];
    const imgPoints = [];
    for (let i = 0; i < matches.length; ++i) {
        const match = matches[i];
        refPoints.push(refKeypoints[match.trainIdx].pt);
        imgPoints.push(imgKeypoints[match.queryIdx].pt);
    }

    const homography = cv.findHomography(imgPoints, refPoints, cv.RANSAC);

    console.log(homography);
    const result = source.warpPerspective(homography.homography, new cv.Size(width, height));

    console.log(result);
    return result;
}

module.exports = { extractPage };
