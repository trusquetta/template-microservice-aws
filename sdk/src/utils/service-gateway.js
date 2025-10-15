import {lambda} from '@dependahub/aws-lambda';

class ServiceGateway {
	config = {
		profile: undefined,
		functionName: null,
	};

	constructor() {
		this.configure();
	}

	/**
	 * 初期設定のオーバーライド
	 * @param {Object} config
	 * @param {string} config.profile - AWS profile name
	 * @param {string} config.functionName - lambda function name
	 * @returns {void}
	 */
	configure(config = {}) {
		Object.assign(this.config, config);
		const {profile} = this.config;
		lambda.configure({
			profile,
		});
	}

	async post({action, payload}) {
		const {functionName} = this.config;
		if (!functionName) {
			throw new Error('functionName is not set');
		}

		const response = await lambda.post(functionName, {action, payload});
		if (response.error) {
			const {statusCode, error: serverError = {}} = response;
			const error = new Error(serverError.message);
			error.name = serverError.name;
			error.statusCode = statusCode;
			error.stack = serverError.stack;
			throw error;
		}

		return response.data;
	}

	async push({action, payload}) {
		const {functionName} = this.config;
		if (!functionName) {
			throw new Error('functionName is not set');
		}

		return lambda.push(functionName, {action, payload});
	}
}

export const serviceGateway = new ServiceGateway();
export default serviceGateway;
