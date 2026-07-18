const UI_STATE = {
  idle: "idle",
  loading: "loading",
  success: "success",
  error: "error",
};

const ERROR_MESSAGE = {
  input: "都市名を入力してください",
  network: "通信に失敗しました。再試行してください。",
  notfound: "該当する都市が見つかりません。",
  timeout: "時間がかかっています。しばらくして再試行してください。",
};

const TIMEOUT_MS = 8000;

const $ = (id) => document.getElementById(id);

const dom = {
  form: $("searchForm"),
  input: $("cityInput"),
  button: $("searchButton"),
  statusText: $("statusText"),
  spinner: $("spinner"),
  errorText: $("errorText"),
  resultSection: $("result"),
  resultCity: $("resultCity"),
  resultWeather: $("resultWeather"),
  resultTemp: $("resultTemp"),
  resultUpdatedAt: $("resultUpdatedAt"),
};

let state = UI_STATE.idle;
let inFlight = null; // { abortController }

function setState(nextState) {
  state = nextState;
  const isLoading = state === UI_STATE.loading;

  dom.button.disabled = isLoading;
  dom.input.disabled = isLoading;
  dom.spinner.hidden = !isLoading;

  if (state === UI_STATE.idle) {
    dom.statusText.textContent = "";
    dom.errorText.textContent = "";
    dom.resultSection.hidden = true;
  }

  if (state === UI_STATE.loading) {
    dom.statusText.textContent = "読み込み中…";
    dom.errorText.textContent = "";
    dom.resultSection.hidden = true;
  }
}

function showError(message) {
  dom.errorText.textContent = message;
  dom.statusText.textContent = "";
  dom.resultSection.hidden = true;
}

function showSuccess({ city, weatherText, temperatureC, updatedAtText }) {
  dom.resultCity.textContent = city;
  dom.resultWeather.textContent = weatherText;
  dom.resultTemp.textContent = `${temperatureC}`;
  dom.resultUpdatedAt.textContent = updatedAtText;
  dom.resultSection.hidden = false;
  dom.errorText.textContent = "";
  dom.statusText.textContent = "";
}

function normalizeCityInput(value) {
  return value.replace(/\s+/g, " ").trim();
}

function weatherCodeToText(code) {
  // Open-Meteo weather code mapping (短い説明)
  // https://open-meteo.com/en/docs
  const map = new Map([
    [0, "快晴"],
    [1, "晴れ"],
    [2, "晴れ時々くもり"],
    [3, "くもり"],
    [45, "霧"],
    [48, "霧（着氷性）"],
    [51, "霧雨（弱）"],
    [53, "霧雨（中）"],
    [55, "霧雨（強）"],
    [56, "着氷性の霧雨（弱）"],
    [57, "着氷性の霧雨（強）"],
    [61, "雨（弱）"],
    [63, "雨（中）"],
    [65, "雨（強）"],
    [66, "着氷性の雨（弱）"],
    [67, "着氷性の雨（強）"],
    [71, "雪（弱）"],
    [73, "雪（中）"],
    [75, "雪（強）"],
    [77, "霰"],
    [80, "にわか雨（弱）"],
    [81, "にわか雨（中）"],
    [82, "にわか雨（強）"],
    [85, "にわか雪（弱）"],
    [86, "にわか雪（強）"],
    [95, "雷雨"],
    [96, "雷雨（雹の可能性）"],
    [99, "雷雨（雹）"],
  ]);
  return map.get(code) ?? "不明";
}

function formatUpdatedAt(isoLike) {
  // Open-Meteo は "YYYY-MM-DDTHH:MM" 形式（秒なし）を返すことがある
  const d = new Date(isoLike);
  if (Number.isNaN(d.getTime())) return isoLike;

  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${day} ${hh}:${mm}`;
}

async function fetchJsonWithTimeout(url, { signal } = {}) {
  const abortController = new AbortController();
  const timerId = setTimeout(() => abortController.abort(), TIMEOUT_MS);

  const combinedSignal = (() => {
    if (!signal) return abortController.signal;
    if (signal.aborted) return signal;

    const combo = new AbortController();
    const onAbort = () => combo.abort();
    signal.addEventListener("abort", onAbort, { once: true });
    abortController.signal.addEventListener("abort", onAbort, { once: true });
    return combo.signal;
  })();

  try {
    const res = await fetch(url, { signal: combinedSignal });
    if (!res.ok) {
      const err = new Error(`HTTP ${res.status}`);
      err.httpStatus = res.status;
      throw err;
    }
    return await res.json();
  } finally {
    clearTimeout(timerId);
  }
}

async function geocodeCity(city, { signal } = {}) {
  const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
  url.searchParams.set("name", city);
  url.searchParams.set("count", "1");
  url.searchParams.set("language", "ja");
  url.searchParams.set("format", "json");

  const data = await fetchJsonWithTimeout(url.toString(), { signal });

  const hit = data?.results?.[0];
  if (!hit) return null;
  return {
    name: hit.name,
    latitude: hit.latitude,
    longitude: hit.longitude,
  };
}

async function fetchCurrentWeather({ latitude, longitude }, { signal } = {}) {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(latitude));
  url.searchParams.set("longitude", String(longitude));
  url.searchParams.set("current_weather", "true");
  url.searchParams.set("timezone", "auto");

  const data = await fetchJsonWithTimeout(url.toString(), { signal });
  const cw = data?.current_weather;
  if (!cw) {
    const err = new Error("No current_weather");
    err.kind = "network";
    throw err;
  }
  return {
    temperature: cw.temperature,
    weathercode: cw.weathercode,
    time: cw.time,
  };
}

function classifyError(err) {
  if (err?.name === "AbortError") return "timeout";
  if (err?.httpStatus === 404) return "notfound";
  return "network";
}

function cancelInFlight() {
  if (inFlight?.abortController) {
    inFlight.abortController.abort();
  }
  inFlight = null;
}

async function onSearch(cityRaw) {
  const city = normalizeCityInput(cityRaw);

  if (!city) {
    setState(UI_STATE.error);
    showError(ERROR_MESSAGE.input);
    return;
  }

  cancelInFlight();
  const abortController = new AbortController();
  inFlight = { abortController };

  setState(UI_STATE.loading);

  try {
    const geo = await geocodeCity(city, { signal: abortController.signal });
    if (!geo) {
      setState(UI_STATE.error);
      showError(ERROR_MESSAGE.notfound);
      return;
    }

    const weather = await fetchCurrentWeather(
      { latitude: geo.latitude, longitude: geo.longitude },
      { signal: abortController.signal },
    );

    setState(UI_STATE.success);
    showSuccess({
      city: geo.name,
      weatherText: weatherCodeToText(weather.weathercode),
      temperatureC: weather.temperature,
      updatedAtText: formatUpdatedAt(weather.time),
    });
  } catch (err) {
    const kind = classifyError(err);
    setState(UI_STATE.error);
    showError(ERROR_MESSAGE[kind] ?? ERROR_MESSAGE.network);
  } finally {
    inFlight = null;
    if (state === UI_STATE.error) {
      // error では操作可能に戻っている必要がある（特に timeout）
      dom.button.disabled = false;
      dom.input.disabled = false;
    }
  }
}

dom.form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (state === UI_STATE.loading) return; // 念のため
  onSearch(dom.input.value);
});

setState(UI_STATE.idle);
