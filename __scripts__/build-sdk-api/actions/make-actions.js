import fs from 'node:fs/promises';
import {apiPath, sdkApiPath} from '../../../config.js';
import {makeSkelton} from './make-skelton.js';

const serviceActionPath = `${apiPath}/src/actions`;
const sdkApiActionsPath = `${sdkApiPath}/actions`;
const imports = 'import {serviceGateway} from \'../../service-gateway.js\';\n\n';
const overrideMarker = '@OVERRIDE_ME@';

/**
 * sdkApiActionsPath 以下に serviceActionPath から各アクションを生成します
 * @return {Promise<void>}
 */
export async function makeActions() {
	const actionDirents = await fs.readdir(serviceActionPath, {withFileTypes: true});
	const actionDirectories = actionDirents
		.filter(dirent => dirent.isDirectory())
		.map(dirent => `${serviceActionPath}/${dirent.name}`);

	for (const actionDirectory of actionDirectories) {
		const actionDirectoryName = actionDirectory.split('/').pop();
		console.info(`Generating SDK action: ${actionDirectoryName}`);
		// eslint-disable-next-line no-await-in-loop
		const code = await fs.readFile(`${actionDirectory}/index.js`, 'utf8');
		const {functionName, paramName, code: skeltonCode} = makeSkelton(code);
		const sdkImplementation = paramName
			? `return serviceGateway.post({
		action: '${functionName}',
		payload: ${paramName},
	});`
			: `return serviceGateway.post({
		action: '${functionName}',
	});`;
		let sdkCode = imports + skeltonCode.replace(overrideMarker, sdkImplementation);
		sdkCode = sdkCode.replaceAll('../../types', '../types');
		// eslint-disable-next-line no-await-in-loop
		await fs.writeFile(`${sdkApiActionsPath}/${actionDirectoryName}.js`, sdkCode);
	}
}
