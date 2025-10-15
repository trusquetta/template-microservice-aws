
/**
 * 疎通確認
 * @param {Object} input
 * @param {string} input.message
 * @returns {string}
 */
export async function ping(input) {
	const {message = 'Hello world!'} = input;
	return `pong: ${message}`;
}
