/**
 * 7-Day Extended Forecast Component with Proportional Temperature Range Bars
 */
import { getWeatherIconSVG } from './weatherIcons.js';
import { getWeatherMeta } from '../utils/weatherCodes.js';
import { formatTemp, formatTempNumber, formatDay } from '../utils/formatters.js';

export function renderDailyForecast(container, { weather, unit }) {
  if (!weather || !weather.daily) {
    container.innerHTML = `<div class="glass-card loading-skeleton">Loading 7-day forecast...</div>`;
    return;
  }

  const daily = weather.daily;
  const current = weather.current;
  const daysCount = Math.min(7, daily.time.length);

  // Calculate week-wide min and max for proportional range bar calculation
  const allMins = daily.temperature_2m_min.slice(0, daysCount).map((t) => formatTempNumber(t, unit));
  const allMaxs = daily.temperature_2m_max.slice(0, daysCount).map((t) => formatTempNumber(t, unit));
  const weekMin = Math.min(...allMins);
  const weekMax = Math.max(...allMaxs);
  const weekRange = weekMax - weekMin || 1;

  const currentTempNumber = formatTempNumber(current.temperature_2m, unit);

  const daysHtml = [];
  for (let i = 0; i < daysCount; i++) {
    const time = daily.time[i];
    const isFirst = i === 0;
    const dayLabel = formatDay(time, weather.timezone, isFirst);
    const code = daily.weather_code[i];
    const meta = getWeatherMeta(code, 1);

    const minT = allMins[i];
    const maxT = allMaxs[i];
    const minDisplay = formatTemp(daily.temperature_2m_min[i], unit);
    const maxDisplay = formatTemp(daily.temperature_2m_max[i], unit);

    const precipProb = daily.precipitation_probability_max ? daily.precipitation_probability_max[i] : 0;

    // Calculate proportional left and width percentages
    const leftPercent = Math.max(0, Math.min(95, ((minT - weekMin) / weekRange) * 100));
    const rightPercent = Math.max(5, Math.min(100, ((maxT - weekMin) / weekRange) * 100));
    const barWidth = Math.max(6, rightPercent - leftPercent);

    // If today, calculate current temp dot position
    let currentDotHtml = '';
    if (isFirst) {
      const dotPercent = Math.max(0, Math.min(100, ((currentTempNumber - minT) / (maxT - minT || 1)) * 100));
      currentDotHtml = `<span class="current-temp-dot" style="left: ${dotPercent}%;" title="Current: ${currentTempNumber}°"></span>`;
    }

    const rainBadge =
      precipProb > 15
        ? `<div class="daily-precip-badge">
             <svg width="10" height="10" viewBox="0 0 24 24" fill="#38BDF8"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
             <span>${precipProb}%</span>
           </div>`
        : `<div class="daily-precip-badge empty"></div>`;

    daysHtml.push(`
      <div class="daily-row ${isFirst ? 'is-today-row' : ''}">
        <span class="day-name">${dayLabel}</span>
        <div class="day-icon-group">
          ${getWeatherIconSVG(meta.icon, 30)}
          ${rainBadge}
        </div>
        <div class="temp-range-container">
          <span class="range-min-temp">${minDisplay}</span>
          <div class="range-track">
            <div class="range-bar" style="left: ${leftPercent}%; width: ${barWidth}%;">
              ${currentDotHtml}
            </div>
          </div>
          <span class="range-max-temp">${maxDisplay}</span>
        </div>
      </div>
    `);
  }

  container.innerHTML = `
    <div class="glass-card daily-forecast-card">
      <div class="section-header-row">
        <div class="section-title-group">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          <h2 class="section-title">7-Day Forecast</h2>
        </div>
      </div>
      <div class="daily-rows-list">
        ${daysHtml.join('')}
      </div>
    </div>
  `;
}
