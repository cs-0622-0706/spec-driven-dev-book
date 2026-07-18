/**
 * 第9章: parse → normalize → aggregate → render
 * 仕様: spec/requirements.md, spec/design.md
 */

const EXPECTED_HEADER = ["date", "amount", "category", "memo"];

/** @type {{ month: string, category: string, total: number }[] | null} */
let currentAggregated = null;

/**
 * CSV 1行をカンマ区切りで分割（ダブルクォート内のカンマは無視）
 * @param {string} line
 * @returns {string[]}
 */
function parseCSVLine(line) {
  const cells = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQuotes) {
      if (c === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      cells.push(cur);
      cur = "";
    } else {
      cur += c;
    }
  }
  cells.push(cur);
  return cells;
}

/**
 * @param {string} text
 * @returns {{ ok: true, rows: { lineIndex: number, cells: string[] | null }[] } | { ok: false, error: string }}
 */
function parse(text) {
  const lines = text.split(/\r?\n/).filter((ln) => ln.length > 0);
  if (lines.length === 0) {
    return { ok: false, error: "ファイルが空です。" };
  }
  const headerCells = parseCSVLine(lines[0]).map((c) => c.trim());
  if (headerCells.length !== EXPECTED_HEADER.length) {
    return {
      ok: false,
      error: `ヘッダは ${EXPECTED_HEADER.join(",")} の 4 列である必要があります。`,
    };
  }
  for (let i = 0; i < EXPECTED_HEADER.length; i++) {
    if (headerCells[i] !== EXPECTED_HEADER[i]) {
      return {
        ok: false,
        error: `ヘッダは順に ${EXPECTED_HEADER.join(",")} である必要があります。`,
      };
    }
  }
  const rows = [];
  for (let r = 1; r < lines.length; r++) {
    const cells = parseCSVLine(lines[r]);
    if (cells.length !== EXPECTED_HEADER.length) {
      rows.push({ lineIndex: r + 1, cells: null });
      continue;
    }
    rows.push({
      lineIndex: r + 1,
      cells: cells.map((c) => c.trim()),
    });
  }
  return { ok: true, rows };
}

/**
 * @param {string} s
 */
function isValidYMD(s) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const [y, m, d] = s.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return (
    dt.getUTCFullYear() === y &&
    dt.getUTCMonth() === m - 1 &&
    dt.getUTCDate() === d
  );
}

/**
 * @param {string} s
 */
function monthKeyFromDate(s) {
  return s.slice(0, 7);
}

/**
 * @param {{ cells: string[] | null, lineIndex: number }[]} rawRows
 */
function normalize(rawRows) {
  /** @type {{ month: string, amount: number, category: string }[]} */
  const valid = [];
  let skipped = 0;

  for (const row of rawRows) {
    if (!row.cells || row.cells.length !== 4) {
      skipped++;
      continue;
    }
    const [dateStr, amountStr, category, _memo] = row.cells;

    if (!isValidYMD(dateStr)) {
      skipped++;
      continue;
    }
    const month = monthKeyFromDate(dateStr);

    if (!/^-?\d+$/.test(amountStr)) {
      skipped++;
      continue;
    }
    const amount = Number(amountStr);
    if (!Number.isSafeInteger(amount)) {
      skipped++;
      continue;
    }

    if (category === "") {
      skipped++;
      continue;
    }

    valid.push({ month, amount, category });
  }

  return { valid, skipped };
}

/**
 * @param {{ month: string, amount: number, category: string }[]} valid
 * @returns {{ month: string, category: string, total: number }[]}
 */
function aggregate(valid) {
  /** @type {Map<string, number>} */
  const map = new Map();
  for (const { month, amount, category } of valid) {
    const key = `${month}\t${category}`;
    map.set(key, (map.get(key) ?? 0) + amount);
  }
  /** @type {{ month: string, category: string, total: number }[]} */
  const out = [];
  for (const [key, total] of map) {
    const [month, category] = key.split("\t");
    out.push({ month, category, total });
  }
  out.sort((a, b) => {
    if (a.month !== b.month) return a.month.localeCompare(b.month);
    return a.category.localeCompare(b.category, "ja");
  });
  return out;
}

/**
 * @param {{ month: string, category: string, total: number }[]} rows
 * @param {number} skipped
 */
function render(rows, skipped) {
  const tbody = document.getElementById("result-body");
  const warn = document.getElementById("warning-area");
  const err = document.getElementById("error-area");
  err.classList.add("hidden");
  err.textContent = "";

  if (skipped > 0) {
    warn.textContent = `不正行を ${skipped} 件スキップしました。`;
    warn.classList.remove("hidden");
  } else {
    warn.classList.add("hidden");
    warn.textContent = "";
  }

  tbody.innerHTML = "";
  if (rows.length === 0) {
    const tr = document.createElement("tr");
    tr.innerHTML =
      '<td colspan="3" class="py-8 text-center text-slate-500">有効なデータ行がありません。</td>';
    tbody.appendChild(tr);
    return;
  }

  for (const r of rows) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="pr-4 font-mono text-slate-800">${escapeHtml(r.month)}</td>
      <td class="pr-4 text-slate-800">${escapeHtml(r.category)}</td>
      <td class="text-right font-mono tabular-nums text-slate-800">${escapeHtml(
        String(r.total)
      )}</td>
    `;
    tbody.appendChild(tr);
  }
}

/**
 * @param {string} s
 */
function escapeHtml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * @param {string} message
 */
function showError(message) {
  const warn = document.getElementById("warning-area");
  const err = document.getElementById("error-area");
  warn.classList.add("hidden");
  warn.textContent = "";
  err.textContent = message;
  err.classList.remove("hidden");
  currentAggregated = null;
  setDownloadEnabled(false);
  const tbody = document.getElementById("result-body");
  tbody.innerHTML =
    '<tr><td colspan="3" class="py-8 text-center text-slate-500">CSV をアップロードするとここに表示されます。</td></tr>';
}

/**
 * @param {boolean} on
 */
function setDownloadEnabled(on) {
  document.getElementById("btn-download-json").disabled = !on;
  document.getElementById("btn-download-csv").disabled = !on;
}

/**
 * @param {File} file
 * @param {HTMLInputElement} fileInput
 */
function processFile(file, fileInput) {
  const reader = new FileReader();
  reader.onload = () => {
    const text = typeof reader.result === "string" ? reader.result : "";
    const parsed = parse(text);
    if (!parsed.ok) {
      showError(parsed.error);
      fileInput.value = "";
      return;
    }
    const { valid, skipped } = normalize(parsed.rows);
    const rows = aggregate(valid);
    currentAggregated = rows;
    render(rows, skipped);
    setDownloadEnabled(rows.length > 0);
    fileInput.value = "";
  };
  reader.onerror = () => {
    showError("ファイルの読み込みに失敗しました。");
    fileInput.value = "";
  };
  reader.readAsText(file, "UTF-8");
}

function downloadJSON() {
  if (!currentAggregated || currentAggregated.length === 0) return;
  const blob = new Blob([JSON.stringify(currentAggregated, null, 2)], {
    type: "application/json;charset=utf-8",
  });
  triggerDownload(blob, "kakeibo-aggregate.json");
}

function downloadAggregateCSV() {
  if (!currentAggregated || currentAggregated.length === 0) return;
  const header = "month,category,total";
  const lines = [header];
  for (const r of currentAggregated) {
    lines.push(
      [csvEscape(r.month), csvEscape(r.category), String(r.total)].join(",")
    );
  }
  const blob = new Blob([lines.join("\n")], {
    type: "text/csv;charset=utf-8",
  });
  triggerDownload(blob, "kakeibo-aggregate.csv");
}

/**
 * @param {string} field
 */
function csvEscape(field) {
  if (/[",\n\r]/.test(field)) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

/**
 * @param {Blob} blob
 * @param {string} filename
 */
function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function init() {
  document.getElementById("file-input").addEventListener("change", (e) => {
    const input = e.target;
    if (!(input instanceof HTMLInputElement) || !input.files?.length) return;
    const file = input.files[0];
    processFile(file, input);
  });

  document.getElementById("btn-download-json").addEventListener("click", downloadJSON);
  document.getElementById("btn-download-csv").addEventListener("click", downloadAggregateCSV);
}

init();
