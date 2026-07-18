# 第7章 acceptance（P0）

以下を満たすこと。ブラウザは AC-01 から順に。

- **AC-01** Given `name` が空、When 投稿、Then `名無し` として登録される
- **AC-02** Given `message` が空、When 投稿、Then エラーを表示し登録しない
- **AC-03** Given 投稿が2件ある、When 新規投稿、Then 新規投稿が先頭に表示される
- **AC-04** Given 文字数が 301 文字、When 投稿、Then 文字数エラーで拒否する