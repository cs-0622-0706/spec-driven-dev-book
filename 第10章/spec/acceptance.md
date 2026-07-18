# 第10章 acceptance（P0〜P2）

本章の合否の**下限**は **P0** です。P0 は抽出と重複排除、P1 は相対 URL と空結果、P2 は保存の整合を確認する。

## P0（最小合格）

- **AC-01** Given HTML に記事リンクが複数ある、When 抽出、Then title／url の一覧が表示される
- **AC-02** Given 同一 URL が複数回出現する HTML、When 抽出、Then 重複は 1 件に統合される

## P1（実務耐性：正規化と空結果）

- **AC-03** Given 相対 URL を含む HTML と baseUrl、When 抽出、Then 絶対 URL に正規化される
- **AC-04** Given 抽出対象が無い HTML、When 抽出、Then エラーで止まらず「0 件」と表示される

## P2（完成度：保存）

- **AC-05** Given 抽出結果がある、When JSON／CSV 保存、Then 保存内容は画面表示と同じ集合・同じ件数である