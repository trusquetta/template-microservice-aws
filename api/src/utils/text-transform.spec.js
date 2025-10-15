import test from 'ava';
import {
	camelToKebab,
	kekabToCamel,
} from './text-transform.js';

test('camelToKebab converts camelCase to kebab-case', t => {
	t.is(camelToKebab('exampleString'), 'example-string');
	t.is(camelToKebab('anotherExampleString'), 'another-example-string');
	t.is(camelToKebab('noChange'), 'no-change');
	t.is(camelToKebab('already-kebab-case'), 'already-kebab-case');
});

test('kekabToCamel converts kebab-case to camelCase', t => {
	t.is(kekabToCamel('example-string'), 'exampleString');
	t.is(kekabToCamel('another-example-string'), 'anotherExampleString');
	t.is(kekabToCamel('no-change'), 'noChange');
	t.is(kekabToCamel('alreadyCamelCase'), 'alreadyCamelCase');
});
