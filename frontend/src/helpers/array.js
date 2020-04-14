
/**
 * Compute the product of two arrays.
 *
 * @example
 * product([1], [2, 3]) // [[1, 2], [1, 3]]
 */
export function productSingle(a, b) {
	var result = [], lengthA = a.length, lengthB = b.length;
	var k = 0;

	for (var i = 0; i < lengthA; ++i)
		for (var j = 0; j < lengthB; ++j)
			result[k++] = [...a[i], b[j]];

	return result;
};

/**
 * Compute the product of multiple arrays.
 *
 * @example
 * product([[1, 2], [3, 4]]) // [[1, 3], [1, 4], [2, 3], [2, 4]]
 * product([[1], [3, 4, 5]]) // [[1, 3], [1, 4], [1, 5]]
 */
export function product(list) {
	if (list.length == 0)
		return [];

	var memo = list[0].map(el => [el]);
	for (var i = 1; i < list.length; ++i)
		memo = productSingle(memo, list[i]);

	return memo;
};

export function updateArrayInPlace(array, newValues) {
	for (let i = 0; i < newValues.length; ++i) {
		const newRow = newValues[i];
		const oldRow = array.find(oldRow => oldRow.id == newRow.id);

		if (oldRow && angular.equals(oldRow, newRow)) {
			newValues[i] = oldRow;
		}
		else if (oldRow) {
			for (let key in newRow)
				if (!angular.equals(newRow[key], oldRow[key]))
					oldRow[key] = newRow[key];

			newValues[i] = oldRow;
		}
	}

	array.length = 0;
	array.push(...newValues);
}