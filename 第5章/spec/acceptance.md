# 第5章 acceptance（P0）

以下 **7 件**すべて満たすこと。ブラウザは AC-01 から順に。

- **AC-01** Given 初期表示、Then 入力欄と `検索` ボタンが見えている（状態は idle）
- **AC-02** Given 都市名が空、When `検索`、Then `都市名を入力してください` を表示し API を呼ばない
- **AC-03** Given 取得開始、When `検索`、Then loading 表示になり多重送信できない（ボタン無効など）
- **AC-04** Given 正常取得、When 完了、Then `都市名/天気/気温/更新時刻` が表示される（state=success）
- **AC-05** Given notfound 相当、When 完了、Then `該当する都市が見つかりません。` を表示する
- **AC-06** Given network 相当、When 完了、Then `通信に失敗しました。再試行してください。` を表示する
- **AC-07** Given timeout 相当、When 完了、Then `時間がかかっています。しばらくして再試行してください。` を表示し loading 解除され操作できる