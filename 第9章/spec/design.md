# 第9章 design

## 処理の段

- `parse` → `normalize` → `aggregate` → `render` の責務を分離する
- 不正行の扱いは `normalize`（または直後）で判定し、集計から除外する

## UI

- ファイル選択（アップロード）と、集計結果の表表示
- スキップ件数をユーザーに見せる（警告エリアなど）

## スタイル

- スタイリングには `Tailwind CSS`（CDN）を使ってよい

## 成果物の配置

- 実装の成果物は `spec/src/index.html` / `spec/src/style.css` / `spec/src/app.js` の 3 ファイルにまとめる

## 制約

- 仕様外（サーバ保存、外部 API、区切りの自動判定など）は追加しない
