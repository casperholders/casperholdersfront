# CasperHolders
[![codecov](https://codecov.io/gh/casperholders/casperholdersfront/branch/main/graph/badge.svg?token=J111YFA2Q3)](https://codecov.io/gh/casperholders/casperholdersfront)
## 第三者によって始めて作られた、Casperブロックチェーン用のUIです。

### CasperHoldersは、CasperNetworkやCasperAssociationと提携は結んでいません。コミュニティメンバーが立ち上げたプロジェクトです。

ここに載せているものは、CasperHoldersのウェブサイト用のソースです。（承諾を得て翻訳させてもらいました）

# 重要事項

**CasperHoldersのSoftwareは、いかなるサービスに対しても外部リクエストは一切行っていません。**

**Casper Networkを除く**

**CasperHolders Softwareは、いかなる個人情報も保存もしくは共有いたしません。**

**秘密鍵の読み取りや保存、他人への共有も行いません。**

**スマートコントラクトの読取りや保存、他人への共有もいたしません。**

# ビルド方法

## ローカル開発

```bash
yarn install
yarn serve
```

## ローカルテスト

### !! 重要 !!

testsをローカルで正常に行う為には、作成するファイル名は .env.local とし、下記コンテンツを入れてください。

```
VUE_APP_FAKE_KEY="<TestnetPrivateKeyWithoutPem>"
VUE_APP_FAKE_VALIDATOR_KEY="<TestnetValidatorPrivateKeyWithoutPem>"
VUE_APP_E2E=true
```

最初のenv変数は、全てのユーザーアクション（転送 / ステーク / アンステーク）をテストします。  
次のenv変数は、全てのバリデーター操作（入札の追加 & 引き出し）をテストします。  
3つめは、E2Eモードで実行するようにアプリケーションに指示を出し、Casper Signerを迂回して偽の鍵にてローカルのSignerで署名します。  
仕組みについては、globalPlugin.js を確認してください。  
スマートコントラクトを送信する正常なパスに限り、テスト対象外となります。Issue #10を参照ください。  

### testsの実行
```bash
yarn test:e2e
```

## TestNet用にビルドする場合

.env.testnet ファイルを使用

```bash
yarn build-testnet
```

## MainNet用にビルドする場合

.env.mainnet ファイルを使用

```bash
yarn build-mainnet
```

## Dockerを使ってビルドする場合

modeの引数として正しい値を入力し、testnetもしくはmainnetのどちらかの .envファイル用にビルドしてください。

```bash
docker build --build-arg mode=(testnet|mainnet) . 
```

## Kubernetesでのデプロイ

testnetもしくはmainnetのフォルダーを使用してください。

### 警告：現存するkubernetesファイルは、kubernetesアーキテクチャに特化しています。  
基本的には、CasperHoldersをKubernetes上で使用する方法例となっています。

```bash
kubectl apply -f kubernetes/(testnet|mainnet)/
```

# アーキテクチャ

CasperHoldersのアプリケーションは、4つのメインパートから作られています。

## CasperHoldersのフロント
CasperHoldersの全てのウェブサイト用UIが、このリポジトリにあります。

ウェブサイトは、Casperノードに直接通信する為、適切なapiは不要となっています。

NGINXリバースプロキシにて、直接Casperノードへ接続されます。

NGINXリバースプロキシ設定は、**オープンソースではありません** 。システムアドミンにとっては簡単に対応可能であるのと、ウェブサイトの **商用** 部分でもある為です。

## CasperHoldersのコア部分
殆ど全てのCasperHoldersのロジックが、ここにあります。[Link](https://github.com/casperholders/casperholderscore)

## CasperData

ブロックチェーン全体を解析しデータベースにします。

このcasperdataは、ユーザーオペレーションとAPI上でのAPY（年収率）を素早く計算してくれます。[Link](https://github.com/casperholders/casperdata)

## CasperHolders API

[Link](https://github.com/casperholders/casperholdersapi)

5つのエンドポイントのみとなっており、CasperHoldersウェブサイト上で行われるオペレーションのプロメテウス・メトリックスを生成し利用しています。
そして、バリデーターのメタデータとネットワークのAPY（年収率）を取得します。

メトリックスが不要の場合は、このAPIは必要ありません。

APIを使用しなくても、フロントエンドは問題なく動作します。

ウェブサイト上のいかなる機能にも影響しません。（フロントページのメトリックスグラフを除く）

APIのURLを提示しないと、Javascriptコンソールではエラーが発生するかもしれません。

将来的には、このAPIに機能を更に追加する予定です。
    
# Notes
(* casperholders.ioにて管理している全てのコンポーネントはオープンソースだが、casperholders.com上のものは全てクローズドソースです。*)


