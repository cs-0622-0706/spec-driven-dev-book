# 第8章 design

## 画面構成

- `index.html`（ログイン画面）と `protected.html`（保護画面）の 2 ファイルで構成する
- `protected.html` の `<head>` 内（`<body>` 描画前）で認証フラグを確認し、未ログインなら `window.location.replace("index.html")` でリダイレクトする

## セッション

- ログイン成功で `sessionStorage` に認証フラグを書く
- ログアウトで `sessionStorage` をクリアする

## 保護画面

- `protected.html` の描画前に認証フラグを検査し、未ログインなら `index.html` にリダイレクトする
- 保護情報（ログイン後にだけ見せる内容）は未ログインでは DOM に載せない

## ログアウト後の「戻る」

- 戻る操作で `protected.html` が読み込まれても、`<head>` 内チェックがリダイレクトするため保護内容は描画されない

## スタイル

- スタイリングには `Tailwind CSS`（CDN）を使う

## 成果物の配置

- 実装の成果物は `spec/src/index.html` / `spec/src/protected.html` / `spec/src/style.css` / `spec/src/app.js` の 4 ファイルにまとめる（`app.js` は認証ロジックの共有ファイル）