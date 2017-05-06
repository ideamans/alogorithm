アイデアマンズ株式会社のロゴマークを生成するサーバサイドプログラムです。

ロゴマークは、ポリゴン調のパターンを生成するライブラリ[Trianglify](https://github.com/qrohlf/trianglify)を利用し、任意のフレーズを指定することで無数に変化するロゴを再現することができます。

* ウェブサイトには日付を渡し日替わりのロゴを表示
* 名刺には名前を指定し社員固有のロゴを表示
* イベントなどでの掲載はそのイベント名などを指定

さまざまなソフトウェアやWebサービスを開発する会社として、アルゴリズムによりひとつに留まらず変化するCIを掲げるため、このプログラムを開発しました。

# 構成技術

* Node.js
* Express
* Trianglify
* SVG2PNG

# 構成ファイル

* `package.json` プロジェクト情報や依存関係を記録
* `index.js` プログラム本体
* `template/logos.yml` テンプレートとなるSVGファイルの付帯情報
* `template/*.svg` ロゴのタイプによるテンプレート

# 開発手順

このプロジェクトは`yarn`により依存関係を管理します。`npm install yarn`によりインストールします。

初回だけ、依存関係をインストールします。

    yarn install

次のスクリプト

    node index.js

または

    yarn start

を実行すると、`http://localhost:3000/square.svg`などでアクセスできます。

    yarn debug

を実行すると、`index.js`の変化に応じて`Express`サーバが再起動するデバッグに適した環境を利用することができます。

# 使い方

    http://localhost:3000/(type).(format)[?(OPTIONS)]

によりロゴマークを生成することができます。?`(OPTIONS)`は任意です。

* `type` ロゴマークのタイプ。`line`または`square`を指定できます。テンプレートの追加により増やすことができます。
* `format` 出力フォーマット。`svg`または`png`を指定できます。
* `width` 横幅(ピクセル単位)。
* `height` 縦幅(ピクセル単位)。`width`と`height`は併用できません(両方指定された場合は、`width`が優先されます)。
* `phrase` ロゴマークを変化させる任意のフレーズ。UTF8によりURLエンコードします。

## 例

    # 横幅400pxの横長タイプのロゴをpng形式で生成。フレーズはlogo
    http://localhost:3000/line.png?width=400&phrase=logo

# ロゴマークテンプレート

1. Illustrator等で生成します。`Trianglify`により生成されたロゴマークを適用する要素には`logo-mark`というIDを付与します。
2. `template/logos.yml`にロゴマーク全体のサイズと、ロゴマーク要素のサイズと位置を指定します。
