// ============================================
// NWS Weather — Location-Aware PWA
// Wraps weather.gov for any US location
// ============================================

// ---- Location & Config (resolved dynamically) ----
let loc = {
  lat: null,
  lon: null,
  city: "",
  state: "",
  office: "",
  gridX: 0,
  gridY: 0,
  radarStation: "",
  ready: false,
};

// Fallback: Appleton, WI
const FALLBACK = { lat: 44.2619, lon: -88.4154 };

function apiUrl(path) {
  return `https://api.weather.gov${path}`;
}

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
  initRadar();
  registerSW();
  resolveLocation();
});

// ---- Service Worker ----
function registerSW() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.getRegistrations().then((regs) => {
      regs.forEach((r) => r.unregister());
    }).then(() => {
      navigator.serviceWorker.register("sw.js").catch(() => {});
    });
  }
}

// ---- Geolocation ----
async function resolveLocation() {
  const locationEl = document.querySelector(".location");
  locationEl.textContent = "Detecting location...";

  let lat, lon;

  try {
    const pos = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: false,
        timeout: 8000,
        maximumAge: 300000, // 5 min cache
      });
    });
    lat = pos.coords.latitude;
    lon = pos.coords.longitude;
  } catch (err) {
    console.log("[NWS] Geolocation failed, using fallback:", err.message);
    lat = FALLBACK.lat;
    lon = FALLBACK.lon;
  }

  loc.lat = lat;
  loc.lon = lon;

  // Resolve NWS grid point
  try {
    const pointData = await apiFetch(apiUrl(`/points/${lat.toFixed(4)},${lon.toFixed(4)}`));
    const props = pointData.properties;
    loc.office = props.gridId;
    loc.gridX = props.gridX;
    loc.gridY = props.gridY;
    loc.radarStation = props.radarStation || "";
    loc.city = props.relativeLocation?.properties?.city || "";
    loc.state = props.relativeLocation?.properties?.state || "";
    loc.ready = true;

    locationEl.textContent = loc.city && loc.state ? `${loc.city}, ${loc.state}` : `${lat.toFixed(2)}, ${lon.toFixed(2)}`;

    // Update page title
    if (loc.city) {
      document.title = `${loc.city} Weather`;
      document.querySelector(".app-header h1").textContent = `${loc.city} Weather`;
    }

    // Update discussion subtitle
    const subEl = document.querySelector(".discussion-subtitle");
    if (subEl) subEl.textContent = `NWS ${loc.office} meteorologists`;

    // Update radar subtitle
    const radarSub = document.querySelector(".radar-subtitle");
    if (radarSub) radarSub.textContent = `${loc.radarStation || loc.office} NEXRAD`;

  } catch (err) {
    locationEl.textContent = "Location error. Using defaults.";
    console.error("[NWS] Points API failed:", err);
    // Set Appleton fallback
    loc.office = "GRB";
    loc.gridX = 66;
    loc.gridY = 20;
    loc.lat = FALLBACK.lat;
    loc.lon = FALLBACK.lon;
    loc.ready = true;
  }

  loadAllData();
}

// ---- Tab Navigation ----
let radarLoaded = false;
let afdLoaded = false;

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
      document.getElementById(`panel-${tab.dataset.tab}`).classList.add("active");

      // Lazy-load radar on first tap
      if (tab.dataset.tab === "radar" && !radarLoaded && loc.ready) {
        radarLoaded = true;
        loadRadar();
      }
      // Lazy-load discussion on first tap
      if (tab.dataset.tab === "discussion" && !afdLoaded && loc.ready) {
        afdLoaded = true;
        loadAFD();
      }
    });
  });
}

// ---- Teaching Mode Toggle ----
function initTeachingToggle() {
  const toggle = document.getElementById("teaching-mode");
  toggle.addEventListener("change", () => {
    state.teachingMode = toggle.checked;
    const content = document.getElementById("discussion-content");
    content.classList.toggle("teaching-off", !toggle.checked);
  });
}

// ---- Tooltip ----
function initTooltip() {
  const tooltip = document.getElementById("term-tooltip");
  const overlay = document.getElementById("tooltip-overlay");

  function closeTooltip() {
    tooltip.classList.add("hidden");
    overlay.classList.add("hidden");
  }

  tooltip.querySelector(".tooltip-close").addEventListener("click", closeTooltip);
  overlay.addEventListener("click", closeTooltip);

  document.addEventListener("click", (e) => {
    const termEl = e.target.closest(".term");
    if (!termEl || !state.teachingMode) return;
    const entry = GLOSSARY[termEl.dataset.term];
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
    if (loc.ready) loadAllData();
  });
}

// ---- Data Loading ----
async function apiFetch(url) {
  console.log("[NWS] Fetching:", url);
  const res = await fetch(url);
  if (!res.ok) {
    console.error("[NWS] API error:", res.status, url);
    throw new Error(`API error: ${res.status}`);
  }
  return res.json();
}

async function loadAllData() {
  if (!loc.ready) return;
  const btn = document.getElementById("refresh-btn");
  btn.classList.add("spinning");

  radarLoaded = false;
  afdLoaded = false;
  await Promise.allSettled([
    loadAlerts(),
    loadObservations(),
    loadForecast(),
    loadHourly(),
  ]);

  btn.classList.remove("spinning");
  document.getElementById("last-updated").textContent = `Updated ${formatTime(new Date())}`;
}

// ---- Alerts ----
async function loadAlerts() {
  try {
    const data = await apiFetch(apiUrl(`/alerts/active?point=${loc.lat},${loc.lon}`));
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

  const alertsHtml = state.alerts.map((f, i) => {
    const a = f.properties;
    const severity = a.severity?.toLowerCase() || "warning";
    return `<div class="alert-link severity-${severity}" data-alert-idx="${i}">
      <div class="alert-summary">${a.event}: ${a.headline || a.description?.slice(0, 120) || "Details"}</div>
      <div class="alert-detail hidden" id="alert-detail-${i}">
        ${a.description ? `<p>${a.description}</p>` : ""}
        ${a.instruction ? `<p class="alert-instruction"><strong>What to do:</strong> ${a.instruction}</p>` : ""}
        <p class="alert-meta">
          ${a.senderName ? `Source: ${a.senderName}` : ""}
          ${a.expires ? `<br>Expires: ${new Date(a.expires).toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}` : ""}
        </p>
      </div>
    </div>`;
  }).join("");

  banner.innerHTML = alertsHtml;
  banner.className = "alert-banner";

  banner.querySelectorAll(".alert-link").forEach((el) => {
    el.addEventListener("click", () => {
      const detail = document.getElementById(`alert-detail-${el.dataset.alertIdx}`);
      detail.classList.toggle("hidden");
      el.classList.toggle("expanded");
    });
  });
}

// ---- Observations (Current Conditions) ----
async function loadObservations() {
  const loadingEl = document.getElementById("current-loading");
  const contentEl = document.getElementById("current-content");

  try {
    if (!state.nearestStation) {
      const stationsData = await apiFetch(apiUrl(`/gridpoints/${loc.office}/${loc.gridX},${loc.gridY}/stations`));
      if (stationsData.features?.length) {
        state.nearestStation = stationsData.features[0].properties.stationIdentifier;
      }
    }

    if (!state.nearestStation) throw new Error("No station found");

    const obsData = await apiFetch(apiUrl(`/stations/${state.nearestStation}/observations/latest`));
    state.observations = obsData.properties;

    if (!state.forecast) {
      const fcData = await apiFetch(apiUrl(`/gridpoints/${loc.office}/${loc.gridX},${loc.gridY}/forecast`));
      state.forecast = fcData.properties.periods;
    }

    renderCurrent();
    loadingEl.classList.add("hidden");
    contentEl.classList.remove("hidden");
  } catch (err) {
    loadingEl.innerHTML = `<span class="error-msg">Could not load current conditions. ${err.message}</span>`;
  }
}

function renderTodayForecast() {
  if (!state.forecast?.length) return "";
  const today = state.forecast[0];
  const tonight = state.forecast[1];
  let html = '<div class="today-forecast">';
  if (today) {
    html += `<div class="today-block">
      <div class="today-label">${today.name}</div>
      <div class="today-text">${today.detailedForecast}</div>
    </div>`;
  }
  if (tonight && !tonight.isDaytime) {
    html += `<div class="today-block">
      <div class="today-label">${tonight.name}</div>
      <div class="today-text">${tonight.detailedForecast}</div>
    </div>`;
  }
  html += '</div>';
  return html;
}

function renderMiniHourly() {
  if (!state.hourly?.length) return "";
  const next = state.hourly.slice(0, 8);
  let html = '<div class="mini-hourly"><div class="today-label">Next 8 Hours</div><div class="mini-hourly-row">';
  next.forEach((p, i) => {
    const dt = new Date(p.startTime);
    const timeStr = i === 0 ? "Now" : dt.toLocaleTimeString("en-US", { hour: "numeric" });
    const precip = p.probabilityOfPrecipitation?.value;
    html += `<div class="mini-hour">
      <span class="mini-time">${timeStr}</span>
      <img class="mini-icon" src="${p.icon}" alt="${p.shortForecast}">
      <span class="mini-temp">${p.temperature}°</span>
      ${precip && precip > 0 ? `<span class="mini-precip">${precip}%</span>` : ""}
    </div>`;
  });
  html += '</div></div>';
  return html;
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

  let feelsLike = tempF;
  if (windChill != null) feelsLike = Math.round(windChill * 9 / 5 + 32);
  else if (heatIndex != null) feelsLike = Math.round(heatIndex * 9 / 5 + 32);

  const windDisplay = windMph === 0 ? "Calm" : `${windDir} ${windMph}${gustMph ? ` G ${gustMph}` : ""}`;

  el.innerHTML = `
    <div class="current-hero">
      ${iconUrl ? `<img class="current-icon" src="${iconUrl}" alt="${condition}">` : ""}
      <div class="current-main">
        <div class="current-condition">${condition}</div>
        <div class="current-temp">${tempF}<span class="unit">°F</span></div>
      </div>
      <table class="conditions-table">
        <tr><td>Humidity</td><td>${humidity}%</td></tr>
        <tr><td>Wind Speed</td><td>${windDisplay}</td></tr>
        <tr><td>Barometer</td><td>${pressureInHg} in</td></tr>
      </table>
      <table class="conditions-table">
        <tr><td>Dewpoint</td><td>${dewF}°F</td></tr>
        <tr><td>Visibility</td><td>${visMiles} mi</td></tr>
        <tr><td>Feels Like</td><td>${feelsLike}°F</td></tr>
      </table>
    </div>
    ${renderTodayForecast()}
    ${renderMiniHourly()}
  `;
}

// ---- 7-Day Forecast ----
async function loadForecast() {
  const loadingEl = document.getElementById("forecast-loading");
  const contentEl = document.getElementById("forecast-content");

  try {
    const data = await apiFetch(apiUrl(`/gridpoints/${loc.office}/${loc.gridX},${loc.gridY}/forecast`));
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

  el.innerHTML = `
    <div class="forecast-strip">
      ${periods.map((p) => {
        const isHigh = p.isDaytime;
        const tempLabel = isHigh ? `High: ${p.temperature} °F` : `Low: ${p.temperature} °F`;
        return `
          <div class="forecast-day-col" onclick="this.classList.toggle('expanded')">
            <div class="forecast-period-name">${p.name}</div>
            <img class="forecast-col-icon" src="${p.icon}" alt="${p.shortForecast}">
            <div class="forecast-col-temp ${isHigh ? 'is-high' : 'is-low'}">${tempLabel}</div>
            <div class="forecast-col-desc">${p.shortForecast}</div>
            <div class="forecast-col-detail">${p.detailedForecast}</div>
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
    const data = await apiFetch(apiUrl(`/gridpoints/${loc.office}/${loc.gridX},${loc.gridY}/forecast/hourly`));
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
  const periods = state.hourly.slice(0, 48);

  let lastDay = "";
  let html = '<div class="hourly-scroll">';

  periods.forEach((p, i) => {
    const dt = new Date(p.startTime);
    const dayLabel = dt.toLocaleDateString("en-US", { weekday: "short" });

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
    const listData = await apiFetch(apiUrl(`/products/types/AFD/locations/${loc.office}`));
    const latestId = listData?.["@graph"]?.[0]?.id;

    let afdData;
    if (latestId) {
      afdData = await apiFetch(apiUrl(`/products/${latestId}`));
    } else {
      afdData = await apiFetch(apiUrl(`/products/types/AFD/locations/${loc.office}/latest`));
    }

    state.afd = afdData;
    renderAFD();
    loadingEl.classList.add("hidden");
    contentEl.classList.remove("hidden");
  } catch (err) {
    loadingEl.innerHTML = `<span class="error-msg">Could not load discussion. ${err.message}</span>`;
  }
}

function cleanAFDText(raw) {
  // NWS AFD comes in ALL CAPS with hard wraps at ~68 chars.
  // 1. Unwrap hard line breaks, keep paragraph breaks
  // 2. Convert to sentence case with smart recapitalization
  let text = raw
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")           // normalize excessive breaks
    .replace(/\n\n/g, "{{PARA}}")         // preserve paragraph breaks
    .replace(/([^\n])\n(?!\{)/g, "$1 ")   // unwrap single newlines
    .replace(/ {2,}/g, " ")               // collapse double spaces
    .trim();

  // Sentence case: lowercase, then capitalize sentence starts
  text = text.toLowerCase();
  text = text.replace(/(^|[.?!]\s+)(\w)/g, (_, pre, ch) => pre + ch.toUpperCase());
  // Also capitalize after paragraph markers
  text = text.replace(/(\{\{para\}\}\s*)(\w)/gi, (_, pre, ch) => pre + ch.toUpperCase());

  // Re-capitalize known abbreviations, directions, units, models, offices
  const abbrevs = [
    // NWS offices
    /\bnws\b/g, /\bgrb\b/g, /\bmkx\b/g, /\bdlh\b/g, /\bmpx\b/g, /\barx\b/g,
    // Models
    /\bgfs\b/g, /\bnam\b/g, /\brap\b/g, /\bhrrr\b/g, /\becmwf\b/g, /\beps\b/g,
    /\bgefs\b/g, /\bnbm\b/g, /\bwpc\b/g, /\bspc\b/g, /\bcwa\b/g,
    // Units & time
    /\bmph\b/g, /\bmb\b/g, /\butc\b/g, /\bcdt\b/g, /\bcst\b/g, /\best\b/g,
    /\b(\d+)\s*z\b/g,
    // Compass directions (only when standalone or paired like NNW)
    /\b([nsew]{1,3})\b(?=\s+\d|\s+wind|\s+of\b|\s+flow)/g,
    // States
    /\bwi\b/g, /\bmi\b/g, /\bmn\b/g, /\bia\b/g, /\bil\b/g,
    // Days of week
    /\b(mon|tue|wed|thu|fri|sat|sun)\b/g,
    /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/g,
  ];
  abbrevs.forEach(re => {
    text = text.replace(re, m => m.toUpperCase());
  });

  // Capitalize proper nouns commonly in WI/upper midwest AFDs
  const properNouns = [
    'appleton', 'green bay', 'milwaukee', 'madison', 'oshkosh', 'wausau',
    'fond du lac', 'sheboygan', 'manitowoc', 'fox valley', 'lake michigan',
    'lake winnebago', 'lake superior', 'mississippi', 'wisconsin', 'michigan',
    'minnesota', 'iowa', 'illinois', 'chicago', 'duluth', 'marquette',
    'arctic', 'canada', 'canadian', 'pacific', 'atlantic', 'rockies',
    'great lakes', 'hudson bay',
  ];
  properNouns.forEach(noun => {
    const re = new RegExp('\\b' + noun.replace(/ /g, '\\s+') + '\\b', 'gi');
    text = text.replace(re, m => m.split(/(\s+)/).map(w =>
      /\s/.test(w) ? w : w.charAt(0).toUpperCase() + w.slice(1)
    ).join(''));
  });

  // Restore paragraph breaks (case-insensitive since toLowerCase hit the markers)
  text = text.replace(/\{\{para\}\}/gi, "\n\n");
  return text;
}

function renderAFD() {
  const el = document.getElementById("discussion-content");
  const afd = state.afd;
  const text = afd.productText || "";
  const issued = afd.issuanceTime ? new Date(afd.issuanceTime) : null;
  const sections = parseAFDSections(text);

  let html = "";

  if (issued) {
    html += `<div class="afd-meta">Issued: ${issued.toLocaleString("en-US", {
      weekday: "long", month: "long", day: "numeric",
      hour: "numeric", minute: "2-digit", timeZoneName: "short",
    })}</div>`;
  }

  sections.forEach((section) => {
    const cleaned = cleanAFDText(section.body.trim());
    const bodyHtml = state.teachingMode
      ? highlightTerms(cleaned)
      : escapeHtml(cleaned);
    html += `
      <div class="afd-section">
        <div class="afd-section-title">${escapeHtml(section.title)}</div>
        <div class="afd-section-body">${bodyHtml}</div>
      </div>
    `;
  });

  if (!sections.length) {
    const cleaned = cleanAFDText(text);
    const bodyHtml = state.teachingMode ? highlightTerms(cleaned) : escapeHtml(cleaned);
    html += `<div class="afd-section"><div class="afd-section-body">${bodyHtml}</div></div>`;
  }

  el.innerHTML = html;
}

function parseAFDSections(text) {
  const sections = [];
  const sectionRegex = /^\.([\w\s/]+?)\.{2,}/gm;
  const matches = [...text.matchAll(sectionRegex)];
  if (!matches.length) return [];

  for (let i = 0; i < matches.length; i++) {
    const title = matches[i][1].trim();
    const startIdx = matches[i].index + matches[i][0].length;
    const endIdx = i + 1 < matches.length ? matches[i + 1].index : text.length;
    const body = text.slice(startIdx, endIdx);
    const skipTitles = ["NATIONAL WEATHER SERVICE", "AREA FORECAST DISCUSSION"];
    if (skipTitles.some((s) => title.toUpperCase().includes(s))) continue;
    sections.push({ title, body });
  }
  return sections;
}

// ---- Radar ----
const RADAR_FRAMES = 12;
const RADAR_INTERVAL_MS = 10 * 60 * 1000;
const RADAR_PLAYBACK_SPEED = 500;

let radarState = {
  frames: [],
  currentFrame: 0,
  playing: false,
  playTimer: null,
  zoom: 1.2, // degSpread - smaller = more zoomed in
};

function initRadar() {
  document.getElementById("radar-play").addEventListener("click", toggleRadarPlay);
  document.getElementById("radar-scrubber").addEventListener("input", (e) => {
    stopRadarPlay();
    radarState.currentFrame = parseInt(e.target.value);
    showRadarFrame(radarState.currentFrame);
  });
  document.getElementById("radar-refresh").addEventListener("click", () => {
    stopRadarPlay();
    loadRadar();
  });
  document.getElementById("radar-zoom-in").addEventListener("click", () => {
    radarState.zoom = Math.max(0.3, radarState.zoom - 0.3);
    stopRadarPlay();
    loadRadar();
  });
  document.getElementById("radar-zoom-out").addEventListener("click", () => {
    radarState.zoom = Math.min(3.0, radarState.zoom + 0.3);
    stopRadarPlay();
    loadRadar();
  });
}

function toggleRadarPlay() {
  radarState.playing ? stopRadarPlay() : startRadarPlay();
}

function startRadarPlay() {
  radarState.playing = true;
  document.getElementById("radar-play-icon").classList.add("hidden");
  document.getElementById("radar-pause-icon").classList.remove("hidden");
  if (radarState.currentFrame >= RADAR_FRAMES - 1) {
    radarState.currentFrame = 0;
    showRadarFrame(0);
  }
  radarState.playTimer = setInterval(() => {
    radarState.currentFrame = (radarState.currentFrame + 1) % RADAR_FRAMES;
    showRadarFrame(radarState.currentFrame);
  }, RADAR_PLAYBACK_SPEED);
}

function stopRadarPlay() {
  radarState.playing = false;
  document.getElementById("radar-play-icon").classList.remove("hidden");
  document.getElementById("radar-pause-icon").classList.add("hidden");
  clearInterval(radarState.playTimer);
  radarState.playTimer = null;
}

function showRadarFrame(idx) {
  document.querySelectorAll("#radar-frames-container img").forEach((img, i) => {
    img.classList.toggle("active-frame", i === idx);
  });
  document.getElementById("radar-scrubber").value = idx;
  const frame = radarState.frames[idx];
  if (frame) {
    document.getElementById("radar-time-current").textContent =
      frame.time.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  }
}

function getRadarBbox3857() {
  const degSpread = radarState.zoom;
  const latMin = loc.lat - degSpread * 0.65;
  const latMax = loc.lat + degSpread * 0.65;
  const lonMin = loc.lon - degSpread;
  const lonMax = loc.lon + degSpread;

  const sw = toMercator(latMin, lonMin);
  const ne = toMercator(latMax, lonMax);
  return `${sw[0].toFixed(0)},${sw[1].toFixed(0)},${ne[0].toFixed(0)},${ne[1].toFixed(0)}`;
}

function toMercator(lat, lon) {
  const x = lon * 20037508.34 / 180;
  const y = Math.log(Math.tan((90 + lat) * Math.PI / 360)) * 20037508.34 / Math.PI;
  return [x, y];
}

async function loadRadar() {
  const loadingEl = document.getElementById("radar-loading");
  const mapEl = document.getElementById("radar-map");

  loadingEl.textContent = "";
  loadingEl.classList.remove("hidden");
  mapEl.classList.add("hidden");

  try {
    const bbox3857 = getRadarBbox3857();

    const imgSize = `${Math.round(window.devicePixelRatio * 700)},${Math.round(window.devicePixelRatio * 560)}`;

    // Street basemap with cities, roads, borders
    const basemap = document.getElementById("radar-basemap");
    const baseUrl = `https://services.arcgisonline.com/arcgis/rest/services/World_Street_Map/MapServer/export?bbox=${bbox3857}&bboxSR=3857&imageSR=3857&size=${imgSize}&format=png32&f=image`;
    const basePromise = new Promise((resolve) => {
      basemap.onload = resolve;
      basemap.onerror = resolve;
      basemap.src = baseUrl;
    });

    // Timestamps: last 2 hours, offset 15 min to avoid blank latest frame
    const now = Date.now() - 15 * 60 * 1000;
    const times = [];
    for (let i = 0; i < RADAR_FRAMES; i++) {
      times.push(now - (RADAR_FRAMES - 1 - i) * RADAR_INTERVAL_MS);
    }

    document.getElementById("radar-time-start").textContent =
      new Date(times[0]).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    document.getElementById("radar-time-end").textContent = "Now";

    // Preload frames
    const container = document.getElementById("radar-frames-container");
    container.innerHTML = "";
    radarState.frames = [];

    loadingEl.innerHTML = '<span class="loading">Loading radar frames...</span>';

    const framePromises = times.map((t, i) => {
      return new Promise((resolve) => {
        const img = document.createElement("img");
        img.className = i === RADAR_FRAMES - 1 ? "active-frame" : "";
        img.alt = `Radar frame ${i + 1}`;
        img.src = `https://mapservices.weather.noaa.gov/eventdriven/rest/services/radar/radar_base_reflectivity_time/ImageServer/exportImage?bbox=${bbox3857}&bboxSR=3857&imageSR=3857&size=${imgSize}&format=png32&f=image&time=${t}`;
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        container.appendChild(img);
        radarState.frames.push({ time: new Date(t), img });
      });
    });

    // Reference overlay: city labels, borders, counties on top of radar
    const refImg = document.getElementById("radar-reference");
    const refUrl = `https://services.arcgisonline.com/arcgis/rest/services/Reference/World_Reference_Overlay/MapServer/export?bbox=${bbox3857}&bboxSR=3857&imageSR=3857&size=${imgSize}&format=png32&f=image&transparent=true`;
    const refPromise = new Promise((resolve) => {
      refImg.onload = resolve;
      refImg.onerror = resolve;
      refImg.src = refUrl;
    });

    await Promise.all([basePromise, refPromise, ...framePromises]);

    const scrubber = document.getElementById("radar-scrubber");
    scrubber.max = RADAR_FRAMES - 1;
    radarState.currentFrame = RADAR_FRAMES - 1;
    showRadarFrame(RADAR_FRAMES - 1);

    loadingEl.classList.add("hidden");
    mapEl.classList.remove("hidden");
  } catch (err) {
    console.error("[NWS] Radar error:", err);
    loadingEl.innerHTML = `<span class="error-msg">Could not load radar. ${err.message}</span>`;
  }
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
