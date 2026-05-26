import { applyPatch } from 'fast-json-patch';

/**
 * Apply RFC6902 operations and return a NEW document (no mutation of the input).
 * fast-json-patch mutates by default; the (validate=false, mutate=false) args
 * make it return a fresh document via result.newDocument instead.
 */
export function patch(operations, document) {
    return applyPatch(document, operations, false, false).newDocument;
}
