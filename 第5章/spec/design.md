# 第5章 design

## 状態（固定）
UI 状態は `idle` / `loading` / `success` / `error` に固定する。

## 入力バリデーション
- 都市名が空/空白のみのときは API を呼ばず、入力エラーを表示する

## API 仕様（教材用の簡略）
- 都市名を geocoding で緯度経度に変換してから天気取得する（実装都合でよい）

## 失敗分類（固定）
- `network` / `notfound` / `timeout`

## ローディング方針
- `loading` 中は多重送信できない（ボタン disabled など）
- `loading` 中は取得中と分かる視覚表示を出す（スピナー、「読み込み中…」など）
- `timeout` は必ず `loading` を解除し、操作可能に戻す