import {parseModule} from 'esprima-next';

const OverrideMarker = '@OVERRIDE_ME@';

/**
 * 元コードからimport部分と関数実装部分を削除したスケルトンコードを生成
 * - 関数上部のコメントは保持する
 * @param {string} code - 元コード
 * @returns {{functionName: string, paramName: string, code: string}} スケルトンコード
 */
export function makeSkelton(code) {
	const ast = parseModule(code, {
		range: true,
		comment: true,
		attachComment: true,
		tolerant: true,
	});
	let functionName = '';
	let parameterName = '';
	let skeltonCode = '';

	const exportFunctionNode = ast.body.find(node =>
		node.type === 'ExportNamedDeclaration'
		&& node.declaration
		&& node.declaration.type === 'FunctionDeclaration');

	if (exportFunctionNode) {
		functionName = exportFunctionNode.declaration.id.name;
		parameterName = exportFunctionNode.declaration.params[0]?.name;
		const functionNode = exportFunctionNode.declaration;

		// 関数宣言直前のコメントを抽出
		let commentText = '';
		if (ast.comments && ast.comments.length > 0) {
			const functionStart = exportFunctionNode.range[0];
			// 直前のコメントを探す
			const precedingComments = ast.comments.filter(c => c.range[1] <= functionStart);
			if (precedingComments.length > 0) {
				const lastComment = precedingComments.at(-1);
				commentText = code.slice(lastComment.range[0], lastComment.range[1]) + '\n';
			}
		}

		const header = code.slice(exportFunctionNode.range[0], functionNode.body.range[0] + 1); // '{'まで
		skeltonCode += commentText + header + `\n\t${OverrideMarker}\n}\n`;
	}

	return {
		functionName,
		paramName: parameterName,
		code: skeltonCode,
	};
}
