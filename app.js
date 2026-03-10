// ============================================
// Fox Valley Weather — Main Application
// Appleton, WI 54911 / NWS Green Bay (GRB)
// ============================================

const CONFIG = {
  gridOffice: "GRB",
  gridX: 66,
  gridY: 20,
  lat: 44.2619,
  lon: -88.4154,
  userAgent: "FoxValleyWeather (github.com/omatty123/fox-valley-weather)",
};

const API = {
  forecast: `https://api.weather.gov/gridpoints/${CONFIG.gridOffice}/${CONFIG.gridX},${CONFIG.gridY}/forecast`,
  hourly: `https://api.weather.gov/gridpoints/${CONFIG.gridOffice}/${CONFIG.gridX},${CONFIG.gridY}/forecast/hourly`,
  stations: `https://api.weather.gov/gridpoints/${CONFIG.gridOffice}/${CONFIG.gridX},${CONFIG.gridY}/stations`,
  afd: `https://api.weather.gov/products/types/AFD/locations/${CONFIG.gridOffice}`,
  alerts: `https://api.weather.gov/alerts/active?point=${CONFIG.lat},${CONFIG.lon}`,
};

// ---- State ----
let state = {
  observations: null,
  forecast: null,
  hourly: null,
  afd: null,
  alerts: null,
  nearestStation: null,
  teachingMode: true,
};

// ---- Init ----
document.addEventListener("DOMContentLoaded", () => {
  initTabs();
  initTeachingToggle();
  initTooltip();
  initRefresh();
  loadAllData();
  registerSW();
});

// ---- Service Worker ----
function registerSW() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }
}

// ---- Tab Navigation ----
function initTabs() {
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach((t) => {
        t.classList.remove("active");
        t.setAttribute("aria-selected", "false");
      });
      document.querySelectorAll(".panel").forEach((p) => p.classList.remove("active"));

      tab.classList.add("active");
      tab.setAttribute("aria-selected", "true");
      const panelId = `panel-${tab.dataset.tab}`;
      document.getElementById(panelId).classList.add("active");
    });
  });
}

// ---- Teaching Mode Toggle ----
function initTeachingToggle() {
  const toggle = document.getElementById("teaching-mode");
  toggle.addEventListener("change", () => {
    state.teachingMode = toggle.checked;
    const content = document.getElementById("discussion-content");
    if (toggle.checked) {
      content.classList.remove("teaching-off");
    } else {
      content.classList.add("teaching-off");
    }
  });
}

// ---- Tooltip ----
function initTooltip() {
  const tooltip = document.getElementById("term-tooltip");
  const overlay = document.getElementById("tooltip-overlay");
  const closeBtn = tooltip.querySelector(".tooltip-close");

  // Close tooltip
  function closeTooltip() {
    tooltip.classList.add("hidden");
    overlay.classList.add("hidden");
  }

  closeBtn.addEventListener("click", closeTooltip);
  overlay.addEventListener("click", closeTooltip);

  // Delegate click on terms
  document.addEventListener("click", (e) => {
    const termEl = e.target.closest(".term");
    if (!termEl || !state.teachingMode) return;

    const key = termEl.dataset.term;
    const entry = GLOSSARY[key];
    if (!entry) return;

    tooltip.querySelector(".tooltip-term").textContent = entry.term;
    tooltip.querySelector(".tooltip-body").innerHTML = entry.definition;
    tooltip.classList.remove("hidden");
    overlay.classList.remove("hidden");
  });
}

// ---- Refresh ----
function initRefresh() {
  document.getElementById("refresh-btn").addEventListener("click", () => {
    loadAllData();
  });
}

// ---- Data Loading ----
async function apiFetch(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": CONFIG.userAgent, Accept: "application/geo+json" },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

async function loadAllData() {
  const btn = document.getElementById("refresh-btn");
  btn.classList.add("spinning");

  await Promise.allSettled([
    loadAlerts(),
    loadObservations(),
    loadForecast(),
    loadHourly(),
    loadAFD(),
  ]);

  btn.classList.remove("spinning");
  document.getElementById("last-updated").textContent = `Updated ${formatTime(new Date())}`;
}

// ---- Alerts ----
async function loadAlerts() {
  try {
    const data = await apiFetch(API.alerts);
    state.alerts = data.features || [];
    renderAlerts();
  } catch {
    state.alerts = [];
  }
}

function renderAlerts() {
  const banner = document.getElementById("alert-banner");
  if (!state.alerts.length) {
    banner.classList.add("hidden");
    return;
  }

  const alert = state.alerts[0].properties;
  const severity = alert.severity?.toLowerCase() || "warning";
  banner.className = `alert-banner severity-${severity}`;
  banner.textContent = `${alert.event}: ${alert.headline || alert.description?.slice(0, 100)}`;
  banner.onclick = () => {
    if (alert.uri) window.open(alert.uri, "_blank");
  };
}

// ---- Observations (Current Conditions) ----
async function loadObservations() {
  const loadingEl = document.getElementById("current-loading");
  const contentEl = document.getElementById("current-content");

  try {
    // Get nearest station
    if (!state.nearestStation) {
      const stationsData = await apiFetch(API.stations);
      if (stationsData.features?.length) {
        state.nearestStation = stationsData.features[0].properties.stationIdentifier;
      }
    }

    if (!state.nearestStation) throw new Error("No station found");

    const obsData = await apiFetch(
      `https://api.weather.gov/stations/${state.nearestStation}/observations/latest`
    );
    state.observations = obsData.properties;

    // Also load today's forecast for the condition text
    if (!state.forecast) {
      const fcData = await apiFetch(API.forecast);
      state.forecast = fcData.properties.periods;
    }

    renderCurrent();
    loadingEl.classList.add("hidden");
    contentEl.classList.remove("hidden");
  } catch (err) {
    loadingEl.innerHTML = `<span class="error-msg">Could not load current conditions. ${err.message}</span>`;
  }
}

function renderCurrent() {
  const obs = state.observations;
  const el = document.getElementById("current-content");

  const tempC = obs.temperature?.value;
  const tempF = tempC != null ? Math.round(tempC * 9 / 5 + 32) : "--";
  const dewC = obs.dewpoint?.value;
  const dewF = dewC != null ? Math.round(dewC * 9 / 5 + 32) : "--";
  const humidity = obs.relativeHumidity?.value != null ? Math.round(obs.relativeHumidity.value) : "--";
  const windSpeedKmh = obs.windSpeed?.value;
  const windMph = windSpeedKmh != null ? Math.round(windSpeedKmh * 0.621371) : "--";
  const windDir = obs.windDirection?.value != null ? degreesToCompass(obs.windDirection.value) : "";
  const gustKmh = obs.windGust?.value;
  const gustMph = gustKmh != null ? Math.round(gustKmh * 0.621371) : null;
  const pressure = obs.barometricPressure?.value;
  const pressureInHg = pressure != null ? (pressure / 3386.39).toFixed(2) : "--";
  const visibility = obs.visibility?.value;
  const visMiles = visibility != null ? Math.round(visibility / 1609.34) : "--";
  const heatIndex = obs.heatIndex?.value;
  const windChill = obs.windChill?.value;
  const condition = obs.textDescription || (state.forecast?.[0]?.shortForecast) || "N/A";
  const iconUrl = obs.icon || state.forecast?.[0]?.icon || "";

  // Feels like
  let feelsLike = tempF;
  if (windChill != null) {
    feelsLike = Math.round(windChill * 9 / 5 + 32);
  } else if (heatIndex != null) {
    feelsLike = Math.round(heatIndex * 9 / 5 + 32);
  }

  const windDisplay = windMph === 0 ? "Calm" : `${windDir} ${windMph} mph${gustMph ? ` (gusts ${gustMph})` : ""}`;

  el.innerHTML = `
    <div class="current-hero">
      <div>
        <div class="current-temp">${tempF}<span class="unit">°F</span></div>
        <div class="current-condition">${condition}</div>
      </div>
      ${iconUrl ? `<img class="current-icon" src="${iconUrl}" alt="${condition}">` : ""}
    </div>
    <div class="current-details">
      <div class="detail-card">
        <div class="detail-label">Feels Like</div>
        <div class="detail-value ${feelsLike > tempF ? 'warm' : feelsLike < tempF ? 'cool' : ''}">${feelsLike}°F</div>
      </div>
      <div class="detail-card">
        <div class="detail-label">Humidity</div>
        <div class="detail-value">${humidity}%</div>
      </div>
      <div class="detail-card">
        <div class="detail-label">Dewpoint</div>
        <div class="detail-value">${dewF}°F</div>
      </div>
      <div class="detail-card">
        <div class="detail-label">Wind</div>
        <div class="detail-value">${windDisplay}</div>
      </div>
      <div class="detail-card">
        <div class="detail-label">Pressure</div>
        <div class="detail-value">${pressureInHg}" Hg</div>
      </div>
      <div class="detail-card">
        <div class="detail-label">Visibility</div>
        <div class="detail-value">${visMiles} mi</div>
      </div>
    </div>
  `;
}

// ---- 7-Day Forecast ----
async function loadForecast() {
  const loadingEl = document.getElementById("forecast-loading");
  const contentEl = document.getElementById("forecast-content");

  try {
    const data = await apiFetch(API.forecast);
    state.forecast = data.properties.periods;
    renderForecast();
    loadingEl.classList.add("hidden");
    contentEl.classList.remove("hidden");
  } catch (err) {
    loadingEl.innerHTML = `<span class="error-msg">Could not load forecast. ${err.message}</span>`;
  }
}

function renderForecast() {
  const el = document.getElementById("forecast-content");
  const periods = state.forecast;

  // Group into day pairs (daytime + nighttime)
  const days = [];
  for (let i = 0; i < periods.length; i++) {
    const p = periods[i];
    if (p.isDaytime) {
      const night = periods[i + 1];
      days.push({ day: p, night: night || null });
    } else if (i === 0) {
      // First period is tonight
      days.push({ day: null, night: p });
    }
  }

  el.innerHTML = `
    <div class="forecast-list">
      ${days.map((d) => {
        const dayP = d.day;
        const nightP = d.night;
        const label = dayP ? dayP.name : nightP.name;
        const icon = (dayP || nightP).icon;
        const desc = (dayP || nightP).shortForecast;
        const high = dayP ? `${dayP.temperature}°` : "";
        const low = nightP ? `${nightP.temperature}°` : "";
        const detail = dayP?.detailedForecast || nightP?.detailedForecast || "";
        const startTime = (dayP || nightP).startTime;
        const dateStr = formatShortDate(new Date(startTime));

        return `
          <div class="forecast-row" onclick="this.classList.toggle('expanded')">
            <div class="forecast-day">${label}<span class="date">${dateStr}</span></div>
            <img class="forecast-icon" src="${icon}" alt="${desc}">
            <div class="forecast-desc">${desc}</div>
            <div class="forecast-high">${high}</div>
            <div class="forecast-low">${low}</div>
            <div class="forecast-detail-expand">${detail}</div>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

// ---- Hourly Forecast ----
async function loadHourly() {
  const loadingEl = document.getElementById("hourly-loading");
  const contentEl = document.getElementById("hourly-content");

  try {
    const data = await apiFetch(API.hourly);
    state.hourly = data.properties.periods;
    renderHourly();
    loadingEl.classList.add("hidden");
    contentEl.classList.remove("hidden");
  } catch (err) {
    loadingEl.innerHTML = `<span class="error-msg">Could not load hourly forecast. ${err.message}</span>`;
  }
}

function renderHourly() {
  const el = document.getElementById("hourly-content");
  const periods = state.hourly.slice(0, 48); // Next 48 hours

  let lastDay = "";
  let html = '<div class="hourly-scroll">';

  periods.forEach((p, i) => {
    const dt = new Date(p.startTime);
    const dayLabel = dt.toLocaleDateString("en-US", { weekday: "short" });

    // Insert day separator
    if (dayLabel !== lastDay && i > 0) {
      html += `<div class="hourly-day-label">${dayLabel}</div>`;
    }
    lastDay = dayLabel;

    const timeStr = i === 0 ? "Now" : dt.toLocaleTimeString("en-US", { hour: "numeric" });
    const precip = p.probabilityOfPrecipitation?.value;
    const precipStr = precip && precip > 0 ? `${precip}%` : "";
    const windStr = p.windSpeed ? p.windSpeed.replace(/ mph/i, "") : "";

    html += `
      <div class="hourly-item ${i === 0 ? "now" : ""}">
        <span class="hourly-time">${timeStr}</span>
        <img class="hourly-icon" src="${p.icon}" alt="${p.shortForecast}">
        <span class="hourly-temp">${p.temperature}°</span>
        ${precipStr ? `<span class="hourly-precip">${precipStr}</span>` : ""}
        <span class="hourly-wind">${p.windDirection} ${windStr}</span>
      </div>
    `;
  });

  html += "</div>";
  el.innerHTML = html;
}

// ---- Forecast Discussion (AFD) ----
async function loadAFD() {
  const loadingEl = document.getElementById("discussion-loading");
  const contentEl = document.getElementById("discussion-content");

  try {
    // Get the latest AFD product ID first
    const listData = await apiFetch(`${API.afd}`);
    const latestId = listData?.["@graph"]?.[0]?.id;

    let afdData;
    if (latestId) {
      afdData = await apiFetch(`https://api.weather.gov/products/${latestId}`);
    } else {
      // Fallback: try direct latest endpoint
      afdData = await apiFetch(`${API.afd}/latest`);
    }

    state.afd = afdData;
    renderAFD();
    loadingEl.classList.add("hidden");
    contentEl.classList.remove("hidden");
  } catch (err) {
    loadingEl.innerHTML = `<span class="error-msg">Could not load discussion. ${err.message}</span>`;
  }
}

function renderAFD() {
  const el = document.getElementById("discussion-content");
  const afd = state.afd;
  const text = afd.productText || "";
  const issued = afd.issuanceTime ? new Date(afd.issuanceTime) : null;

  // Parse into sections
  const sections = parseAFDSections(text);

  let html = "";

  if (issued) {
    html += `<div class="afd-meta">Issued: ${issued.toLocaleString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
    })}</div>`;
  }

  sections.forEach((section) => {
    const bodyHtml = state.teachingMode
      ? highlightTerms(section.body.trim())
      : escapeHtml(section.body.trim());

    html += `
      <div class="afd-section">
        <div class="afd-section-title">${escapeHtml(section.title)}</div>
        <div class="afd-section-body">${bodyHtml}</div>
      </div>
    `;
  });

  // If no sections parsed, show the raw text
  if (!sections.length) {
    const bodyHtml = state.teachingMode ? highlightTerms(text) : escapeHtml(text);
    html += `<div class="afd-section"><div class="afd-section-body">${bodyHtml}</div></div>`;
  }

  el.innerHTML = html;
}

function parseAFDSections(text) {
  const sections = [];
  // NWS AFD sections typically start with .SECTION_NAME... or .SECTION NAME...
  const sectionRegex = /^\.([\w\s/]+?)\.{2,}/gm;
  const matches = [...text.matchAll(sectionRegex)];

  if (matches.length === 0) return [];

  for (let i = 0; i < matches.length; i++) {
    const title = matches[i][1].trim();
    const startIdx = matches[i].index + matches[i][0].length;
    const endIdx = i + 1 < matches.length ? matches[i + 1].index : text.length;
    const body = text.slice(startIdx, endIdx);

    // Skip the header/boilerplate sections
    const skipTitles = ["NATIONAL WEATHER SERVICE", "AREA FORECAST DISCUSSION"];
    if (skipTitles.some((s) => title.toUpperCase().includes(s))) continue;

    sections.push({ title, body });
  }

  return sections;
}

// ---- Utilities ----
function degreesToCompass(deg) {
  const dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  return dirs[Math.round(deg / 22.5) % 16];
}

function formatTime(date) {
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function formatShortDate(date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
