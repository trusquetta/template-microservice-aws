import fs from 'node:fs/promises';
import {sdkPath, apiPath} from '../../../config.js';

export async function copyTypes() {
	const dirrents = await fs.readdir(`${apiPath}/src`, {withFileTypes: true});
	const isTypesJs = dirrents.filter(d => d.isFile() && d.name === 'types.js').map(d => d.name).length > 0;
	const isTypesDirectory = dirrents.filter(d => d.isDirectory() && d.name === 'types').map(d => d.name).length > 0;

	if (isTypesJs) {
		await fs.copyFile(
			`${apiPath}/src/types.js`,
			`${sdkPath}/src/types.js`,
		);
	}

	if (isTypesDirectory) {
		await fs.rm(`${sdkPath}/src/types`, {recursive: true, force: true});
		await fs.cp(
			`${apiPath}/src/types`,
			`${sdkPath}/src/types`,
			{recursive: true},
		);
	}
}
