import {serviceGateway} from '../../service-gateway.js';

/**
 * 疎通確認
 * @param {Object} input
 * @param {string} input.message
 * @returns {string}
 */
export async function ping(input) {
	return serviceGateway.post({
		action: 'ping',
		payload: input,
	});
}
