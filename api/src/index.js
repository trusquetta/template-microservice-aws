import process from 'node:process';
import {camelToKebab, kekabToCamel} from './utils/text-transform.js';

const {
	ENV,
	REGION,
} = process.env;

/**
 * Lambdaエントリーポイント
 */
export async function handler({action, payload}) {
	try {
		const actionKekab = camelToKebab(action);
		const actionCamel = kekabToCamel(actionKekab);

		const module = await import(`./actions/${actionKekab}/index.js`).catch(error => {
			if (error.code === 'ERR_MODULE_NOT_FOUND') {
				const error = new Error('Not Found');
				error.name = 'RouteError';
				error.statusCode = 404;
				throw error;
			}
		});
		const execute = module[actionCamel];
		if (typeof execute !== 'function') {
			const error = new Error('Not Found');
			error.name = 'RouteError';
			error.statusCode = 404;
			throw error;
		}

		// アクション実行
		const data = await execute(payload);

		return {
			statusCode: 200,
			data,
		};
	} catch (error) {
		console.error(error);
		return {
			statusCode: error.statusCode || 500,
			error: {
				name: error.name || 'UnhandledError',
				message: error.message,
				stack: error.stack,
			},
		};
	}
}
