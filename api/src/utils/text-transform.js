
/**
 * kebab-case to camelCase
 * @param {string} text
 * @return {string}
 */
export function kekabToCamel(text) {
	return text.replaceAll(/-([a-z])/g, (match, p1) => p1.toUpperCase());
}

/**
 * camelCase to kebab-case
 * @param {string} text
 * @return {string}
 */
export function camelToKebab(text) {
	return text.replaceAll(/([a-z])([A-Z])/g, (match, p1, p2) => `${p1}-${p2.toLowerCase()}`);
}
