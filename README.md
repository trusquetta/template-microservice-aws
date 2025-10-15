[![XO code style](https://shields.io/badge/code_style-5ed9c7?logo=xo&labelColor=gray&logoSize=auto)](https://github.com/xojs/xo)

# template-microservice-aws

AWS用マイクロサービステンプレート

<img alt="全体図" src="https://github.com/user-attachments/assets/dd2dbb48-92c5-440e-852a-685a806d678d" />


## API - Service Gateway

> TYPE: Lambda

```{action: 'action-name', payload: {}}``` での入力で各種アクションをルーティング実行する単純なバックエンドです。


## SDK - Service Client

> TYPE: Package

パッケージとして配布するSDKで、主にアプリケーション側のAPIで使用します。

### utils/api

[utils/api](./sdk/src/utils/api/) には Service Gateawy の全てのアクションが内包されます。
次のコマンドで自動生成されます。

```bash
npm run build:sdk
```

### actions

[actions](./sdk//src//actions/) には、SDKから公開して使用できるアクションを実装します。  
主に utils/api を用いた Controller としての実装を記述します。

＊ ここでAWSリソースの操作をするとクライアント側にリソース操作権限が必要になるため、ここではリソース操作は行わないようにしてください。

## どうして utils/api を直接公開しない？

### GatewatActionの使い回しが可能

引数を変えるだけで賄えるアクションをクライアント側で派生させることができます。

### クライアントに動作の進捗を知らせるため
例えば３ステップの工程があるアクションを実装した場合、全てのステップを ServiceGateway 側で行うと、クライアントから進捗が見えません。  
進捗の確認を可能にするには、ServiceGatewayのアクションを分割し、sdkのactions内でステップ実行しながら ```console.log()``` などで進捗を知らせます。
