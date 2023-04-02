export function isTruthy<T>(val: T | null | undefined | ""): val is T {
	return !!val;
}
