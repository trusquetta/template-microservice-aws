import test from 'ava';
import {makeSdkActionsIndex} from './make-sdk-actions-index.js';

test('makeSdkActionsIndex', async t => {
	const content = await makeSdkActionsIndex();
	t.log(content);
	t.pass();
});
