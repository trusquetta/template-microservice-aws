/**
 * @see https://docs.aws.amazon.com/ja_jp/serverless-application-model/latest/developerguide/serverless-sam-cli-using-build.html#serverless-sam-cli-using-container-environment-file
 */

import process from 'node:process';
import fs from 'node:fs/promises';
import {rootPath} from '../../config.js';

const fileName = 'env.json';

export async function main() {
	const {GITHUB_TOKEN} = process.env;
	const json = JSON.stringify({
		Parameters: {
			GITHUB_TOKEN: GITHUB_TOKEN || '',
		},
	}, null, 2);

	await fs.writeFile(`${rootPath}/${fileName}`, json, 'utf8');

	console.info(`
	✅ env.json created.
`);
}
