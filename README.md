[![XO code style](https://shields.io/badge/code_style-5ed9c7?logo=xo&labelColor=gray&logoSize=auto)](https://github.com/xojs/xo)

# template-microservice-aws

AWS Lambdaベースのマイクロサービステンプレートです。シンプルなアクションルーティング機構とクライアント用SDKを備えています。

<img alt="全体図" src="https://github.com/user-attachments/assets/dd2dbb48-92c5-440e-852a-685a806d678d" />

## 📋 目次

- [概要](#-概要)
- [特徴](#-特徴)
- [前提条件](#-前提条件)
- [プロジェクト構造](#-プロジェクト構造)
- [セットアップ](#-セットアップ)
- [開発ワークフロー](#-開発ワークフロー)
- [デプロイ](#-デプロイ)
- [テストとリンティング](#-テストとリンティング)
- [アーキテクチャ](#-アーキテクチャ)
- [トラブルシューティング](#-トラブルシューティング)
- [ライセンス](#-ライセンス)

## 🎯 概要

このテンプレートは、AWS Lambda上で動作するマイクロサービスと、そのクライアント用SDKを提供します。`{action: 'action-name', payload: {}}` 形式の入力で各種アクションをルーティング実行するシンプルな設計となっています。

### 主要コンポーネント

1. **API (Service Gateway)** - Lambda関数としてデプロイされるバックエンド
2. **SDK (Service Client)** - クライアントアプリケーションで使用するパッケージ

## ✨ 特徴

- 🚀 AWS SAMを使用した簡単なデプロイ
- 📦 自動生成されるクライアントSDK
- 🔄 アクションベースのルーティングシステム
- 📝 TypeScript型定義の自動生成
- ✅ XOとAVAによる品質保証
- 🏗️ npm workspacesによるモノレポ構成

## 📋 前提条件

以下のツールがインストールされている必要があります：

- **Node.js**: v22.x 以上
- **npm**: v8.x 以上
- **AWS CLI**: v2.x 以上
- **AWS SAM CLI**: v1.x 以上
- **AWSアカウント**: デプロイに必要な権限を持つアカウント

### AWS認証情報の設定

```bash
aws configure
```

または、環境変数で設定：

```bash
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_DEFAULT_REGION=ap-northeast-3
```

## 📁 プロジェクト構造

```
template-microservice-aws/
├── api/                      # Lambda関数（Service Gateway）
│   ├── src/
│   │   ├── actions/          # アクション実装
│   │   │   └── ping/         # アクション例
│   │   ├── utils/            # ユーティリティ関数
│   │   └── index.js          # Lambdaエントリーポイント
│   └── package.json
│
├── sdk/                      # クライアントSDK
│   ├── src/
│   │   ├── actions/          # SDK公開アクション
│   │   ├── utils/            # SDK内部ユーティリティ
│   │   └── index.js          # SDKエントリーポイント
│   ├── @types/               # TypeScript型定義（自動生成）
│   ├── scripts/              # SDKビルドスクリプト
│   └── package.json
│
├── __scripts__/              # プロジェクト全体のビルドスクリプト
│   ├── build-sdk-api/        # SDK API自動生成
│   └── build-env/            # 環境構築
│
├── template.yaml             # AWS SAMテンプレート
├── samconfig.toml            # SAM設定（dev/prod環境）
├── config.js                 # プロジェクト設定
└── package.json              # ルートパッケージ設定
```

## 🚀 セットアップ

### 1. リポジトリのクローン

```bash
git clone https://github.com/dependahub/template-microservice-aws.git
cd template-microservice-aws
```

### 2. 依存関係のインストール

```bash
npm install
```

このコマンドは、ルートプロジェクトと全てのワークスペース（api、sdk）の依存関係をインストールします。

### 3. SDK APIの生成

```bash
npm run build:sdk
```

このコマンドは、API側の `actions` から SDK側の API ラッパーを自動生成します。

## 💻 開発ワークフロー

### 新しいアクションの追加

#### 1. API側にアクションを作成

```bash
# api/src/actions/your-action/index.js を作成
mkdir -p api/src/actions/your-action
```

**例: api/src/actions/your-action/index.js**

```javascript
/**
 * Your action description
 * @param {Object} input
 * @param {string} input.param1 - パラメータの説明
 * @returns {Object} 戻り値の説明
 */
export async function yourAction(input) {
    const {param1} = input;
    // アクションのロジックを実装
    return {
        result: `Processed: ${param1}`
    };
}
```

#### 2. SDK APIを再生成

```bash
npm run build:sdk
```

これにより、`sdk/src/utils/api/your-action.js` が自動生成されます。

#### 3. （オプション）SDK側に公開アクションを作成

より複雑な処理が必要な場合、SDK側でラッパー関数を作成：

**sdk/src/actions/index.js**

```javascript
import {yourAction as yourActionApi} from '../utils/api/your-action.js';

/**
 * クライアント向けアクション
 */
export async function yourAction(params) {
    console.log('Processing step 1...');
    const result = await yourActionApi(params);
    console.log('Completed!');
    return result;
}
```

### ローカルテスト

#### API（Lambda）のローカル実行

```bash
sam build
sam local invoke ServiceGateway -e events/ping-event.json
```

または、API Gatewayをローカル起動：

```bash
sam local start-api
```

#### SDKのテスト

```bash
cd sdk
npm test
```

### コードの品質チェック

#### リンティング

```bash
npm run format  # 自動修正
npm test        # リンティング + テスト実行
```

#### テスト実行

```bash
npm test
```

## 🚢 デプロイ

### 開発環境へのデプロイ

```bash
sam build
sam deploy --config-env dev
```

### 本番環境へのデプロイ

```bash
sam build
sam deploy --config-env prod
```

### 初回デプロイ（ガイド付き）

```bash
sam build
sam deploy --guided
```

デプロイ後、出力される Lambda 関数名を確認してください。

### デプロイ設定のカスタマイズ

`samconfig.toml` を編集して、スタック名、リージョン、パラメータをカスタマイズできます：

```toml
[dev.deploy.parameters]
stack_name = "my-service-dev"
region = "ap-northeast-3"
parameter_overrides = [
    "env=\"dev\"",
]
```

## ✅ テストとリンティング

### 全体のテスト実行

```bash
npm test
```

これにより、以下が実行されます：
1. XOによるコードスタイルチェック
2. AVAによるユニットテスト実行

### ワークスペース別のテスト

```bash
# APIのみ
cd api && npm test

# SDKのみ
cd sdk && npm test
```

### リンティングの自動修正

```bash
npm run format
```

## 🏗️ アーキテクチャ

### API - Service Gateway

**タイプ**: AWS Lambda関数  
**ランタイム**: Node.js 22.x (ARM64)  
**タイムアウト**: 900秒  
**メモリ**: 512MB

Service Gateway は、受け取った `action` パラメータに基づいて、対応するアクション関数を動的にインポートして実行します。

**リクエスト形式**:

```javascript
{
    action: 'ping',           // アクション名（camelCase または kebab-case）
    payload: {                // アクションへの入力
        message: 'Hello!'
    }
}
```

**レスポンス形式**:

```javascript
// 成功時
{
    statusCode: 200,
    data: { /* アクションの戻り値 */ }
}

// エラー時
{
    statusCode: 500,
    error: {
        name: 'ErrorName',
        message: 'Error message',
        stack: '...'
    }
}
```

### SDK - Service Client

**タイプ**: npmパッケージ  
**主な用途**: クライアントアプリケーションからのAPI呼び出し

SDK は、Lambda関数を呼び出すための便利なインターフェースを提供します。

**使用例**:

```javascript
import {sdk} from 'service-sdk';

// 設定
sdk.configure({
    profile: 'default',        // AWS profile名
    functionName: 'my-service-dev'  // Lambda関数名
});

// アクション実行
const response = await sdk.ping({
    message: 'Hello, World!'
});

console.log(response);  // "pong: Hello, World!"
```

### SDK API自動生成の仕組み

`npm run build:sdk` を実行すると、以下の処理が行われます：

1. **AST解析**: `esprima-next` を使用して、API側のアクションコードを解析
2. **API生成**: `sdk/src/utils/api/` にLambda呼び出し用のラッパー関数を生成
3. **型定義生成**: TypeScript型定義を `sdk/@types/` に生成

### なぜ utils/api を直接公開しないのか？

#### 1. Gateway Actionの柔軟な再利用

クライアント側で引数を変更するだけで、様々なバリエーションのアクションを作成できます。

#### 2. クライアントへの進捗通知

複数ステップのアクションの場合、全てをサーバー側で実行するとクライアント側で進捗が見えません。SDK側で各ステップを実行することで、`console.log()` などで進捗を通知できます。

**例**:

```javascript
// sdk/src/actions/index.js
export async function complexAction(params) {
    console.log('ステップ 1/3: データ取得中...');
    const data = await api.fetchData(params);
    
    console.log('ステップ 2/3: 処理中...');
    const processed = await api.processData(data);
    
    console.log('ステップ 3/3: 保存中...');
    const result = await api.saveData(processed);
    
    console.log('完了！');
    return result;
}
```

#### 3. クライアント側のロジック追加

SDK側で追加のバリデーション、キャッシング、リトライロジックなどを実装できます。

## 🔧 トラブルシューティング

### デプロイエラー

#### 「Bucket does not exist」エラー

SAMがS3バケットを自動作成しようとして失敗する場合：

```bash
sam deploy --guided
```

ガイド付きモードで、S3バケットを手動指定してください。

#### 権限エラー

デプロイに必要な最小限のIAM権限を確認：
- CloudFormation (全操作)
- Lambda (作成・更新・削除)
- IAM (ロール作成)
- S3 (バケット操作)
- Logs (ロググループ作成)

### ビルドエラー

#### 「xo: not found」

依存関係が正しくインストールされていません：

```bash
rm -rf node_modules package-lock.json
npm install
```

#### SDK生成エラー

API側のアクション関数にJSDocコメントが不足している可能性があります。各アクションに適切なJSDocを追加してください。

### ランタイムエラー

#### 「Module not found」エラー

Lambda関数内で、アクション名の大文字小文字が正しいか確認してください。ファイル名はkebab-case、関数名はcamelCaseである必要があります。

```javascript
// ファイル: api/src/actions/my-action/index.js
export async function myAction(input) { // camelCase
    // ...
}
```

#### タイムアウト

長時間実行されるアクションの場合、`template.yaml` でタイムアウトを調整：

```yaml
Globals:
  Function:
    Timeout: 900  # 秒単位（最大900秒）
```

## 📝 ライセンス

MIT License

## 🤝 コントリビューション

Issue報告やPull Requestを歓迎します。

## 📚 参考リンク

- [AWS SAM ドキュメント](https://docs.aws.amazon.com/serverless-application-model/)
- [AWS Lambda ドキュメント](https://docs.aws.amazon.com/lambda/)
- [XO リンター](https://github.com/xojs/xo)
- [AVA テストランナー](https://github.com/avajs/ava)
