import {exec} from 'node:child_process';
import {sdkPath} from '../../config.js';
import {makeSdkActions} from './actions/make-sdk-actions.js';
import {makeSdkActionsIndex} from './actions/make-sdk-actions-index.js';
import {copyTypes} from './actions/copy-types.js';

/**
 * AST（コードの木構造）解析ツール esprima を使って
 * service-gateway/src/actions 以下の各アクションのコードから
 * service-client/src/actions 以下に SDK 用のコードを自動生成するスクリプト
 */
await makeSdkActions();
await makeSdkActionsIndex();
await copyTypes();
await new Promise(resolve => {
	exec(`cd ${sdkPath} && npm run build`, (error, stdout, stderr) => {
		if (error) {
			console.error(`exec error: ${error}`);
			return;
		}

		if (stdout) {
			console.log(`stdout: ${stdout}`);
		}

		if (stderr) {
			console.error(`stderr: ${stderr}`);
		}

		resolve();
	});
});
console.info(`
	✅ SDK actions generated.
`);
