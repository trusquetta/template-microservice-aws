import process from 'node:process';
import {serviceGateway} from './utils/service-gateway.js';
import * as action from './actions/index.js';

const {
	SERVICE_FUNCTION_NAME = 'AWS_STACK_NAME',
} = process.env;

class SDK {
	config = {
		profile: undefined,
		functionName: SERVICE_FUNCTION_NAME,
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
		const {profile, functionName} = this.config;
		serviceGateway.configure({
			profile,
			functionName,
		});
	}

	// OVERRIDE_ACTIONS_START
	// OVERRIDE_ACTIONS_END
}

/**
 * SDKのインスタンス
 * @type {SDK}
 * @example
 * import {sdk} from '@madakaheri/service-client';
 *
 * sdk.configure({
 *  profile: 'default',
 *  functionName: 'my-service',
 * });
 *
 * const response = await sdk.ping({
 *  person: 'Alice',
 *  text: 'Hello, World!',
 * });
 * console.log(response);
 */
export const sdk = new SDK(); // <-- [OVERRIDE] export名はサービスに合わせて変更してください（例: mysdk）
export default sdk;
