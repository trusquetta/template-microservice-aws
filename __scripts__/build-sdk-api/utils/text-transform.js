
export function kekabToCamel(string_) {
	return string_.replaceAll(/-([a-z])/g, (match, p1) => p1.toUpperCase());
}

export function camelToKebab(string_) {
	return string_.replaceAll(/([a-z])([A-Z])/g, (match, p1, p2) => `${p1}-${p2.toLowerCase()}`);
}
