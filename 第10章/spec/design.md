# 第10章 design

## 処理の段

- 入力（HTML 文字列／ファイル）→ 抽出 → 正規化 → 重複排除 → 一覧表示 → 保存、の段を分離する

## DOM

- `DOMParser` でパースし、`<a>` から `href` と表示テキストを取得する

## UI

- HTML 入力欄（textarea 等）またはファイル選択
- `baseUrl` 入力欄
- 抽出結果の一覧と、JSON／CSV 保存ボタン

## スタイル

- スタイリングには `Tailwind CSS`（CDN）を使ってよい

## 成果物の配置

- 実装の成果物は `spec/src/index.html` / `spec/src/style.css` / `spec/src/app.js` の 3 ファイルにまとめる

## 制約

- 仕様外（外部 fetch、全文転載）は追加しない