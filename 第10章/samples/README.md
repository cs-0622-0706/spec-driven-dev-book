# 第10章 samples — spec は成功・vibe は要件からズレる検証用

`第10章/spec/src/index.html`（**spec**）と `第10章/vibe/article-link-extractor.html`（**vibe**）をブラウザで開き、同じ HTML を読み込んで挙動を比較するためのサンプルです。

## 手順

1. **spec**: `spec/src/index.html` を開き、ファイル選択で `01-mixed-links.html` を指定する。Base URL に `https://example.com` を入力して抽出する。
2. **vibe**: `vibe/article-link-extractor.html` を開き、ファイル選択で同じ HTML を指定して抽出する（オプションはデフォルトのまま）。

## ファイル一覧

| ファイル | 目的 |
|----------|------|
| `01-mixed-links.html` | 相対URL、空テキスト、ハッシュ違いのリンクを混在させた検証用 HTML |

---

## `01-mixed-links.html` の期待される挙動

### spec（要件どおり成功）

- **相対 URL**: Base URL（`https://example.com`）を用いて、`https://example.com/articles/101` のように絶対 URL に正規化されて抽出される。
- **空テキスト**: `title` が空のリンク（画像のみのリンクや空白のみのリンク）は、要件どおり**除外**される。
- **ハッシュ違い**: `.../document#section1` と `.../document#section2` は別 URL として**両方抽出**される。
- **保存**: 抽出結果を **JSON** および **CSV** でダウンロードできる（AC-05）。

### vibe（要件からズレる／バグに見える挙動）

- **相対 URL**: Base URL を指定する欄がなく、HTML 内に `<base>` タグもないため相対 URL のまま処理される。さらにデフォルトの「http(s) のみ」オプションによって**すべて除外されてしまう**。
- **空テキスト**: 除外されず、`"(リンクテキストなし)"` というタイトルで**抽出されてしまう**。
- **ハッシュ違い**: 重複排除の際にハッシュ（`#`）以降を切り捨てて判定するため、セクション1とセクション2が同一 URL とみなされ、**片方が消えてしまう**。
- **保存**: JSON や CSV でのダウンロード機能がなく、クリップボードへのコピー機能のみとなっている（要件違反）。

---

## 参照

- 章の要件: `spec/requirements.md`
- 受入条件: `spec/acceptance.md`
- 参照実装: `spec/src/app.js`
- バイブ実装: `vibe/article-link-extractor.html`
