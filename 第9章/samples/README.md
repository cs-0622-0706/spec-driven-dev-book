# 第9章 samples — spec は成功・vibe は要件からズレる検証用

`spec/src/index.html`（**spec**）と `vibe/index.html`（**vibe**）をブラウザで開き、同じ CSV を読み込んで挙動を比較するためのサンプルです。

## 手順

1. **spec**: `spec/src/index.html` を開き、ファイル選択で各 CSV を指定する。
2. **vibe**: `vibe/index.html` を開き、同じ CSV を選択する（ファイル選択後に自動で集計される）。

## ファイル一覧

| ファイル | 含まれる差分の種類 |
|----------|--------------------|
| `01-p0-valid.csv` | すべて正規の行。spec・vibe ともに集計できる。表の形はどちらもピボット表だが、**JSON 構造**が異なる。 |
| `02-p1-invalid-empty-category-decimal.csv` | **category 空欄・小数 amount** を含む最小例。spec はスキップ、vibe は別扱い。 |
| `03-p1-full-mixed-invalid.csv` | 上記に加え **YYYY/MM/DD 形式の date** も含む。spec と vibe の差が最も多く出る。 |

---

## `01-p0-valid.csv` の期待

### spec（成功）

- ヘッダ `date,amount,category,memo` を検証し、月×カテゴリの**ピボット表**を表示する。
- 同じファイルを何度読み込んでも同じ集計（再現性）。
- **JSON** と **CSV** のダウンロードがあり、画面の集計と一致する（AC-04）。

### vibe（「動く」が要件どおりではない）

- 集計表がピボット形式で表示される（spec と同じ形）。
- CSV・JSON ともにダウンロードできるが、**JSON は `{ "YYYY-MM": { "カテゴリ": 合計 } }` のネスト形式**で spec の flat 配列と異なる。
- 正常系 CSV では数値は一致する。

---

## `02-p1-invalid-empty-category-decimal.csv` の期待

このファイルで確認できる差：**category 空欄** と **小数 amount**

### spec（成功）

- `category` が空の行は**不正行としてスキップ**（スキップ件数を警告表示）。
- `amount` が `99.5` のような**小数**はスキップ。
- 有効行のみで集計: 食費 500、日用品 200（2026-04）、スキップ **2 件**。

### vibe（要件からズレる挙動）

- `category` 空欄を **「（未分類）」として集計に含める**ため、spec では捨てる 100 円が**合計に乗る**。
- `99.5` を数値として受理し、**整数円ではない合計**に加算する（spec ではスキップ）。
- 結果として**ピボット表の数値が spec と一致しない**（同じ CSV・同じ形のピボット表なのに集計値が二通りになる）。

---

## `03-p1-full-mixed-invalid.csv` の期待

このファイルで確認できる差：**YYYY/MM/DD 形式の date**・**category 空欄**・**小数 amount**・**不正 date/amount**

### spec（成功）

- `YYYY/MM/DD` 形式の date は `YYYY-MM-DD` のみを正規と定めているため**不正行としてスキップ**。
- `abc`・存在しない月（`2026-13-01`）・空 category・小数 amount もスキップ。
- スキップ件数（5件）を警告表示し、残りの有効行だけで集計する。

### vibe（ズレが最も出やすい）

- `YYYY/MM/DD` 形式の date を**受け入れて集計に含める**（spec ではスキップされる行が合計に乗る）。
- 空 category を**（未分類）として計上**する。
- 小数 amount を**スキップせず加算**する（ただし `abc` など数値変換できない行はスキップ）。
- 結果として spec とスキップ件数・合計値の両方が一致しない。

---

## 参照

- 章の要件: `spec/requirements.md`
- 受入条件: `spec/acceptance.md`
- SPEC に沿った実装例: `spec/src/app.js`
