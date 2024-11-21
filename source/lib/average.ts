/**
 * Get the average value of a list of numbers.
 */
export function average(array: number[]): number {
	if (array.length === 0) {
		return 0;
	}
	return (
		array.reduce((accumulated, value) => accumulated + value, 0) /
		array.length
	);
}
