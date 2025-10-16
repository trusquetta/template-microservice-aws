import fs from 'node:fs/promises';
import {sdkPath, sdkApiPath} from '../../../config.js';

export async function makeBasicFiles() {
	await fs.rmdir(sdkApiPath, {recursive: true, force: true});

	// sdk/src/utils/api 以下のディレクトリを再帰的に作成
	await (async () => {
		const sdkApiDirectories = sdkApiPath.replace(sdkPath, '').split('/').filter(Boolean);
		let path = sdkPath;
		for (const directory of sdkApiDirectories) {
			path += `/${directory}`;
			// eslint-disable-next-line no-await-in-loop
			await fs.mkdir(path, {recursive: true});
		}
	})();

	// api/index.js
	const content = `
import * as actions from './actions/index.js';

export const api = {
	...actions,
};
export default api;
`.trimStart();
	await fs.writeFile(`${sdkApiPath}/index.js`, content);

	// api/actions
	await fs.mkdir(`${sdkApiPath}/actions`, {recursive: true});

	// api/actions/index.js
	await fs.writeFile(`${sdkApiPath}/actions/index.js`, '');
}
