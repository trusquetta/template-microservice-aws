import fs from 'node:fs/promises';
import {kekabToCamel} from '../utils/text-transform.js';
import {sdkApiPath} from '../../../config.js';

const actionsPath = `${sdkApiPath}/actions`;
const indexJs = `${actionsPath}/index.js`;

/**
 * ${sdkApiPath}/actions 以下の各アクションをまとめてエクスポートする index.js を生成
 * @return {Promise<string>} 生成したコード
 */
export async function makeActionsIndex() {
	const dirents = await fs.readdir(actionsPath, {withFileTypes: true});
	const actions = dirents
		.filter(d =>
			d.isFile()
			&& d.name !== 'index.js'
			&& d.name.endsWith('.js')
			&& !d.name.endsWith('.spec.js')
			&& !d.name.endsWith('.test.js'))
		.map(d => ({
			fileName: d.name,
			functionName: kekabToCamel(d.name.replace('.js', '')),
		}));

	const content = actions.map(a => `export * from './${a.fileName}';`).join('\n') + '\n';

	await fs.writeFile(indexJs, content);

	return content;
}
