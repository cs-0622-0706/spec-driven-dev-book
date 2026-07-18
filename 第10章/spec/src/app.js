(function () {
  "use strict";

  /** @type {{ title: string; url: string }[]} */
  let lastResults = [];

  const htmlInput = document.getElementById("html-input");
  const htmlFile = document.getElementById("html-file");
  const baseUrlInput = document.getElementById("base-url");
  const extractBtn = document.getElementById("extract-btn");
  const resultCount = document.getElementById("result-count");
  const resultTable = document.getElementById("result-table");
  const resultBody = document.getElementById("result-body");
  const saveJson = document.getElementById("save-json");
  const saveCsv = document.getElementById("save-csv");

  /**
   * @param {string} href
   * @returns {boolean}
   */
  function shouldExcludeHref(href) {
    const t = href.trim();
    if (!t) return true;
    if (t.startsWith("#")) return true;
    if (t.toLowerCase().startsWith("javascript:")) return true;
    return false;
  }

  /**
   * @param {string} href
   * @param {string} baseUrl
   * @returns {string | null}
   */
  function normalizeUrl(href, baseUrl) {
    const trimmed = href.trim();
    const base = baseUrl.trim();
    try {
      if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(trimmed)) {
        return new URL(trimmed).href;
      }
      if (!base) return null;
      return new URL(trimmed, base).href;
    } catch {
      return null;
    }
  }

  /**
   * @param {string} html
   * @param {string} baseUrl
   * @returns {{ title: string; url: string }[]}
   */
  function extractLinks(html, baseUrl) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const anchors = doc.querySelectorAll("a[href]");
    /** @type {Map<string, string>} */
    const byUrl = new Map();

    anchors.forEach((a) => {
      const href = a.getAttribute("href");
      if (href == null || shouldExcludeHref(href)) return;
      const title = a.textContent.trim();
      if (!title) return;
      const url = normalizeUrl(href, baseUrl);
      if (url == null) return;
      if (!byUrl.has(url)) {
        byUrl.set(url, title);
      }
    });

    return Array.from(byUrl.entries()).map(([url, title]) => ({ title, url }));
  }

  function renderResults(items) {
    lastResults = items;
    resultBody.textContent = "";
    const n = items.length;
    resultCount.textContent = n === 0 ? "0 件" : `${n} 件`;
    if (n === 0) {
      resultTable.hidden = true;
      saveJson.disabled = true;
      saveCsv.disabled = true;
      return;
    }
    resultTable.hidden = false;
    saveJson.disabled = false;
    saveCsv.disabled = false;
    const frag = document.createDocumentFragment();
    items.forEach(({ title, url }) => {
      const tr = document.createElement("tr");
      const tdTitle = document.createElement("td");
      tdTitle.textContent = title;
      const tdUrl = document.createElement("td");
      const link = document.createElement("a");
      link.href = url;
      link.textContent = url;
      link.rel = "noopener noreferrer";
      tdUrl.appendChild(link);
      tr.appendChild(tdTitle);
      tr.appendChild(tdUrl);
      frag.appendChild(tr);
    });
    resultBody.appendChild(frag);
  }

  function runExtract() {
    const html = htmlInput.value;
    const baseUrl = baseUrlInput.value;
    const items = extractLinks(html, baseUrl);
    renderResults(items);
  }

  /**
   * @param {string} filename
   * @param {string} mime
   * @param {BlobPart} body
   */
  function downloadBlob(filename, mime, body) {
    const blob = new Blob([body], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function saveAsJson() {
    const text = JSON.stringify(lastResults, null, 2);
    downloadBlob("links.json", "application/json", text);
  }

  /**
   * @param {string} field
   * @returns {string}
   */
  function escapeCsvField(field) {
    if (/[",\r\n]/.test(field)) {
      return '"' + field.replace(/"/g, '""') + '"';
    }
    return field;
  }

  function saveAsCsv() {
    const lines = ["title,url"];
    lastResults.forEach(({ title, url }) => {
      lines.push(
        escapeCsvField(title) + "," + escapeCsvField(url)
      );
    });
    downloadBlob("links.csv", "text/csv;charset=utf-8", lines.join("\r\n"));
  }

  htmlFile.addEventListener("change", () => {
    const file = htmlFile.files && htmlFile.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        htmlInput.value = reader.result;
      }
      htmlFile.value = "";
    };
    reader.readAsText(file);
  });

  extractBtn.addEventListener("click", runExtract);
  saveJson.addEventListener("click", saveAsJson);
  saveCsv.addEventListener("click", saveAsCsv);
})();
