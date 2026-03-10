// ============================================
// Fox Valley Weather — Meteorological Glossary
// Terms commonly found in NWS Area Forecast Discussions
// ============================================

const GLOSSARY = {
  // -- Pressure Levels & Upper Air --
  "500mb": {
    term: "500mb (500 millibar level)",
    definition: "A pressure level roughly 18,000 feet up. Meteorologists track winds and weather patterns at this altitude because it's near the middle of the atmosphere. Troughs and ridges at 500mb drive most of our surface weather."
  },
  "700mb": {
    term: "700mb (700 millibar level)",
    definition: "A pressure level around 10,000 feet. Used to analyze moisture (relative humidity here tells you about cloud cover) and temperature advection at mid-levels."
  },
  "850mb": {
    term: "850mb (850 millibar level)",
    definition: "A pressure level around 5,000 feet. Important for tracking temperature advection (warm or cold air moving in), low-level jets, and moisture transport."
  },
  "300mb": {
    term: "300mb (300 millibar level)",
    definition: "A pressure level near 30,000 feet where the jet stream typically flows. Strong winds at this level drive weather systems."
  },
  "250mb": {
    term: "250mb (250 millibar level)",
    definition: "Near the top of the troposphere (~34,000 ft). The jet stream core is often found here. Divergence at this level can trigger storm development below."
  },
  "925mb": {
    term: "925mb (925 millibar level)",
    definition: "A pressure level around 2,500 feet. Used to identify low-level moisture, temperature inversions, and boundary layer features."
  },

  // -- Synoptic Features --
  "trough": {
    term: "Trough",
    definition: "An elongated area of low pressure in the atmosphere, like a valley on a weather map. Troughs bring unsettled weather: clouds, precipitation, and sometimes storms. The air ahead of a trough rises, which helps clouds and rain develop."
  },
  "ridge": {
    term: "Ridge",
    definition: "An elongated area of high pressure, like a mountain on a weather map. Ridges bring fair, dry weather because air sinks within them, suppressing clouds and rain."
  },
  "shortwave": {
    term: "Shortwave (shortwave trough)",
    definition: "A small-scale trough embedded in the larger flow, typically 200-500 miles across. Shortwaves are the trigger for individual storm systems. They move through the larger pattern, causing brief rounds of clouds or precipitation."
  },
  "longwave": {
    term: "Longwave (longwave trough/ridge)",
    definition: "A large-scale pattern in the atmosphere spanning 1,000+ miles. Longwave troughs can persist for days or weeks and set the overall weather regime (e.g., cold and stormy vs. warm and dry)."
  },
  "closed low": {
    term: "Closed Low",
    definition: "A low-pressure center where the circulation is completely enclosed by at least one contour line. These move slowly and can bring extended periods of unsettled weather."
  },
  "cut-off low": {
    term: "Cut-off Low",
    definition: "A closed low that has been pinched off from the main jet stream flow. These can stall for days, bringing prolonged clouds, cool temps, and rain to one area."
  },
  "vort max": {
    term: "Vorticity Maximum (Vort Max)",
    definition: "A concentrated area of spin in the atmosphere. These rotating pockets of air, embedded in troughs, help trigger and intensify storms as they move along."
  },
  "vorticity": {
    term: "Vorticity",
    definition: "A measure of the spin or rotation in the atmosphere. Positive vorticity (counterclockwise spin in the Northern Hemisphere) is associated with rising air and storm development."
  },

  // -- Advection --
  "caa": {
    term: "CAA (Cold Air Advection)",
    definition: "Wind blowing colder air into a region. On weather maps, you see this when wind arrows cross temperature lines from cold to warm. CAA brings falling temperatures."
  },
  "waa": {
    term: "WAA (Warm Air Advection)",
    definition: "Wind blowing warmer air into a region. WAA brings rising temperatures and is also a lifting mechanism that can produce clouds and precipitation, since warm air riding over cooler air is forced to rise."
  },
  "advection": {
    term: "Advection",
    definition: "The horizontal transport of something (heat, moisture, vorticity) by the wind. 'Temperature advection' means the wind is carrying air of a different temperature into your area."
  },
  "moisture advection": {
    term: "Moisture Advection",
    definition: "Wind transporting humid air into a region. Strong moisture advection feeds precipitation and can increase cloud cover and humidity ahead of a storm system."
  },
  "isentropic": {
    term: "Isentropic",
    definition: "Relates to surfaces of equal entropy (potential temperature). Isentropic lift occurs when air flows upward along these tilted surfaces, often producing widespread clouds and light precipitation ahead of warm fronts."
  },

  // -- Fronts & Boundaries --
  "cold front": {
    term: "Cold Front",
    definition: "The leading edge of a colder air mass replacing warmer air. Cold fronts often bring a sharp temperature drop, wind shift, and a line of showers or thunderstorms. Weather usually clears quickly after passage."
  },
  "warm front": {
    term: "Warm Front",
    definition: "The leading edge of warmer air advancing over cooler air. Warm fronts bring gradual warming, increasing clouds, and often prolonged light to moderate precipitation as the warm air rides up and over the cooler air."
  },
  "occluded front": {
    term: "Occluded Front",
    definition: "Forms when a cold front catches up to a warm front. The warm air gets lifted entirely off the surface. Occluded fronts can bring a mix of weather types and are often found near the center of mature low-pressure systems."
  },
  "stationary front": {
    term: "Stationary Front",
    definition: "A boundary between air masses that isn't moving much. Can bring prolonged clouds and precipitation to areas near the front for days."
  },
  "dryline": {
    term: "Dryline",
    definition: "A boundary separating moist air from dry air. Common in the Plains states, drylines can trigger severe thunderstorms when moist air is forced to rise along them."
  },
  "outflow boundary": {
    term: "Outflow Boundary",
    definition: "A surface boundary left behind by the cool air flowing out of a thunderstorm. These can act as mini cold fronts and trigger new storms when they collide with warm, moist air."
  },

  // -- Stability & Instability --
  "cape": {
    term: "CAPE (Convective Available Potential Energy)",
    definition: "A measure of atmospheric instability, in Joules per kilogram. The higher the CAPE, the more energy available for thunderstorms. 0-1000 = weak instability, 1000-2500 = moderate, 2500+ = strong. High CAPE means taller, more intense storms are possible."
  },
  "cin": {
    term: "CIN (Convective Inhibition)",
    definition: "Energy that suppresses thunderstorm development, like a cap or lid on the atmosphere. Some CIN can actually make storms worse, because it allows energy to build up before being released explosively."
  },
  "lapse rate": {
    term: "Lapse Rate",
    definition: "How fast temperature decreases with altitude. Steep lapse rates (temperature drops rapidly as you go up) mean the atmosphere is unstable and supports strong updrafts. Average is about 3.5F per 1,000 feet."
  },
  "inversion": {
    term: "Inversion (Temperature Inversion)",
    definition: "A layer where temperature increases with altitude instead of decreasing. Inversions act as lids that trap pollution, fog, and moisture near the surface and suppress thunderstorm development."
  },
  "cap": {
    term: "Cap (Capping Inversion)",
    definition: "A warm layer aloft that prevents air from rising freely. The cap must be 'broken' for thunderstorms to develop. A strong cap on a high-energy day can lead to explosive storm development if something finally breaks through."
  },
  "lifted index": {
    term: "Lifted Index (LI)",
    definition: "A stability measure. Negative values mean instability (air wants to keep rising). -3 to -5 = moderate instability, below -6 = very unstable. Positive values mean stable air."
  },

  // -- Precipitation & Convection --
  "qpf": {
    term: "QPF (Quantitative Precipitation Forecast)",
    definition: "The forecasted amount of liquid precipitation (rain or melted snow) for a given period, measured in inches. If QPF is 0.50\", expect about half an inch of rain (or roughly 5\" of snow in winter)."
  },
  "pop": {
    term: "PoP (Probability of Precipitation)",
    definition: "The chance that any point in the forecast area will receive measurable precipitation (0.01\" or more). A 40% PoP means there's a 4-in-10 chance you'll see rain at your location."
  },
  "convection": {
    term: "Convection",
    definition: "Vertical air movement driven by heating. In weather, 'convection' usually means thunderstorms. 'Convective outlook' = thunderstorm forecast. The air rises because it's warmer (and lighter) than surrounding air."
  },
  "mesoscale": {
    term: "Mesoscale",
    definition: "The middle scale of weather phenomena, roughly 2-200 miles across. Thunderstorm clusters, sea breezes, and lake-effect snow are mesoscale features. Bigger than a single storm, smaller than a frontal system."
  },
  "synoptic": {
    term: "Synoptic (Synoptic Scale)",
    definition: "The large scale of weather, 200-2000+ miles. High and low pressure systems, fronts, and the jet stream are synoptic features. This is the scale you see on a national weather map."
  },
  "mcs": {
    term: "MCS (Mesoscale Convective System)",
    definition: "An organized complex of thunderstorms that persists for hours and covers a large area (100+ miles). MCSs can produce widespread damaging winds, heavy rain, and flooding."
  },
  "elevated convection": {
    term: "Elevated Convection",
    definition: "Thunderstorms that develop above a surface stable layer rather than from surface-based heating. These can occur at night and produce heavy rain and small hail, even when surface temperatures are cool."
  },
  "sfc based": {
    term: "Surface-Based (Convection)",
    definition: "Storms rooted at the surface, fed by the warmest, most unstable air near the ground. Surface-based storms tend to be stronger and more capable of producing severe weather."
  },

  // -- Wind & Jet Stream --
  "jet stream": {
    term: "Jet Stream",
    definition: "A river of fast-moving air at high altitude (25,000-35,000 feet), typically 100-200 mph. The jet stream steers weather systems and separates cold polar air from warm subtropical air. Wisconsin sits near the jet stream battleground."
  },
  "jet streak": {
    term: "Jet Streak",
    definition: "An area of especially fast winds within the jet stream, often 120+ mph. The entrance and exit regions of jet streaks create rising and sinking air, which can trigger or suppress storms at the surface below."
  },
  "low level jet": {
    term: "Low-Level Jet (LLJ)",
    definition: "A fast ribbon of wind at 3,000-5,000 feet altitude, typically from the south overnight in the Midwest. The LLJ transports warm, moist air northward and is a key ingredient for nighttime thunderstorms and severe weather."
  },
  "wind shear": {
    term: "Wind Shear",
    definition: "A change in wind speed or direction over a short distance. Vertical wind shear (winds changing with altitude) helps thunderstorms organize and persist. Strong shear with high instability = severe storm potential."
  },
  "veering": {
    term: "Veering Winds",
    definition: "Winds that shift clockwise with height (e.g., south at the surface, southwest at 5,000 ft, west at 15,000 ft). Veering winds indicate warm air advection and provide the spin environment for supercell thunderstorms."
  },
  "backing": {
    term: "Backing Winds",
    definition: "Winds that shift counterclockwise with height. Backing winds indicate cold air advection and a less favorable environment for organized severe storms."
  },
  "zonal": {
    term: "Zonal Flow",
    definition: "When the jet stream blows mostly west-to-east in a straight line. Zonal flow means weather systems move through quickly and temperatures stay relatively moderate. The opposite of a high-amplitude pattern."
  },
  "meridional": {
    term: "Meridional Flow",
    definition: "When the jet stream takes big north-south swings (high-amplitude waves). Meridional flow brings temperature extremes: deep troughs plunge cold air south, while ridges pump warm air north."
  },
  "omega block": {
    term: "Omega Block",
    definition: "A large-scale atmospheric pattern shaped like the Greek letter omega. A ridge flanked by two troughs. These patterns are very persistent, causing extended periods of the same weather (often dry and warm under the ridge)."
  },

  // -- Models & Tools --
  "gfs": {
    term: "GFS (Global Forecast System)",
    definition: "The main American global weather model, run by NOAA. Produces forecasts out to 16 days. Good at large-scale patterns but can struggle with details. Updated 4 times daily."
  },
  "nam": {
    term: "NAM (North American Mesoscale Model)",
    definition: "A regional weather model covering North America with higher resolution than the GFS. Better at resolving small-scale features like thunderstorm clusters and terrain effects. Best within 2-3 days."
  },
  "ecmwf": {
    term: "ECMWF (European Model / 'The Euro')",
    definition: "The European Centre for Medium-Range Weather Forecasts model. Generally considered the best global model, especially for medium-range (3-10 day) forecasts. Often referenced as 'the Euro' by forecasters."
  },
  "hrrr": {
    term: "HRRR (High-Resolution Rapid Refresh)",
    definition: "A high-resolution model updated every hour, covering the continental US at 3km grid spacing. Excellent for short-range (0-18 hour) forecasts of precipitation, thunderstorms, and aviation weather."
  },
  "rap": {
    term: "RAP (Rapid Refresh)",
    definition: "A regional model updated hourly at 13km resolution. The parent model of the HRRR. Good for 0-21 hour forecasts, especially for aviation and rapidly changing weather."
  },
  "mos": {
    term: "MOS (Model Output Statistics)",
    definition: "A statistical technique that corrects raw model output using historical relationships between model forecasts and actual observations. MOS temperatures and precipitation are often more accurate than raw model values."
  },
  "ensemble": {
    term: "Ensemble (Ensemble Forecast)",
    definition: "Running a weather model many times with slightly different starting conditions. If most runs agree, confidence is high. If they diverge widely, the forecast is uncertain. Spread in the ensemble = forecast uncertainty."
  },
  "deterministic": {
    term: "Deterministic (Model Run)",
    definition: "A single, high-resolution model run as opposed to an ensemble. The 'operational' GFS or NAM is deterministic. More detailed but gives only one answer, so it can't tell you about forecast confidence."
  },
  "blend": {
    term: "NBM / NWS Blend",
    definition: "The National Blend of Models. Combines output from multiple models (GFS, NAM, ECMWF, etc.) into a single 'best' forecast. NWS forecasters often start with the Blend and adjust from there."
  },

  // -- Winter Weather --
  "freezing rain": {
    term: "Freezing Rain",
    definition: "Rain that falls as liquid but freezes on contact with surfaces at or below 32F. Creates a glaze of ice. Requires a specific temperature profile: warm layer aloft (melts snow to rain) with subfreezing air at the surface."
  },
  "sleet": {
    term: "Sleet (Ice Pellets)",
    definition: "Precipitation that melts aloft then refreezes into ice pellets before reaching the ground. You can hear sleet bouncing off surfaces. It means there's a warm layer aloft, but with enough cold air below to refreeze the drops."
  },
  "snow ratio": {
    term: "Snow Ratio",
    definition: "How many inches of snow you get per inch of liquid water. Average is 10:1 (one inch of rain = 10 inches of snow). Cold, dry snow can be 15:1 or 20:1 (fluffy). Warm, wet snow can be 5:1 (heavy, packable)."
  },
  "lake effect": {
    term: "Lake Effect (Snow/Rain)",
    definition: "Precipitation caused by cold air moving over the relatively warmer Great Lakes. The lake adds warmth and moisture to the air, creating clouds and snow bands downwind. The Fox Valley can see lake effect from Lake Michigan."
  },
  "dendritic growth zone": {
    term: "Dendritic Growth Zone (DGZ)",
    definition: "The temperature layer (roughly -12C to -18C) where snow crystals grow most efficiently into the classic six-armed snowflake shape. Heavy snow often occurs when this zone aligns with a region of strong lift."
  },
  "wintry mix": {
    term: "Wintry Mix",
    definition: "A combination of snow, sleet, and/or freezing rain occurring at the same time. Happens when the temperature profile is near the rain-snow boundary, with layers hovering around freezing."
  },

  // -- Moisture & Clouds --
  "dewpoint": {
    term: "Dewpoint",
    definition: "The temperature the air must cool to for moisture to condense. A better measure of humidity than relative humidity. Dewpoints above 65F feel muggy, above 70F = oppressive. Below 40F = very dry."
  },
  "rh": {
    term: "RH (Relative Humidity)",
    definition: "The percentage of moisture in the air compared to how much it could hold at that temperature. 100% RH means the air is saturated (fog, clouds, or rain). This number changes with temperature even if actual moisture doesn't."
  },
  "precipitable water": {
    term: "Precipitable Water (PWAT)",
    definition: "If you squeezed ALL the moisture out of a column of air above you, this is how much liquid you'd get. Measured in inches. High PWAT (1.5\"+ in winter, 2\"+ in summer) means there's lots of moisture available for heavy precipitation."
  },
  "theta-e": {
    term: "Theta-e (Equivalent Potential Temperature)",
    definition: "A single number that combines temperature AND moisture content of the air. Higher theta-e = warmer and more humid. Meteorologists use theta-e to track air masses and find boundaries between different air types."
  },
  "subsidence": {
    term: "Subsidence",
    definition: "Large-scale sinking of air, typically under high-pressure systems. Sinking air warms and dries, suppressing clouds and precipitation. Subsidence inversions trap pollution near the surface."
  },
  "convergence": {
    term: "Convergence",
    definition: "Air flowing together at a given level. Surface convergence forces air upward, which can trigger clouds and storms. Like squeezing a tube of toothpaste: if air piles in horizontally, it has to go somewhere, so it rises."
  },
  "divergence": {
    term: "Divergence",
    definition: "Air spreading apart at a given level. Upper-level divergence removes air from above, causing surface pressure to fall and air below to rise. This is a key trigger for storm development."
  },
  "omega": {
    term: "Omega (Vertical Velocity)",
    definition: "The rate of vertical air motion, measured in microbars per second. Negative omega = rising air (good for storms). Positive omega = sinking air (suppresses weather). Named after the Greek letter used in the equations."
  },

  // -- Severe Weather --
  "supercell": {
    term: "Supercell",
    definition: "A long-lived, rotating thunderstorm. The most dangerous storm type, capable of producing large hail, damaging winds, and tornadoes. Identified by a persistent rotating updraft called a mesocyclone."
  },
  "mesocyclone": {
    term: "Mesocyclone",
    definition: "A rotating updraft within a supercell thunderstorm, typically 2-6 miles across. Detected on radar as a velocity couplet. Mesocyclones can tighten and produce tornadoes."
  },
  "derecho": {
    term: "Derecho",
    definition: "A widespread, long-lived windstorm associated with a line of severe thunderstorms. Must produce damage over a 250+ mile path. Derechos can bring 70-100+ mph winds across hundreds of miles."
  },
  "bow echo": {
    term: "Bow Echo",
    definition: "A curved, bow-shaped line of storms on radar. The bulging center is driven by strong rear-inflow winds. Bow echoes are associated with damaging straight-line winds and occasionally tornadoes at the edges."
  },
  "squall line": {
    term: "Squall Line",
    definition: "A long, narrow band of thunderstorms, often hundreds of miles long. Squall lines typically form ahead of cold fronts and can produce damaging winds, heavy rain, and brief tornadoes."
  },
  "spc": {
    term: "SPC (Storm Prediction Center)",
    definition: "The national center in Norman, Oklahoma that issues thunderstorm and tornado outlooks, watches, and mesoscale discussions. They assess severe weather risk on a 1-5 scale (Marginal, Slight, Enhanced, Moderate, High)."
  },
  "wpc": {
    term: "WPC (Weather Prediction Center)",
    definition: "The national center that handles large-scale precipitation forecasts, winter weather, and excessive rainfall outlooks. Provides the QPF and surface analysis that local NWS offices build on."
  },

  // -- Fog & Visibility --
  "radiation fog": {
    term: "Radiation Fog",
    definition: "Fog that forms on clear, calm nights when the ground loses heat by radiation, cooling the air near the surface to its dewpoint. Common in valleys and low spots. Burns off after sunrise."
  },
  "advection fog": {
    term: "Advection Fog",
    definition: "Fog that forms when warm, moist air moves over a cooler surface. Common near the Great Lakes in spring when warm air flows over cold lake water."
  },

  // -- Aviation Terms (common in AFDs) --
  "ifr": {
    term: "IFR (Instrument Flight Rules)",
    definition: "Weather conditions requiring pilots to fly by instruments only: ceiling below 1,000 feet and/or visibility below 3 miles. When the AFD mentions IFR conditions, expect low clouds and/or fog."
  },
  "vfr": {
    term: "VFR (Visual Flight Rules)",
    definition: "Good flying weather: ceiling above 3,000 feet and visibility above 5 miles. When the AFD says VFR, conditions are clear enough for pilots to navigate visually."
  },
  "mvfr": {
    term: "MVFR (Marginal Visual Flight Rules)",
    definition: "Borderline flying weather: ceiling 1,000-3,000 feet and/or visibility 3-5 miles. Not great, not terrible. Light rain, haze, or scattered low clouds."
  },

  // -- Misc Jargon --
  "climo": {
    term: "Climo (Climatology)",
    definition: "The long-term average weather for a given date and location. When forecasters say 'above/below climo,' they mean warmer/cooler or wetter/drier than the historical normal."
  },
  "anomaly": {
    term: "Anomaly",
    definition: "How far a value deviates from the long-term average. A +10F temperature anomaly means it's 10 degrees warmer than normal. Large anomalies often signal unusual or extreme weather patterns."
  },
  "baroclinic": {
    term: "Baroclinic",
    definition: "An atmosphere where temperature varies significantly over horizontal distance (temperature gradients). Most active weather occurs in baroclinic zones. A baroclinic leaf on satellite imagery is a developing storm."
  },
  "barotropic": {
    term: "Barotropic",
    definition: "An atmosphere with little horizontal temperature variation. Barotropic environments are less dynamic, with weaker fronts and less organized precipitation."
  },
  "diurnal": {
    term: "Diurnal",
    definition: "Relating to the daily cycle. 'Diurnal heating' = daytime warming from the sun. Many weather phenomena follow a diurnal cycle: thunderstorms peak in the afternoon, fog forms overnight, winds pick up after noon."
  },
  "downslope": {
    term: "Downslope",
    definition: "Wind flowing down a slope or terrain. Downslope winds warm and dry as they descend (compressed by higher pressure at lower elevations). Can cause dramatic warming on the lee side of mountains."
  },
  "upslope": {
    term: "Upslope",
    definition: "Wind flowing up a slope. Upslope flow cools the air as it rises, often producing clouds and precipitation on the windward side of terrain."
  },
  "lee": {
    term: "Lee (Leeward)",
    definition: "The downwind side of an obstacle (mountain, building, etc.). The 'lee side' is sheltered from the wind and often drier due to the rain shadow effect."
  },
  "fetch": {
    term: "Fetch",
    definition: "The distance wind travels over open water. Longer fetch = bigger waves and more moisture pickup. Important for lake effect snow: a long fetch over Lake Michigan means more moisture and heavier snow bands."
  },
  "forcing": {
    term: "Forcing (Dynamic/Synoptic Forcing)",
    definition: "Large-scale atmospheric mechanisms that cause air to rise. Jet streaks, vorticity advection, fronts, and upper-level divergence are all 'forcing mechanisms.' More forcing = better chance of precipitation."
  },
  "return flow": {
    term: "Return Flow",
    definition: "Southerly winds returning warm, moist air from the Gulf of Mexico after a cold spell. A sign that temperatures will moderate and moisture will increase."
  },
  "boundary layer": {
    term: "Boundary Layer",
    definition: "The lowest layer of the atmosphere (roughly the bottom 3,000-6,000 feet) directly influenced by the Earth's surface. Temperature, moisture, and wind in the boundary layer change dramatically between day and night."
  },
  "upper-level": {
    term: "Upper-Level",
    definition: "Generally referring to the atmosphere above 18,000 feet (500mb and above). 'Upper-level disturbance' = a trough or vorticity feature at high altitude that can trigger weather at the surface."
  },
  "surface low": {
    term: "Surface Low",
    definition: "A center of low atmospheric pressure at ground level. Air converges and rises around a surface low, producing clouds, precipitation, and often windy conditions. Low pressure systems are the weather-makers."
  },
  "surface high": {
    term: "Surface High",
    definition: "A center of high atmospheric pressure at ground level. Air sinks and spreads outward, bringing clear skies, calm winds, and generally fair weather."
  },
  "cyclogenesis": {
    term: "Cyclogenesis",
    definition: "The development or intensification of a low-pressure system. Rapid cyclogenesis (a 'bomb cyclone') means pressure drops at least 24mb in 24 hours. These bring strong winds and heavy precipitation."
  },
  "anticyclone": {
    term: "Anticyclone",
    definition: "A high-pressure system with clockwise (Northern Hemisphere) wind circulation. Brings fair, settled weather. Strong anticyclones can block storm systems from moving through."
  }
};

// Build a sorted list of term keys by length (longest first) to prevent partial matches
const GLOSSARY_KEYS = Object.keys(GLOSSARY).sort((a, b) => b.length - a.length);

/**
 * Highlight glossary terms in a text string.
 * Returns HTML with <span class="term"> wrappers.
 */
function highlightTerms(text) {
  if (!text) return "";

  // Build regex pattern: match whole words/abbreviations, case-insensitive
  // We process the text in one pass to avoid nested replacements
  const patterns = GLOSSARY_KEYS.map(key => {
    // For abbreviations (all caps, 2-4 letters), match exact case
    if (/^[A-Z]{2,5}$/.test(key.toUpperCase()) && key === key.toLowerCase()) {
      return `\\b${escapeRegex(key)}\\b`;
    }
    return `\\b${escapeRegex(key)}\\b`;
  });

  const combinedRegex = new RegExp(`(${patterns.join("|")})`, "gi");

  // Split text into segments: matched terms and non-matched text
  let result = "";
  let lastIndex = 0;
  let match;

  combinedRegex.lastIndex = 0;
  while ((match = combinedRegex.exec(text)) !== null) {
    const matchedText = match[0];
    const matchStart = match.index;

    // Find the glossary key (case-insensitive)
    const termKey = GLOSSARY_KEYS.find(
      k => k.toLowerCase() === matchedText.toLowerCase()
    );

    if (termKey) {
      // Add text before this match
      result += escapeHtml(text.slice(lastIndex, matchStart));
      // Add the highlighted term
      result += `<span class="term" data-term="${termKey}">${escapeHtml(matchedText)}</span>`;
      lastIndex = matchStart + matchedText.length;
    }
  }

  // Add remaining text
  result += escapeHtml(text.slice(lastIndex));

  return result;
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
