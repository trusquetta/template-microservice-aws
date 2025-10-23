# Service Client (SDK)

このディレクトリには、クライアントアプリケーションで使用するSDKが含まれています。

## 📋 概要

Service Client SDKは、AWS Lambdaで動作するService Gatewayを呼び出すための便利なインターフェースを提供します。TypeScriptの型定義も自動生成され、型安全な開発が可能です。

## 🏗️ ディレクトリ構造

```
sdk/
├── src/
│   ├── actions/           # 公開アクション（手動実装）
│   ├── utils/
│   │   ├── api/          # Gateway APIラッパー（自動生成）
│   │   └── service-gateway.js
│   └── index.js          # SDKエントリーポイント
├── @types/               # TypeScript型定義（自動生成）
├── scripts/              # ビルドスクリプト
└── package.json
```

## 📦 インストール

プロジェクトのワークスペースとして使用する場合：

```bash
npm install
```

別のプロジェクトで使用する場合（パッケージとして公開後）：

```bash
npm install service-sdk
```

## 🚀 使い方

### 基本的な使用方法

```javascript
import {sdk} from 'service-sdk';

// SDKの設定
sdk.configure({
    profile: 'default',              // AWS profile名
    functionName: 'my-service-dev'   // Lambda関数名
});

// アクションの実行
const result = await sdk.ping({
    message: 'Hello, World!'
});

console.log(result);  // "pong: Hello, World!"
```

### TypeScriptでの使用

```typescript
import {sdk} from 'service-sdk';

sdk.configure({
    profile: 'default',
    functionName: 'my-service-dev'
});

// 型推論が効く
const result = await sdk.ping({
    message: 'Hello, World!'
});
```

## 🔧 開発

### API生成

API側のアクションからSDK APIを生成するには、**ルートディレクトリ**で以下を実行：

```bash
npm run build:sdk
```

これにより、`src/utils/api/` 配下に自動生成されたAPIラッパーが作成されます。

### 型定義生成

```bash
npm run build
```

これにより：
1. SDK APIが再生成される
2. TypeScript型定義が `@types/` に生成される

### テスト実行

```bash
npm test
```

## 📚 主要コンポーネント

### src/utils/api/（自動生成）

Service Gatewayの全てのアクションに対応するAPIラッパーがここに生成されます。これらは内部的にLambda関数を呼び出します。

**重要**: このディレクトリのファイルは自動生成されるため、直接編集しないでください。

### src/actions/（手動実装）

SDKから公開して使用できるアクションを実装します。主に `utils/api` を用いたコントローラーとしての実装を記述します。

**注意**: ここでAWSリソースの直接操作をするとクライアント側にリソース操作権限が必要になるため、リソース操作は行わないでください。代わりに、Service Gateway側でリソース操作を行い、SDKではそれを呼び出すだけにします。

#### 例：複数ステップのアクション

```javascript
// src/actions/index.js
import {fetchData, processData, saveData} from '../utils/api';

export async function complexWorkflow(input) {
    console.log('データ取得中...');
    const data = await fetchData(input);
    
    console.log('処理中...');
    const processed = await processData(data);
    
    console.log('保存中...');
    const result = await saveData(processed);
    
    console.log('完了！');
    return result;
}
```

## 🤔 なぜ utils/api を直接公開しないのか？

### 1. Gateway Actionの柔軟な再利用

引数を変更するだけで、同じGateway Actionから様々なバリエーションを作成できます。

```javascript
// 同じGateway Actionを異なるパラメータで使用
export async function getUserById(userId) {
    return getUser({id: userId, detailed: true});
}

export async function getUserSummary(userId) {
    return getUser({id: userId, detailed: false});
}
```

### 2. クライアントへの進捗通知

複数ステップの処理をクライアント側で実行することで、進捗をリアルタイムで通知できます。

**全てサーバー側で実行した場合**:
```javascript
// クライアントから見ると、応答が返ってくるまで何も分からない
const result = await api.doEverything(params);
```

**SDK側で分割実行した場合**:
```javascript
// 各ステップの進捗が分かる
console.log('ステップ 1/3...');
await api.step1(params);

console.log('ステップ 2/3...');
await api.step2(params);

console.log('ステップ 3/3...');
const result = await api.step3(params);
```

### 3. クライアント側ロジックの追加

SDK側で以下のような機能を追加できます：
- 入力バリデーション
- キャッシング
- リトライロジック
- エラーハンドリング
- ロギング

```javascript
export async function robustAction(input) {
    // バリデーション
    if (!input.required) {
        throw new Error('Required parameter missing');
    }
    
    // リトライロジック付きで実行
    let retries = 3;
    while (retries > 0) {
        try {
            return await api.someAction(input);
        } catch (error) {
            retries--;
            if (retries === 0) throw error;
            console.log(`リトライ中... 残り${retries}回`);
            await sleep(1000);
        }
    }
}
```

## 🔒 セキュリティ上の注意

### AWSリソース操作について

SDK内でAWSリソース（S3、DynamoDBなど）を直接操作すると、SDKを使用するクライアント側にもそれらのリソースへのアクセス権限が必要になります。

**推奨アプローチ**:
1. リソース操作は全てService Gateway（Lambda）側で実行
2. SDK側ではGatewayを呼び出すだけ

```javascript
// ❌ 悪い例：SDK内でS3を直接操作
import {S3Client} from '@aws-sdk/client-s3';
export async function uploadFile(file) {
    const s3 = new S3Client();
    await s3.putObject({...});  // クライアントにS3権限が必要
}

// ✅ 良い例：Gatewayを経由
import {uploadFile as uploadFileApi} from '../utils/api/upload-file.js';
export async function uploadFile(file) {
    return uploadFileApi({file});  // Lambda側で権限を使用
}
```

## 📝 ライセンス

MIT

## 🔗 関連ドキュメント

詳細な使用方法については、[プロジェクトのメインREADME](../README.md)を参照してください。
