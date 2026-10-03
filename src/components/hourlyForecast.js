/**
 * 24-Hour Forecast Component with Interactive Cards & Temperature Trendline Chart
 */
import { getWeatherIconSVG } from './weatherIcons.js';
import { getWeatherMeta } from '../utils/weatherCodes.js';
import { formatTemp, formatTempNumber, formatTime } from '../utils/formatters.js';

export function renderHourlyForecast(container, { weather, unit, is24h }) {
  if (!weather || !weather.hourly) {
    container.innerHTML = `<div class="glass-card loading-skeleton">Loading hourly forecast...</div>`;
    return;
  }

  const hourly = weather.hourly;
  const currentTimeISO = weather.current.time;

  // Find the index closest to current hour
  let startIndex = 0;
  if (hourly.time && hourly.time.length > 0) {
    const now = new Date(currentTimeISO).getTime();
    startIndex = hourly.time.findIndex((t) => new Date(t).getTime() >= now);
    if (startIndex === -1) startIndex = 0;
  }

  // Slice next 24 hours
  const hours = [];
  const count = Math.min(24, hourly.time.length - startIndex);
  for (let i = 0; i < count; i++) {
    const idx = startIndex + i;
    hours.push({
      time: hourly.time[idx],
      isFirst: i === 0,
      temp: hourly.temperature_2m[idx],
      apparentTemp: hourly.apparent_temperature ? hourly.apparent_temperature[idx] : hourly.temperature_2m[idx],
      weatherCode: hourly.weather_code[idx],
      precipProb: hourly.precipitation_probability ? hourly.precipitation_probability[idx] : 0,
      isDay: hourly.is_day ? hourly.is_day[idx] : 1,
      windSpeed: hourly.wind_speed_10m ? hourly.wind_speed_10m[idx] : 0,
    });
  }

  // Generate HTML for horizontal cards
  const cardsHtml = hours
    .map((h, index) => {
      const meta = getWeatherMeta(h.weatherCode, h.isDay);
      const timeLabel = h.isFirst ? 'Now' : formatTime(h.time, weather.timezone, is24h);
      const tempDisplay = formatTemp(h.temp, unit);
      const rainBadge =
        h.precipProb > 10
          ? `<span class="precip-pill"><svg width="10" height="10" viewBox="0 0 24 24" fill="#38BDF8"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>${h.precipProb}%</span>`
          : '<span class="precip-pill precip-empty"></span>';

      return `
        <div class="hourly-card ${h.isFirst ? 'is-current-hour' : ''}" data-index="${index}">
          <span class="hour-time">${timeLabel}</span>
          <div class="hour-icon">
            ${getWeatherIconSVG(meta.icon, 36)}
          </div>
          <span class="hour-temp">${tempDisplay}</span>
          ${rainBadge}
        </div>
      `;
    })
    .join('');

  container.innerHTML = `
    <div class="glass-card hourly-section-card">
      <div class="section-header-row">
        <div class="section-title-group">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <h2 class="section-title">Hourly Forecast</h2>
        </div>
        <div class="hourly-controls">
          <button class="view-toggle-btn active" id="btn-view-cards" title="Show cards">Cards</button>
          <button class="view-toggle-btn" id="btn-view-chart" title="Show trendline curve">Trendline</button>
        </div>
      </div>

      <div class="hourly-carousel-wrapper" id="hourly-cards-track">
        <div class="hourly-track">
          ${cardsHtml}
        </div>
      </div>

      <div class="hourly-chart-container hidden" id="hourly-chart-wrapper">
        <canvas id="hourly-trend-canvas"></canvas>
        <div class="chart-tooltip hidden" id="chart-tooltip"></div>
      </div>
    </div>
  `;

  // Setup tab toggles
  const cardsBtn = container.querySelector('#btn-view-cards');
  const chartBtn = container.querySelector('#btn-view-chart');
  const cardsWrapper = container.querySelector('#hourly-cards-track');
  const chartWrapper = container.querySelector('#hourly-chart-wrapper');
  const canvas = container.querySelector('#hourly-trend-canvas');

  let chartInitialized = false;

  const showCards = () => {
    cardsBtn.classList.add('active');
    chartBtn.classList.remove('active');
    cardsWrapper.classList.remove('hidden');
    chartWrapper.classList.add('hidden');
  };

  const showChart = () => {
    chartBtn.classList.add('active');
    cardsBtn.classList.remove('active');
    cardsWrapper.classList.add('hidden');
    chartWrapper.classList.remove('hidden');
    renderHourlyChart(canvas, hours, unit, weather.timezone, is24h);
    chartInitialized = true;
  };

  cardsBtn.addEventListener('click', showCards);
  chartBtn.addEventListener('click', showChart);

  // Re-draw chart on window resize if visible
  window.addEventListener('resize', () => {
    if (chartInitialized && !chartWrapper.classList.contains('hidden')) {
      renderHourlyChart(canvas, hours, unit, weather.timezone, is24h);
    }
  });
}

/**
 * Render smooth Canvas Bézier Curve for hourly temperatures
 */
function renderHourlyChart(canvas, hours, unit, timezone, is24h) {
  if (!canvas || !hours || hours.length === 0) return;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const rect = canvas.parentElement.getBoundingClientRect();
  const width = rect.width || 600;
  const height = 140;

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  const temps = hours.map((h) => formatTempNumber(h.temp, unit));
  const minTemp = Math.min(...temps) - 2;
  const maxTemp = Math.max(...temps) + 2;
  const tempRange = maxTemp - minTemp || 1;

  const paddingLeft = 40;
  const paddingRight = 40;
  const paddingTop = 35;
  const paddingBottom = 40;

  const chartW = width - paddingLeft - paddingRight;
  const chartH = height - paddingTop - paddingBottom;

  const getX = (i) => paddingLeft + (i / (hours.length - 1)) * chartW;
  const getY = (temp) => height - paddingBottom - ((temp - minTemp) / tempRange) * chartH;

  // Background subtle grid lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  for (let step = 0; step <= 3; step++) {
    const yVal = paddingTop + (chartH / 3) * step;
    ctx.beginPath();
    ctx.moveTo(paddingLeft, yVal);
    ctx.lineTo(width - paddingRight, yVal);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  // Generate curve path
  const points = hours.map((h, i) => ({
    x: getX(i),
    y: getY(formatTempNumber(h.temp, unit)),
  }));

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? i : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
  }

  // Gradient area fill under curve
  const fillGrad = ctx.createLinearGradient(0, paddingTop, 0, height - paddingBottom);
  fillGrad.addColorStop(0, 'rgba(56, 189, 248, 0.35)');
  fillGrad.addColorStop(0.7, 'rgba(56, 189, 248, 0.08)');
  fillGrad.addColorStop(1, 'rgba(56, 189, 248, 0.0)');

  ctx.save();
  ctx.lineTo(points[points.length - 1].x, height - paddingBottom);
  ctx.lineTo(points[0].x, height - paddingBottom);
  ctx.closePath();
  ctx.fillStyle = fillGrad;
  ctx.fill();
  ctx.restore();

  // Draw smooth line
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? i : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
  }
  ctx.strokeStyle = '#38BDF8';
  ctx.lineWidth = 3;
  ctx.shadowColor = 'rgba(56, 189, 248, 0.5)';
  ctx.shadowBlur = 8;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Draw points & temperature labels for key intervals (every 3 hours)
  ctx.font = '600 12px "Outfit", sans-serif';
  ctx.textAlign = 'center';

  hours.forEach((h, i) => {
    if (i % 3 === 0 || i === hours.length - 1) {
      const pt = points[i];
      const tempStr = `${temps[i]}°`;
      const timeStr = h.isFirst ? 'Now' : formatTime(h.time, timezone, is24h);

      // Dot
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.strokeStyle = '#0284C7';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Temp text
      ctx.fillStyle = '#F8FAFC';
      ctx.fillText(tempStr, pt.x, pt.y - 10);

      // Time label text at bottom
      ctx.fillStyle = '#94A3B8';
      ctx.fillText(timeStr, pt.x, height - 12);
    }
  });
}
