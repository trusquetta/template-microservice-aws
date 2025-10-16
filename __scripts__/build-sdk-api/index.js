/**
 * AST（コードの木構造）解析ツール esprima を使って
 * service-gateway/src/actions 以下の各アクションのコードから
 * service-client/src/actions 以下に SDK 用のコードを自動生成するスクリプト
 */

import {makeBasicFiles} from './actions/make-basic-files.js';
import {makeActions} from './actions/make-actions.js';
import {makeActionsIndex} from './actions/make-actions-index.js';
import {copyTypes} from './actions/copy-types.js';

await makeBasicFiles();
await makeActions();
await makeActionsIndex();
await copyTypes();
console.info(`
	✅ SDK API generated.
`);
