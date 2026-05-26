/**
 * Greedy JSON-diff producing RFC6902 patches.
 *
 * Ported from the (now unmaintained) jiff fork that monitool used to depend on.
 * Unlike a standard LCS diff, arrays are matched item-by-item using a hash
 * function (monitool passes `item => item.id || item.display`), which lets the
 * diff emit `move` operations on reorder and recurse into matched items so that
 * nested changes produce granular paths (e.g. `/logicalFrames/0/purposes/0`).
 * The history humanizer relies on that shape.
 *
 * @license MIT — original work (c) Brian Cavalier, John Hann.
 */

const separatorRx = /\//g;
const escapeRx = /~/g;

// RFC6901 JSON-pointer segment encoding.
function encodeSegment(s) {
    return String(s).replace(escapeRx, '~0').replace(separatorRx, '~1');
}

function isValidObject(x) {
    return x !== null && Object.prototype.toString.call(x) === '[object Object]';
}

function defaultHash(x) {
    return isValidObject(x) || Array.isArray(x) ? JSON.stringify(x) : x;
}

function isFunction(x) {
    return typeof x === 'function';
}

/**
 * Compute a JSON Patch (RFC6902) such that patch(diff(a, b), a) ~ b.
 *
 * @param {*} a
 * @param {*} b
 * @param {?function|?object} options if a function, used as the array-item hash.
 * @param {?function} options.hash hash used to recognize identical array items.
 * @param {?boolean} options.invertible when false, omit `test` operations.
 * @returns {Array} JSON Patch operations.
 */
export function diff(a, b, options) {
    let hash, invertible;

    if (typeof options === 'object' && options !== null) {
        hash = isFunction(options.hash) ? options.hash : defaultHash;
        invertible = options.invertible !== false;
    } else {
        hash = isFunction(options) ? options : defaultHash;
        invertible = true;
    }

    return appendChanges(a, b, '', { patch: [], hash, invertible }).patch;
}

function appendChanges(a, b, path, state) {
    if (Array.isArray(a) && Array.isArray(b)) {
        return appendArrayChanges(a, b, path, state);
    }

    if (isValidObject(a) && isValidObject(b)) {
        return appendObjectChanges(a, b, path, state);
    }

    return appendValueChanges(a, b, path, state);
}

function appendObjectChanges(o1, o2, path, state) {
    const patch = state.patch;
    let keys = Object.keys(o2);
    let i, key;

    for (i = keys.length - 1; i >= 0; --i) {
        key = keys[i];
        const keyPath = path + '/' + encodeSegment(key);
        if (o1[key] !== void 0) {
            appendChanges(o1[key], o2[key], keyPath, state);
        } else {
            patch.push({ op: 'add', path: keyPath, value: o2[key] });
        }
    }

    keys = Object.keys(o1);
    for (i = keys.length - 1; i >= 0; --i) {
        key = keys[i];
        if (o2[key] === void 0) {
            const p = path + '/' + encodeSegment(key);
            if (state.invertible) {
                patch.push({ op: 'test', path: p, value: o1[key] });
            }
            patch.push({ op: 'remove', path: p });
        }
    }

    return state;
}

function appendArrayChanges(a1, a2, path, state) {
    const currentHash = a1.map(state.hash);
    const targetHash = a2.map(state.hash);
    return appendArrayChangesGreedy(currentHash, targetHash, a1, a2, path, state);
}

function appendArrayChangesGreedy(currentHash, targetHash, current, target, path, state) {
    const patch = state.patch;
    let index = 0;
    let childpath;
    currentHash = currentHash.slice();
    current = current.slice();

    while (index < target.length || index < current.length) {
        childpath = path + '/' + index;

        if (index < current.length) {
            const targetIndex = targetHash.indexOf(currentHash[index], index);

            // The item in current does not exist in target => remove it.
            if (targetIndex === -1) {
                if (state.invertible)
                    patch.push({ op: 'test', path: childpath, value: current[index] });
                patch.push({ op: 'remove', path: childpath });

                currentHash.splice(index, 1);
                current.splice(index, 1);
                continue;
            }
        }

        if (index < target.length) {
            // Search for the target item in current.
            const currentIndex = currentHash.indexOf(targetHash[index], index);

            // The item is already where we want it, recurse and check next one.
            if (currentIndex === index) {
                appendChanges(current[index], target[index], childpath, state);
                ++index;
            }
            // The item in target does not exist in current, add it.
            else if (currentIndex === -1) {
                const last = patch[patch.length - 1];
                if (last && last.op === 'remove' && last.path === childpath)
                    patch[patch.length - 1] = { op: 'replace', path: childpath, value: target[index] };
                else patch.push({ op: 'add', path: childpath, value: target[index] });

                currentHash.splice(currentIndex, 0, targetHash[index]);
                current.splice(currentIndex, 0, target[index]);
                ++index;
            }
            // The item was found further into the array, move it.
            else {
                patch.push({ op: 'move', path: childpath, from: path + '/' + currentIndex });

                currentHash.splice(index, 0, currentHash[currentIndex]);
                current.splice(index, 0, current[currentIndex]);
                currentHash.splice(currentIndex + 1, 1);
                current.splice(currentIndex + 1, 1);
            }
        }
    }

    return state;
}

function appendValueChanges(a, b, path, state) {
    if (a !== b) {
        if (state.invertible) {
            state.patch.push({ op: 'test', path: path, value: a });
        }

        state.patch.push({ op: 'replace', path: path, value: b });
    }

    return state;
}
