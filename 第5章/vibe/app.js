// 都市名で天気を表示するアプリ（Open-Meteo API 使用、APIキー不要）

const $ = (selector) => {
  const el = document.querySelector(selector);
  if (!el) throw new Error(`Missing element: ${selector}`);
  return el;
};

const form = $("#searchForm");
const cityInput = $("#cityInput");
const button = $("#searchButton");

const spinnerEl = $("#spinner");
const statusEl = $("#status");
const resultEl = $("#result");

const placeNameEl = $("#placeName");
const placeMetaEl = $("#placeMeta");
const weatherBadgeEl = $("#weatherBadge");

const tempNowEl = $("#tempNow");
const apparentTempEl = $("#apparentTemp");
const windNowEl = $("#windNow");
const precipProbMaxEl = $("#precipProbMax");

const tempMaxEl = $("#tempMax");
const tempMinEl = $("#tempMin");
const updatedAtEl = $("#updatedAt");

function setStatus(message, kind = "info") {
  statusEl.textContent = message ?? "";
  statusEl.classList.toggle("error", kind === "error");
}

function setLoading(isLoading) {
  spinnerEl.hidden = !isLoading;
}

function showResult(show) {
  resultEl.hidden = !show;
}

function formatCoord(lat, lon) {
  const ns = lat >= 0 ? "N" : "S";
  const ew = lon >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(3)}°${ns}, ${Math.abs(lon).toFixed(3)}°${ew}`;
}

function formatTimeLocal(isoLike) {
  if (!isoLike) return "-";
  return isoLike.replace("T", " ");
}

function round1(n) {
  if (typeof n !== "number" || Number.isNaN(n)) return "-";
  return (Math.round(n * 10) / 10).toString();
}

function round0(n) {
  if (typeof n !== "number" || Number.isNaN(n)) return "-";
  return Math.round(n).toString();
}

// Open-Meteo の天気コードを日本語に変換
// https://open-meteo.com/en/docs#weathercode
function weatherCodeToLabel(code) {
  const c = Number(code);
  if (Number.isNaN(c)) return "不明";
  if (c === 0) return "快晴";
  if (c === 1) return "ほぼ快晴";
  if (c === 2) return "一部曇り";
  if (c === 3) return "曇り";
  if (c === 45 || c === 48) return "霧";
  if (c === 51 || c === 53 || c === 55) return "霧雨";
  if (c === 56 || c === 57) return "凍る霧雨";
  if (c === 61 || c === 63 || c === 65) return "雨";
  if (c === 66 || c === 67) return "凍る雨";
  if (c === 71 || c === 73 || c === 75) return "雪";
  if (c === 77) return "霰（あられ）";
  if (c === 80 || c === 81 || c === 82) return "にわか雨";
  if (c === 85 || c === 86) return "にわか雪";
  if (c === 95) return "雷雨";
  if (c === 96 || c === 99) return "雷雨（雹）";
  return `天気コード ${c}`;
}

async function fetchJson(url) {
  const res = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

// 都市名から緯度・経度を取得（Geocoding API）
async function geocodeCity(name) {
  const q = encodeURIComponent(name.trim());
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${q}&count=5&language=ja&format=json`;
  const data = await fetchJson(url);
  const results = Array.isArray(data?.results) ? data.results : [];
  if (results.length === 0) return null;

  const r = results[0];
  return {
    name: r.name,
    admin1: r.admin1,
    country: r.country,
    country_code: r.country_code,
    latitude: r.latitude,
    longitude: r.longitude,
    timezone: r.timezone,
  };
}

async function fetchWeather({ latitude, longitude, timezone }) {
  const lat = encodeURIComponent(String(latitude));
  const lon = encodeURIComponent(String(longitude));
  const tz = encodeURIComponent(timezone || "auto");

  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m` +
    `&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max` +
    `&timezone=${tz}`;

  return await fetchJson(url);
}

async function runSearch(city) {
  setLoading(true);
  showResult(false);
  setStatus("都市を検索しています…");

  const place = await geocodeCity(city.trim());

  setStatus("天気を取得しています…");
  const weather = await fetchWeather(place);

  const current = weather?.current ?? null;
  const daily = weather?.daily ?? null;

  const tempNow = current?.temperature_2m;
  const apparent = current?.apparent_temperature;
  const wind = current?.wind_speed_10m;
  const code = current?.weather_code;

  const tMax = Array.isArray(daily?.temperature_2m_max)
    ? daily.temperature_2m_max[0]
    : undefined;
  const tMin = Array.isArray(daily?.temperature_2m_min)
    ? daily.temperature_2m_min[0]
    : undefined;
  const pMax = Array.isArray(daily?.precipitation_probability_max)
    ? daily.precipitation_probability_max[0]
    : undefined;

  const prettyName = [place.name, place.admin1, place.country]
    .filter(Boolean)
    .join(" / ");
  placeNameEl.textContent = prettyName;
  placeMetaEl.textContent = `${formatCoord(place.latitude, place.longitude)} · タイムゾーン: ${place.timezone || "auto"}`;

  weatherBadgeEl.textContent = weatherCodeToLabel(code);

  tempNowEl.textContent = round1(tempNow);
  apparentTempEl.textContent = round1(apparent);
  windNowEl.textContent = round1(wind);
  precipProbMaxEl.textContent = round0(pMax);

  tempMaxEl.textContent = round1(tMax);
  tempMinEl.textContent = round1(tMin);
  updatedAtEl.textContent = formatTimeLocal(current?.time);

  setStatus("");
  showResult(true);
  setLoading(false);
}

form.addEventListener("submit", (ev) => {
  ev.preventDefault();
  runSearch(cityInput.value);
});

cityInput.focus();
