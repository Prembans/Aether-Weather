/**
 * Hero Current Weather Card Component with Prominent Split Action Favorite Button & Manage Menu
 */
import { getWeatherIconSVG } from './weatherIcons.js';
import { getWeatherMeta } from '../utils/weatherCodes.js';
import { formatTemp, formatDate, formatTime } from '../utils/formatters.js';

export function renderCurrentWeather(
  container,
  {
    city,
    weather,
    unit,
    is24h,
    isFav,
    favorites = [],
    onToggleFav,
    onSelectCity,
    onRemoveFav,
    onClearAllFavs,
  }
) {
  if (!weather || !weather.current) {
    container.innerHTML = `<div class="glass-card loading-skeleton">Loading current weather...</div>`;
    return;
  }

  const current = weather.current;
  const daily = weather.daily || {};
  const meta = getWeatherMeta(current.weather_code, current.is_day);

  const tempVal = formatTemp(current.temperature_2m, unit);
  const feelsLikeVal = formatTemp(current.apparent_temperature, unit);
  const maxTempVal = daily.temperature_2m_max ? formatTemp(daily.temperature_2m_max[0], unit) : '--';
  const minTempVal = daily.temperature_2m_min ? formatTemp(daily.temperature_2m_min[0], unit) : '--';

  const localTime = formatTime(current.time, weather.timezone, is24h);
  const formattedDate = formatDate(current.time, weather.timezone);

  // Dynamic context highlight tip
  let highlightBadge = '';
  if (current.weather_code >= 95) {
    highlightBadge = `<div class="weather-alert-badge alert-storm"><span class="badge-dot"></span> Thunderstorm Warning</div>`;
  } else if (current.weather_code >= 61 && current.weather_code <= 82) {
    highlightBadge = `<div class="weather-alert-badge alert-rain"><span class="badge-dot"></span> Active Precipitation</div>`;
  } else if (daily.uv_index_max && daily.uv_index_max[0] >= 7) {
    highlightBadge = `<div class="weather-alert-badge alert-uv"><span class="badge-dot"></span> High UV Today</div>`;
  } else if (current.wind_speed_10m > 35) {
    highlightBadge = `<div class="weather-alert-badge alert-wind"><span class="badge-dot"></span> Gusty Winds</div>`;
  } else {
    highlightBadge = `<div class="weather-alert-badge alert-optimal"><span class="badge-dot"></span> Ideal Conditions</div>`;
  }

  // Favorites popup items HTML
  const favCount = favorites.length;
  let favItemsHtml = '';
  if (favCount === 0) {
    favItemsHtml = `<div class="fav-popup-empty">No favorites saved yet. Click <strong>Save to Favorites</strong> to bookmark ${city.name}.</div>`;
  } else {
    favItemsHtml = favorites
      .map((fav) => {
        const isCurrentCity =
          fav.id === city.id ||
          (Math.abs(fav.latitude - city.latitude) < 0.05 && Math.abs(fav.longitude - city.longitude) < 0.05);

        return `
          <div class="fav-popup-item ${isCurrentCity ? 'is-current' : ''}" data-id="${fav.id || fav.name}">
            <div class="fav-popup-city-info" title="Switch to ${fav.name}">
              <strong class="fav-popup-city-name">${fav.name}</strong>
              <span class="fav-popup-country">${fav.country}</span>
            </div>
            <button class="fav-popup-btn-del" data-id="${fav.id || fav.name}" title="Remove from favorites" aria-label="Remove ${fav.name}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        `;
      })
      .join('');
  }

  container.innerHTML = `
    <div class="glass-card hero-card">
      <div class="hero-header">
        <div class="location-group">
          <div class="city-title-row">
            <h1 class="city-name" id="current-city-name">${city.name}</h1>
          </div>
          <div class="location-details">
            <span class="country-name">${city.admin1 ? city.admin1 + ', ' : ''}${city.country}</span>
            <span class="dot-separator">•</span>
            <span class="local-time" id="hero-local-time">${formattedDate}, ${localTime}</span>
          </div>
        </div>

        <div class="hero-header-actions">
          ${highlightBadge}

          <!-- Prominent Split Action Favorite Button -->
          <div class="split-fav-btn-wrapper">
            <button class="btn-split-main ${isFav ? 'is-favorited' : ''}" id="btn-toggle-favorite-main" title="${isFav ? 'Click to remove from favorites' : 'Save this city to favorites'}">
              <svg class="heart-icon" width="18" height="18" viewBox="0 0 24 24" fill="${isFav ? '#F43F5E' : 'none'}" stroke="${isFav ? '#F43F5E' : 'currentColor'}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
              <span class="btn-fav-label">${isFav ? 'Favorited' : 'Save to Favorites'}</span>
            </button>
            <button class="btn-split-chevron" id="btn-fav-dropdown-toggle" title="Manage all saved favorites" aria-label="Toggle favorites menu">
              ${favCount > 0 ? `<span class="fav-count-badge">${favCount}</span>` : ''}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
            </button>

            <!-- Favorites Management Popup Dropdown -->
            <div class="fav-manage-popup hidden" id="fav-manage-popup">
              <div class="fav-popup-header">
                <span class="fav-popup-title">Saved Favorites (${favCount})</span>
                ${favCount > 0 ? `<button class="btn-clear-all-favs" id="btn-clear-all-favs">Clear All</button>` : ''}
              </div>
              <div class="fav-popup-list">
                ${favItemsHtml}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="hero-body">
        <div class="temp-section">
          <div class="temp-display">
            <span class="temp-number" id="current-temp">${tempVal}</span>
          </div>
          <div class="feels-like-pill">
            <span>Feels like</span>
            <strong>${feelsLikeVal}</strong>
          </div>
        </div>

        <div class="condition-section">
          <div class="hero-icon-wrapper">
            ${getWeatherIconSVG(meta.icon, 68)}
          </div>
          <div class="condition-text-group">
            <h2 class="condition-title">${meta.label}</h2>
            <p class="condition-desc">${meta.description}</p>
          </div>
        </div>
      </div>

      <div class="hero-footer">
        <div class="hi-lo-pill">
          <span class="pill-label">Today's Range</span>
          <span class="lo-temp">↓ ${minTempVal}</span>
          <div class="mini-range-bar"></div>
          <span class="hi-temp">↑ ${maxTempVal}</span>
        </div>

        <div class="quick-status-items">
          <div class="quick-stat">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            <span>Humidity: <strong>${current.relative_humidity_2m}%</strong></span>
          </div>
          <div class="quick-stat">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/></svg>
            <span>Wind: <strong>${Math.round(current.wind_speed_10m)} km/h</strong></span>
          </div>
        </div>
      </div>
    </div>
  `;

  // Event Listeners for Split Button & Popup
  const mainFavBtn = container.querySelector('#btn-toggle-favorite-main');
  const chevronBtn = container.querySelector('#btn-fav-dropdown-toggle');
  const popup = container.querySelector('#fav-manage-popup');
  const clearAllBtn = container.querySelector('#btn-clear-all-favs');

  if (mainFavBtn && onToggleFav) {
    mainFavBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      onToggleFav(city);
    });
  }

  if (chevronBtn && popup) {
    chevronBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      popup.classList.toggle('hidden');
    });

    // Close on click outside
    const handleOutsideClick = (e) => {
      if (!popup.contains(e.target) && !chevronBtn.contains(e.target)) {
        popup.classList.add('hidden');
      }
    };
    document.addEventListener('click', handleOutsideClick);
  }

  // Click on popup city item to load city
  popup.querySelectorAll('.fav-popup-city-info').forEach((itemElem) => {
    itemElem.addEventListener('click', (e) => {
      e.stopPropagation();
      const parent = itemElem.closest('.fav-popup-item');
      const id = parent.getAttribute('data-id');
      const favCity = favorites.find((f) => (f.id || f.name).toString() === id);
      if (favCity && onSelectCity) {
        popup.classList.add('hidden');
        onSelectCity(favCity);
      }
    });
  });

  // Delete button inside popup
  popup.querySelectorAll('.fav-popup-btn-del').forEach((delBtn) => {
    delBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = delBtn.getAttribute('data-id');
      const favCity = favorites.find((f) => (f.id || f.name).toString() === id);
      if (favCity && onRemoveFav) {
        onRemoveFav(favCity);
      }
    });
  });

  // Clear all button
  if (clearAllBtn && onClearAllFavs) {
    clearAllBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      onClearAllFavs();
    });
  }
}
