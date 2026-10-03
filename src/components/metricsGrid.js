/**
 * Weather Metrics Grid Component (UV Ring, Wind Compass, Sun Arc, Humidity, AQI, Pressure, Visibility)
 */
import {
  formatWindSpeed,
  formatPressure,
  formatVisibility,
  getWindDirection,
  getUVInfo,
  getAQIInfo,
  formatTime,
  formatTemp,
} from '../utils/formatters.js';

export function renderMetricsGrid(container, { weather, airQuality, unit, is24h }) {
  if (!weather || !weather.current) {
    container.innerHTML = `<div class="glass-card loading-skeleton">Loading weather metrics...</div>`;
    return;
  }

  const current = weather.current;
  const daily = weather.daily || {};

  // 1. Current Context-Aware UV Index
  let closestIdx = 0;
  if (weather.hourly && weather.hourly.time) {
    const nowTime = new Date(current.time).getTime();
    let minDiff = Infinity;
    for (let i = 0; i < weather.hourly.time.length; i++) {
      const diff = Math.abs(new Date(weather.hourly.time[i]).getTime() - nowTime);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = i;
      }
    }
  }

  const todayMaxUV = daily.uv_index_max && daily.uv_index_max.length > 0 ? daily.uv_index_max[0] : 0;
  let currentUV = 0;
  if (current.is_day) {
    currentUV = weather.hourly && weather.hourly.uv_index ? (weather.hourly.uv_index[closestIdx] || 0) : todayMaxUV;
    // Suppress UV under heavy overcast, mist, or rain
    if (current.weather_code >= 50 || current.weather_code === 3 || current.weather_code === 10) {
      currentUV = Math.min(currentUV, 1.2);
    } else if (current.cloud_cover && current.cloud_cover > 70) {
      currentUV = Math.min(currentUV, 2.8);
    }
  }
  const uvInfo = getUVInfo(currentUV);

  // 2. Wind
  const windSpeedDisplay = formatWindSpeed(current.wind_speed_10m, unit);
  const gustSpeedDisplay = formatWindSpeed(current.wind_gusts_10m || current.wind_speed_10m * 1.25, unit);
  const windDir = current.wind_direction_10m || 0;
  const windCardinal = getWindDirection(windDir);

  // 3. Humidity & Dew Point
  const humidity = current.relative_humidity_2m || 0;
  const dewPoint = weather.hourly && weather.hourly.dew_point_2m ? weather.hourly.dew_point_2m[0] : current.temperature_2m - 5;
  const dewPointDisplay = formatTemp(dewPoint, unit);
  let humidityComfort = 'Optimal';
  if (humidity < 30) humidityComfort = 'Dry & Crisp';
  else if (humidity > 70) humidityComfort = 'Muggy & Humid';
  else if (humidity > 55) humidityComfort = 'Pleasantly Moist';

  // 4. Sunrise & Sunset with Solar Arc Calculation
  const sunriseISO = daily.sunrise && daily.sunrise.length > 0 ? daily.sunrise[0] : null;
  const sunsetISO = daily.sunset && daily.sunset.length > 0 ? daily.sunset[0] : null;
  const sunriseDisplay = formatTime(sunriseISO, weather.timezone, is24h);
  const sunsetDisplay = formatTime(sunsetISO, weather.timezone, is24h);

  // Calculate Sun arc position percentage (0 to 100)
  let solarPercent = 50;
  let sunPhaseText = 'Daylight active';
  if (sunriseISO && sunsetISO) {
    const now = new Date(current.time).getTime();
    const rise = new Date(sunriseISO).getTime();
    const set = new Date(sunsetISO).getTime();

    if (now < rise) {
      solarPercent = 0;
      sunPhaseText = 'Before sunrise';
    } else if (now > set) {
      solarPercent = 100;
      sunPhaseText = 'Nighttime';
    } else {
      solarPercent = Math.max(0, Math.min(100, ((now - rise) / (set - rise)) * 100));
      const hoursRemaining = Math.max(0, (set - now) / 3600000).toFixed(1);
      sunPhaseText = `${hoursRemaining}h daylight remaining`;
    }
  }

  // Calculate sun disc coordinates on arc (SVG width 180, height 80, arc from (15, 70) through (90, 15) to (165, 70))
  const arcAngle = Math.PI * (1 - solarPercent / 100);
  const sunX = 90 - 75 * Math.cos(arcAngle);
  const sunY = 75 - 55 * Math.sin(arcAngle);

  // 5. Air Quality (AQI)
  const aqiVal = airQuality && airQuality.us_aqi !== undefined ? airQuality.us_aqi : 28;
  const aqiInfo = getAQIInfo(aqiVal);
  const pm25 = airQuality && airQuality.pm2_5 ? airQuality.pm2_5.toFixed(1) : '5.2';
  const pm10 = airQuality && airQuality.pm10 ? airQuality.pm10.toFixed(1) : '10.8';

  // 6. Barometric Pressure
  const pressureVal = current.pressure_msl || current.surface_pressure || 1013;
  const pressureDisplay = formatPressure(pressureVal, unit);
  let pressureTrend = 'Normal';
  if (pressureVal > 1020) pressureTrend = 'High Pressure (Fair)';
  else if (pressureVal < 1005) pressureTrend = 'Low Pressure (Stormy)';

  // 7. Visibility
  // Hourly visibility from Open-Meteo is in meters
  const visibilityMeters = weather.hourly && weather.hourly.visibility ? weather.hourly.visibility[0] : 10000;
  const visibilityDisplay = formatVisibility(visibilityMeters, unit);
  let visibilityDesc = 'Crystal clear';
  if (visibilityMeters < 1000) visibilityDesc = 'Dense fog';
  else if (visibilityMeters < 4000) visibilityDesc = 'Haze or mist';
  else if (visibilityMeters < 8000) visibilityDesc = 'Moderate clarity';

  container.innerHTML = `
    <div class="metrics-grid">
      <!-- 1. UV INDEX CARD -->
      <div class="glass-card metric-card uv-card">
        <div class="metric-card-header">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
          <span class="metric-title">UV Index</span>
        </div>
        <div class="uv-metric-body">
          <div class="uv-ring-wrapper">
            <svg class="uv-circular-gauge" viewBox="0 0 100 100" width="80" height="80">
              <circle class="gauge-bg" cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.12)" stroke-width="8" fill="none" />
              <circle
                class="gauge-fill"
                cx="50"
                cy="50"
                r="40"
                stroke="${uvInfo.color}"
                stroke-width="8"
                fill="none"
                stroke-linecap="round"
                stroke-dasharray="251.2"
                stroke-dashoffset="${251.2 * (1 - uvInfo.percentage / 100)}"
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div class="uv-score-center">
              <span class="uv-val">${currentUV.toFixed(1)}</span>
            </div>
          </div>
          <div class="uv-info-column">
            <span class="uv-level-badge" style="background-color: ${uvInfo.color}25; color: ${uvInfo.color}; border: 1px solid ${uvInfo.color}50;">
              ${uvInfo.level}
            </span>
            <p class="uv-desc">${uvInfo.description}</p>
            <span class="uv-max-sub" style="font-size: 0.75rem; color: var(--text-muted); opacity: 0.85;">Daily Peak: ${todayMaxUV.toFixed(0)} UV</span>
          </div>
        </div>
      </div>

      <!-- 2. WIND CARD -->
      <div class="glass-card metric-card wind-card">
        <div class="metric-card-header">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/></svg>
          <span class="metric-title">Wind & Gusts</span>
        </div>
        <div class="wind-metric-body">
          <div class="compass-dial">
            <div class="compass-circle">
              <span class="compass-marker marker-n">N</span>
              <span class="compass-marker marker-e">E</span>
              <span class="compass-marker marker-s">S</span>
              <span class="compass-marker marker-w">W</span>
              <div class="compass-needle" style="transform: rotate(${windDir}deg);">
                <div class="needle-arrow"></div>
              </div>
              <div class="compass-pivot"></div>
            </div>
          </div>
          <div class="wind-details-column">
            <div class="wind-speed-main">
              <span class="wind-num">${windSpeedDisplay}</span>
              <span class="wind-dir-tag">${windCardinal} (${windDir}°)</span>
            </div>
            <div class="wind-gust-sub">
              <span>Gusts: <strong>${gustSpeedDisplay}</strong></span>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. SUNRISE & SUNSET CARD -->
      <div class="glass-card metric-card sun-card">
        <div class="metric-card-header">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2m-7.07-14.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2m-14.93 7.07l1.41-1.41m11.32-11.32l1.41-1.41"/></svg>
          <span class="metric-title">Sun & Daylight</span>
        </div>
        <div class="sun-arc-container">
          <svg class="sun-arc-svg" viewBox="0 0 180 85" width="100%">
            <!-- Horizon line -->
            <line x1="10" y1="75" x2="170" y2="75" stroke="rgba(255,255,255,0.2)" stroke-width="1.5" stroke-dasharray="3,3" />
            <!-- Sunlight arc path -->
            <path d="M 15 75 Q 90 10 165 75" fill="none" stroke="rgba(255, 222, 67, 0.3)" stroke-width="3" stroke-dasharray="4,4" />
            <!-- Active daylight filled path -->
            <path d="M 15 75 Q 90 10 165 75" fill="none" stroke="url(#sunArcGrad)" stroke-width="3.5" />
            <!-- Sun circle icon at position -->
            <circle cx="${sunX}" cy="${sunY}" r="7" fill="#FDE047" stroke="#EA580C" stroke-width="2" filter="drop-shadow(0 0 6px #FDE047)" />
            <defs>
              <linearGradient id="sunArcGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stop-color="#F97316" />
                <stop offset="50%" stop-color="#FBBF24" />
                <stop offset="100%" stop-color="#F43F5E" />
              </linearGradient>
            </defs>
          </svg>
          <div class="sun-times-row">
            <div class="sun-time-block">
              <span class="sub-label">Sunrise</span>
              <strong class="time-text">${sunriseDisplay}</strong>
            </div>
            <div class="sun-phase-pill">${sunPhaseText}</div>
            <div class="sun-time-block right">
              <span class="sub-label">Sunset</span>
              <strong class="time-text">${sunsetDisplay}</strong>
            </div>
          </div>
        </div>
      </div>

      <!-- 4. AIR QUALITY INDEX (AQI) CARD -->
      <div class="glass-card metric-card aqi-card">
        <div class="metric-card-header">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 19h8a4 4 0 0 0 3.8-2.7 4 4 0 0 0-1.6-4.5A4.5 4.5 0 0 0 17 4a4.5 4.5 0 0 0-4.3 3.1A4.5 4.5 0 0 0 8 11a4.5 4.5 0 0 0-2 4 4 4 0 0 0 2 4z"/></svg>
          <span class="metric-title">Air Quality (AQI)</span>
        </div>
        <div class="aqi-metric-body">
          <div class="aqi-score-box">
            <span class="aqi-number" style="color: ${aqiInfo.color};">${aqiInfo.score}</span>
            <span class="aqi-status-chip" style="background-color: ${aqiInfo.color}25; color: ${aqiInfo.color}; border: 1px solid ${aqiInfo.color}50;">
              ${aqiInfo.label}
            </span>
          </div>
          <div class="aqi-pollutants-list">
            <div class="pollutant-row">
              <span>PM2.5</span>
              <strong>${pm25} µg/m³</strong>
            </div>
            <div class="pollutant-row">
              <span>PM10</span>
              <strong>${pm10} µg/m³</strong>
            </div>
          </div>
        </div>
      </div>

      <!-- 5. HUMIDITY & DEW POINT CARD -->
      <div class="glass-card metric-card humidity-card">
        <div class="metric-card-header">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
          <span class="metric-title">Humidity</span>
        </div>
        <div class="humidity-metric-body">
          <div class="humidity-val-row">
            <span class="big-metric-num">${humidity}%</span>
            <span class="humidity-comfort-badge">${humidityComfort}</span>
          </div>
          <div class="dew-point-row">
            <span>The dew point is <strong>${dewPointDisplay}</strong></span>
          </div>
        </div>
      </div>

      <!-- 6. PRESSURE CARD -->
      <div class="glass-card metric-card pressure-card">
        <div class="metric-card-header">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m16 12-4-4-4 4M12 8v8"/></svg>
          <span class="metric-title">Pressure</span>
        </div>
        <div class="pressure-metric-body">
          <div class="pressure-val-row">
            <span class="big-metric-num">${pressureDisplay}</span>
          </div>
          <div class="pressure-desc-row">
            <span class="pressure-trend-tag">${pressureTrend}</span>
          </div>
        </div>
      </div>

      <!-- 7. VISIBILITY CARD -->
      <div class="glass-card metric-card visibility-card">
        <div class="metric-card-header">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          <span class="metric-title">Visibility</span>
        </div>
        <div class="visibility-metric-body">
          <div class="visibility-val-row">
            <span class="big-metric-num">${visibilityDisplay}</span>
          </div>
          <div class="visibility-desc-row">
            <span>${visibilityDesc}</span>
          </div>
        </div>
      </div>
    </div>
  `;
}
