import {makeActionsIndex} from './actions/make-actions-index.js';
import {makeSdkMethods} from './actions/make-sdk-methods.js';

const rootPath = new URL('../..', import.meta.url).pathname;

await makeActionsIndex(`${rootPath}/src/actions`);
await makeSdkMethods(rootPath);
